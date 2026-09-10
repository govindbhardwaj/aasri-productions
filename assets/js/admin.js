/* =============================================================
   admin.js — Aasri Productions studio admin
   -------------------------------------------------------------
   Firebase Auth (email/password) gate, an inquiries inbox, and a
   guided editor over the site/content document. Everything the
   guided tabs write is a *patch*: only the keys you actually edit
   are stored, so untouched copy keeps following data.js.
   ============================================================= */
import { getAuthModule } from "./store.js";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const DEFAULTS = window.BDM_DEFAULT_CONTENT;
const PATHS    = window.BDM_PATHS;

let fb = null;          // { app, fs, auth, authInstance }
let db = null;
let draft = {};         // the stored patch (what we publish)
let inquiries = [];

/* ------------------------------------------------------------ helpers */
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function set(obj, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  let node = obj;
  for (const k of keys) {
    if (!node[k] || typeof node[k] !== "object") node[k] = {};
    node = node[k];
  }
  node[last] = value;
}
function unset(obj, path) {
  const keys = path.split(".");
  const last = keys.pop();
  let node = obj;
  for (const k of keys) { if (!node[k]) return; node = node[k]; }
  delete node[last];
}
function prune(o) {                      // drop empty branches from the patch
  if (!o || typeof o !== "object" || Array.isArray(o)) return o;
  for (const k of Object.keys(o)) {
    prune(o[k]);
    if (o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) && !Object.keys(o[k]).length) delete o[k];
  }
  return o;
}

function banner(host, kind, html) {
  const el = typeof host === "string" ? $(host) : host;
  if (el) el.innerHTML = `<div class="banner banner--${kind}">${html}</div>`;
}
function status(msg, kind = "") {
  const el = $("#saveStatus");
  el.textContent = msg;
  el.style.color = kind === "err" ? "var(--err)" : kind === "ok" ? "var(--ok)" : "";
}

/* Accepts a full YouTube URL (watch/youtu.be/embed/shorts), or a bare
   11-character video ID, and returns just the ID. Anything else is left
   alone rather than guessed at. */
function extractYouTubeId(raw) {
  const s = String(raw ?? "").trim();
  const m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : s;
}

/* A Google Drive "share" link (drive.google.com/file/d/<id>/view) opens an
   HTML viewer page, not the image itself, so <img src> can't load it. Drive's
   thumbnail endpoint serves the real file instead — rewrite share links to
   that automatically. Anything that isn't a Drive link passes through as-is. */
function driveDirectUrl(raw) {
  const s = String(raw ?? "").trim();
  if (!/drive\.google\.com/.test(s)) return s;
  const m = s.match(/\/file\/d\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600` : s;
}

let dirty = false;
function markDirty() {
  dirty = true;
  status("Unpublished changes");
}
window.addEventListener("beforeunload", (e) => {
  if (dirty) { e.preventDefault(); e.returnValue = ""; }
});

/* =========================================================== 1. BOOT */
(async function boot() {
  if (!window.BDM_FIREBASE_READY) {
    $("#gate").hidden = false;
    $("#loginForm").hidden = true;
    banner("#gateBanner", "err",
      "<b>Firebase is not configured yet.</b><br>Open <code>assets/js/firebase-config.js</code> and paste " +
      "the config from your Firebase project (Project settings &rarr; Your apps &rarr; Web app). " +
      "See <code>README.md</code> for the full 10-minute setup, including the Firestore rules.");
    return;
  }

  fb = await getAuthModule();
  if (!fb) {
    $("#gate").hidden = false;
    banner("#gateBanner", "err", "Could not reach Firebase. Check your connection and the config values.");
    return;
  }
  db = fb.fs.getFirestore(fb.app);

  fb.auth.onAuthStateChanged(fb.authInstance, async (user) => {
    if (user) {
      $("#gate").hidden = true;
      $("#app").hidden = false;
      $("#who").textContent = user.email;
      await loadContent();
      buildEditors();
      await loadInquiries();
    } else {
      $("#app").hidden = true;
      $("#gate").hidden = false;
    }
  });

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#loginBtn");
    btn.disabled = true; btn.textContent = "Signing in…";
    $("#gateBanner").innerHTML = "";
    try {
      await fb.auth.signInWithEmailAndPassword(fb.authInstance, $("#lEmail").value.trim(), $("#lPass").value);
    } catch (err) {
      const code = (err && err.code) || "";
      banner("#gateBanner", "err",
        /invalid-credential|wrong-password|user-not-found/.test(code)
          ? "That email and password combination was not recognised."
          : /too-many-requests/.test(code)
            ? "Too many attempts. Wait a moment and try again."
            : "Sign-in failed: " + esc(code || err.message));
    } finally {
      btn.disabled = false; btn.textContent = "Sign in";
    }
  });

  $("#logout").addEventListener("click", () => {
    if (dirty && !confirm("You have unpublished changes. Sign out anyway?")) return;
    dirty = false;
    fb.auth.signOut(fb.authInstance);
  });
})();

/* ======================================================== 2. CONTENT */
/* Cleans up links saved before driveDirectUrl()/extractYouTubeId() existed
   (or pasted straight into the Advanced/JSON tab, which bypasses both).
   Runs once on load so a stale broken link fixes itself the moment the
   panel opens, rather than only on the next time someone retypes it. */
function normalizeMediaLinks(d) {
  let changed = false;
  const fix = (obj, key, fn) => {
    if (!obj || typeof obj[key] !== "string" || !obj[key]) return;
    const v = fn(obj[key]);
    if (v !== obj[key]) { obj[key] = v; changed = true; }
  };
  const each = (arr, key, fn) => { if (Array.isArray(arr)) arr.forEach((it) => fix(it, key, fn)); };

  if (d.hero) fix(d.hero, "poster", driveDirectUrl);
  if (d.films && d.films.featured) fix(d.films.featured, "youtube", extractYouTubeId);
  each(d.films && d.films.items, "youtube", extractYouTubeId);
  if (d.loveLetters) {
    fix(d.loveLetters, "filmYoutube", extractYouTubeId);
    each(d.loveLetters.items, "img", driveDirectUrl);
  }
  each(d.gallery && d.gallery.items, "src", driveDirectUrl);
  each(d.reels && d.reels.items, "poster", driveDirectUrl);
  each(d.stories, "img", driveDirectUrl);
  each(d.services && d.services.items, "img", driveDirectUrl);

  return changed;
}

async function loadContent() {
  const [col, doc] = PATHS.contentDoc;
  try {
    const snap = await fb.fs.getDoc(fb.fs.doc(db, col, doc));
    draft = snap.exists() ? snap.data() : {};
  } catch (err) {
    draft = {};
    status("Could not load saved content: " + (err.code || err.message), "err");
  }
  if (normalizeMediaLinks(draft)) {
    markDirty();
    status("Fixed a Google Drive or YouTube link that wasn't in the right format — click Publish to save the fix.", "ok");
  }
  $("#jsonBox").value = JSON.stringify(draft, null, 2);
}

async function publish() {
  const btn = $("#saveBtn");
  btn.disabled = true; status("Publishing…");

  /* The Advanced tab wins if it has been edited into invalid-free JSON */
  if (!$("#p-json").hidden) {
    try {
      draft = JSON.parse($("#jsonBox").value || "{}");
      $("#jsonBanner").innerHTML = "";
    } catch (err) {
      banner("#jsonBanner", "err", "That is not valid JSON: " + esc(err.message));
      btn.disabled = false; status("Not published — fix the JSON first", "err");
      return;
    }
  }

  prune(draft);
  const [col, doc] = PATHS.contentDoc;
  try {
    await fb.fs.setDoc(fb.fs.doc(db, col, doc), {
      ...draft,
      updatedAt: fb.fs.serverTimestamp(),
      updatedBy: fb.authInstance.currentUser ? fb.authInstance.currentUser.email : ""
    });
    $("#jsonBox").value = JSON.stringify(draft, null, 2);
    dirty = false;
    status("Published — the website is updated", "ok");
  } catch (err) {
    status("Publish failed: " + (err.code || err.message), "err");
  } finally {
    btn.disabled = false;
  }
}

/* ==================================================== 3. FIELD BUILDER */
/* Each control writes straight into `draft` at its dot-path. Clearing a
   control removes the key, so the site falls back to the default copy. */

function field({ path, label, hint, type = "text", rows = 3, options }) {
  const id = "f_" + path.replace(/[^\w]/g, "_");
  const current = get(draft, path);
  const shown = current !== undefined ? current : get(DEFAULTS, path);
  const val = esc(shown ?? "");
  const overridden = current !== undefined;

  let control;
  if (type === "textarea") {
    control = `<textarea id="${id}" data-path="${esc(path)}" rows="${rows}">${val}</textarea>`;
  } else if (type === "select") {
    const sel = typeof shown === "boolean" ? (shown ? "yes" : "no") : String(shown ?? "");
    control = `<select id="${id}" data-path="${esc(path)}">` +
      options.map((o) => `<option value="${esc(o)}"${sel === String(o) ? " selected" : ""}>${esc(o)}</option>`).join("") +
      "</select>";
  } else {
    control = `<input id="${id}" data-path="${esc(path)}" type="${type}" value="${val}">`;
  }

  return `<div class="f${type === "textarea" ? " span" : ""}">
    <label for="${id}">${esc(label)}${overridden ? ' <span style="color:var(--champagne)">•</span>' : ""}</label>
    ${control}
    ${hint ? `<p class="hint">${hint}</p>` : ""}
  </div>`;
}

/* Repeating list: the whole array is replaced when any row changes. */
function listEditor({ path, label, lead, itemLabel, fields, defaults }) {
  const raw  = get(draft, path) !== undefined ? get(draft, path) : get(DEFAULTS, path) || [];
  const rows = decorate(path, raw);
  const body = rows.map((row, i) => `
    <div class="item" data-row="${i}">
      <div class="item__head">
        <b>${esc(itemLabel)} ${i + 1}</b>
        <button class="btn btn--ghost btn--sm" type="button" data-move="${i}" data-dir="-1" ${i === 0 ? "disabled" : ""} aria-label="Move up">&uarr;</button>
        <button class="btn btn--ghost btn--sm" type="button" data-move="${i}" data-dir="1" ${i === rows.length - 1 ? "disabled" : ""} aria-label="Move down">&darr;</button>
        <button class="btn btn--danger btn--sm" type="button" data-del="${i}">Remove</button>
      </div>
      <div class="grid2">
        ${fields.map((f) => {
          const id = `l_${path.replace(/\W/g, "_")}_${i}_${f.k}`;
          const v = esc(row[f.k] ?? "");
          const ctl = f.type === "textarea"
            ? `<textarea id="${id}" data-list="${esc(path)}" data-i="${i}" data-k="${esc(f.k)}" rows="${f.rows || 3}">${v}</textarea>`
            : f.type === "select"
            ? `<select id="${id}" data-list="${esc(path)}" data-i="${i}" data-k="${esc(f.k)}">` +
              f.options.map((o) => `<option value="${esc(o)}"${String(row[f.k] ?? "") === o ? " selected" : ""}>${esc(o)}</option>`).join("") +
              "</select>"
            : `<input id="${id}" data-list="${esc(path)}" data-i="${i}" data-k="${esc(f.k)}" type="${f.type || "text"}" value="${v}">`;
          return `<div class="f${f.type === "textarea" || f.wide ? " span" : ""}">
            <label for="${id}">${esc(f.label)}</label>${ctl}
            ${f.hint ? `<p class="hint">${f.hint}</p>` : ""}</div>`;
        }).join("")}
      </div>
    </div>`).join("") || `<p class="empty">Nothing here yet.</p>`;

  return `<div class="card" data-list-card="${esc(path)}" data-defaults='${esc(JSON.stringify(defaults || {}))}'>
    <h2>${esc(label)}</h2>
    ${lead ? `<p class="lead">${lead}</p>` : ""}
    <div data-rows>${body}</div>
    <button class="btn btn--ghost btn--sm" type="button" data-add>+ Add ${esc(itemLabel.toLowerCase())}</button>
  </div>`;
}

/* --------------------------------------------------- editor definitions */
function buildEditors() {
  /* --- Website content ------------------------------------------------ */
  $("#contentForms").innerHTML = `
    <div class="card">
      <h2>Studio details</h2>
      <p class="lead">Used across the header, contact section, footer and the search-engine listing.</p>
      <div class="grid2">
        ${field({ path: "business.name", label: "Business name" })}
        ${field({ path: "business.tagline", label: "Tagline" })}
        ${field({ path: "business.phone", label: "Phone (displayed)" })}
        ${field({ path: "business.phoneHref", label: "Phone (dial link)", hint: "Format: tel:+13234472333" })}
        ${field({ path: "business.email", label: "Email", hint: "Leave blank and the email lines stay hidden." })}
        ${field({ path: "business.startingAt", label: "Starting price" })}
        ${field({ path: "business.studioName", label: "Studio name" })}
        ${field({ path: "business.studioNote", label: "Studio note" })}
        ${field({ path: "business.city", label: "City / region" })}
        ${field({ path: "business.streetAddress", label: "Street address" })}
        ${field({ path: "business.social.instagram", label: "Instagram URL" })}
        ${field({ path: "business.social.youtube", label: "YouTube URL" })}
        ${field({ path: "business.social.facebook", label: "Facebook URL" })}
      </div>
    </div>

    <div class="card">
      <h2>Hero</h2>
      <p class="lead">The opening screen. Keep the three headline lines short — they are set very large.</p>
      <div class="grid2">
        ${field({ path: "hero.eyebrow", label: "Eyebrow line" })}
        ${field({ path: "hero.headlineTop", label: "Headline line 1" })}
        ${field({ path: "hero.headlineEm", label: "Headline line 2 (italic accent)" })}
        ${field({ path: "hero.headlineBottom", label: "Headline line 3" })}
        ${field({ path: "hero.sub", label: "Supporting sentence", type: "textarea" })}
        ${field({ path: "hero.video", label: "Hero video file", hint: "A path inside assets/video/, or a full URL to an MP4." })}
        ${field({ path: "hero.poster", label: "Hero poster image", hint: "A photo link, or a local assets/img/... path. Google Drive share links work too." })}
      </div>
    </div>

    <div class="card">
      <h2>Brand statement</h2>
      <div class="grid2">
        ${field({ path: "manifesto.lead", label: "Large statement", type: "textarea", rows: 2 })}
        ${field({ path: "manifesto.body", label: "Supporting paragraph", type: "textarea", rows: 4 })}
      </div>
    </div>

    <div class="card">
      <h2>About the studio</h2>
      <div class="grid2">
        ${field({ path: "about.eyebrow", label: "Eyebrow" })}
        ${field({ path: "about.title", label: "Heading", hint: "Use a line break for the second line." , type: "textarea", rows: 2 })}
      </div>
      <p class="hint" style="margin-bottom:.6rem">Paragraphs — one per line.</p>
      <div class="f span">
        <textarea id="aboutBody" rows="6">${esc((get(draft, "about.body") || get(DEFAULTS, "about.body") || []).join("\n"))}</textarea>
      </div>
    </div>

    <div class="card">
      <h2>Inquiry section</h2>
      <div class="grid2">
        ${field({ path: "inquire.title", label: "Heading", type: "textarea", rows: 2 })}
        ${field({ path: "inquire.copy", label: "Intro copy", type: "textarea" })}
        ${field({ path: "inquire.submitLabel", label: "Submit button" })}
        ${field({ path: "inquire.successTitle", label: "Thank-you heading" })}
        ${field({ path: "inquire.successCopy", label: "Thank-you copy", type: "textarea" })}
      </div>
    </div>

    <div class="card">
      <h2>Footer</h2>
      <div class="grid2">
        ${field({ path: "footer.statement", label: "Brand statement", type: "textarea" })}
        ${field({ path: "footer.legalName", label: "Legal name" })}
      </div>
    </div>`;

  /* --- Photos & videos -------------------------------------------------- */
  $("#mediaForms").innerHTML = `
    ${listEditor({
      path: "gallery.items", label: "Photo gallery", itemLabel: "Photo",
      lead: "The full portfolio grid. <b>Photo link</b> takes any image URL — your own hosting, " +
            "wherever — or a local <code>assets/img/...</code> path. Paste a Google Drive " +
            "&ldquo;share&rdquo; link and it's converted automatically; just make sure the file's " +
            "sharing is set to &ldquo;Anyone with the link.&rdquo;",
      fields: [
        { k: "src",         label: "Photo link", wide: true, hint: "Paste a link to the image, a Google Drive share link, or a local file path." },
        { k: "cat",         label: "Category", type: "select", options: ["Ceremony", "Couples", "Details", "Celebration"] },
        { k: "orientation", label: "Shape", type: "select", options: ["Landscape", "Portrait"] },
        { k: "alt",         label: "Description (for screen readers)" }
      ],
      defaults: { src: "", w: 900, h: 675, cat: "Ceremony", alt: "" }
    })}

    <div class="card">
      <h2>Featured wedding film</h2>
      <p class="lead">The large player at the top of the films section.</p>
      <div class="grid2">
        ${field({ path: "films.featured.youtube", label: "YouTube link", hint: "Paste the full YouTube URL, a youtu.be link, or just the video ID." })}
        ${field({ path: "films.featured.couple", label: "Couple" })}
        ${field({ path: "films.featured.meta", label: "Wedding type — location" })}
        ${field({ path: "films.featured.note", label: "Note (package, coverage…)" })}
      </div>
    </div>

    ${listEditor({
      path: "films.items", label: "More wedding films", itemLabel: "Film",
      lead: "Shown in the grid beneath the featured film. Nothing loads from YouTube until a visitor presses play. " +
            "The current IDs point at other studios' public uploads as layout placeholders — replace them with your own.",
      fields: [
        { k: "youtube", label: "YouTube link", hint: "Full URL or just the video ID." },
        { k: "couple",  label: "Couple / title" },
        { k: "meta",    label: "Wedding type — location", wide: true }
      ],
      defaults: { youtube: "", couple: "", meta: "" }
    })}

    ${listEditor({
      path: "reels.items", label: "Reels", itemLabel: "Reel",
      lead: "Vertical 9:16 clips. <b>Video link</b> can be a local file in <code>assets/video/</code> or a direct video URL. " +
            "If you'd rather point straight at an Instagram Reel instead of hosting a video file, leave Video link blank and add " +
            "the Instagram permalink — the tile then opens Instagram when pressed.",
      fields: [
        { k: "src",       label: "Video link (optional if Instagram is set)", wide: true },
        { k: "poster",    label: "Poster image link" },
        { k: "caption",   label: "Caption" },
        { k: "instagram", label: "Instagram permalink" }
      ],
      defaults: { id: "", src: "", poster: "", caption: "", instagram: "" }
    })}

    ${listEditor({
      path: "stories", label: "Signature stories", itemLabel: "Story",
      lead: "The horizontal rail of recent projects. The couples shown are stock-photo placeholders, not real clients — replace with your own work.",
      fields: [
        { k: "couple",   label: "Couple" },
        { k: "type",     label: "Wedding type" },
        { k: "location", label: "Location" },
        { k: "pkg",      label: "Package badge" },
        { k: "img",      label: "Photo link", wide: true },
        { k: "slug",     label: "Link (slug or full URL)" }
      ],
      defaults: { couple: "", type: "", location: "", pkg: "Custom", img: "", slug: "" }
    })}

    ${listEditor({
      path: "services.items", label: "Services", itemLabel: "Service",
      lead: "The editorial list. The image shows as a hover preview on desktop.",
      fields: [
        { k: "name", label: "Service name" },
        { k: "img",  label: "Preview photo link" },
        { k: "copy", label: "Description", type: "textarea", rows: 2 }
      ],
      defaults: { name: "", copy: "", img: "" }
    })}`;

  /* --- Packages ------------------------------------------------------- */
  $("#pkgForms").innerHTML = `
    <div class="banner">
      <b>These prices were carried over from the reference site (bigdaymemories.com)
      and are not yet Aasri Productions' own.</b> Replace them with your real pricing
      before launch — visitors treat this section as a commitment.
    </div>
    <div class="card">
      <h2>Packages section</h2>
      <div class="grid2">
        ${field({ path: "packages.eyebrow", label: "Eyebrow" })}
        ${field({ path: "packages.title", label: "Heading", type: "textarea", rows: 2 })}
        ${field({ path: "packages.note", label: "Included in every package", type: "textarea" })}
        ${field({ path: "packages.footnote", label: "Footnote", type: "textarea" })}
      </div>
    </div>
    ${listEditor({
      path: "packages.tiers", label: "Package tiers", itemLabel: "Package",
      lead: "<b>Includes</b> takes one row per line as <code>Label | Value</code>. <b>Add-ons</b> takes one per line. Set <b>Featured</b> to <code>yes</code> on exactly one package to give it the dark, most-popular treatment.",
      fields: [
        { k: "name",      label: "Name" },
        { k: "hours",     label: "Coverage" },
        { k: "price",     label: "Price" },
        { k: "was",       label: "Was (struck through)" },
        { k: "priceNote", label: "Price note" },
        { k: "featured",  label: "Featured (yes / no)" },
        { k: "blurb",     label: "Short description", type: "textarea", rows: 2 },
        { k: "includes",  label: "Includes — one per line, Label | Value", type: "textarea", rows: 6 },
        { k: "addons",    label: "Add-ons — one per line", type: "textarea", rows: 5 }
      ],
      defaults: { id: "", name: "", hours: "", price: "", was: "", priceNote: "", blurb: "", featured: false, includes: [], addons: [] }
    })}`;

  /* --- Love letters --------------------------------------------------- */
  $("#letterForms").innerHTML = `
    <div class="banner">
      The reference website does not publish written client reviews, so the site currently shows
      clearly-labelled placeholder quotes. Replace them here with real reviews and the placeholder
      badge disappears automatically.
    </div>
    <div class="card">
      <h2>Section settings</h2>
      <div class="grid2">
        ${field({ path: "loveLetters.eyebrow", label: "Eyebrow" })}
        ${field({ path: "loveLetters.title", label: "Heading" })}
        ${field({ path: "loveLetters.filmYoutube", label: "Testimonial film — YouTube link", hint: "Full URL or just the video ID." })}
        ${field({ path: "loveLetters.filmLabel", label: "Testimonial film caption" })}
        ${field({ path: "loveLetters.placeholder", label: "Still placeholder copy? (yes / no)", type: "select", options: ["yes", "no"] })}
      </div>
    </div>
    ${listEditor({
      path: "loveLetters.items", label: "Love letters", itemLabel: "Review",
      lead: "Real words from real couples. Keep quotes to two or three sentences — they are set very large.",
      fields: [
        { k: "couple",   label: "Couple" },
        { k: "location", label: "Venue, city" },
        { k: "img",      label: "Photo link" },
        { k: "quote",    label: "Quote", type: "textarea", rows: 4 }
      ],
      defaults: { quote: "", couple: "", location: "", img: "" }
    })}`;

  wireEditors();
}

/* ----------------------------------------------------- editor plumbing */
function wireEditors() {
  /* Plain fields */
  $$("[data-path]").forEach((el) => {
    el.addEventListener("input", () => {
      const p = el.dataset.path;
      let v = el.value;
      if (p === "loveLetters.placeholder") v = v === "yes";
      if (p === "films.featured.youtube" || p === "loveLetters.filmYoutube") v = extractYouTubeId(v);
      if (p === "hero.poster") v = driveDirectUrl(v);
      const def = get(DEFAULTS, p);
      if (v === "" || v === def) unset(draft, p); else set(draft, p, v);
      markDirty();
    });
  });

  /* About body — textarea of paragraphs */
  const ab = $("#aboutBody");
  if (ab) ab.addEventListener("input", () => {
    const arr = ab.value.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!arr.length) unset(draft, "about.body"); else set(draft, "about.body", arr);
    markDirty();
  });

  /* List rows */
  $$("[data-list]").forEach((el) => {
    el.addEventListener("input", () => {
      const p = el.dataset.list, i = +el.dataset.i, k = el.dataset.k;
      const rows = ensureList(p);
      if (p === "gallery.items" && k === "orientation") {
        /* Orientation is a display-only stand-in for w/h — never stored itself. */
        rows[i].w = 900;
        rows[i].h = el.value === "Portrait" ? 1350 : 675;
      } else if (p === "films.items" && k === "youtube") {
        rows[i][k] = extractYouTubeId(el.value);
      } else if (
        /* Photo fields only — reels.items' own "src" is a video file, so it
           is deliberately excluded here and left to coerce() below. */
        (p === "gallery.items" && k === "src") ||
        (p === "reels.items" && k === "poster") ||
        (p === "stories" && k === "img") ||
        (p === "services.items" && k === "img") ||
        (p === "loveLetters.items" && k === "img")
      ) {
        rows[i][k] = driveDirectUrl(el.value);
      } else {
        rows[i][k] = coerce(p, k, el.value);
      }
      set(draft, p, rows);
      markDirty();
    });
  });

  /* Add / remove / reorder */
  $$("[data-list-card]").forEach((card) => {
    const p = card.dataset.listCard;
    card.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      const del = e.target.closest("[data-del]");
      const mv  = e.target.closest("[data-move]");
      if (!add && !del && !mv) return;

      const rows = ensureList(p);
      if (add) rows.push(JSON.parse(card.dataset.defaults || "{}"));
      if (del) {
        if (!confirm("Remove this entry?")) return;
        rows.splice(+del.dataset.del, 1);
      }
      if (mv) {
        const i = +mv.dataset.move, j = i + (+mv.dataset.dir);
        if (j < 0 || j >= rows.length) return;
        [rows[i], rows[j]] = [rows[j], rows[i]];
      }
      set(draft, p, rows);
      markDirty();
      rebuild();
    });
  });
}

/* Package "includes"/"addons" arrive as text; store them as the site expects. */
function coerce(listPath, key, value) {
  if (listPath === "packages.tiers") {
    if (key === "includes") {
      return value.split("\n").map((l) => l.trim()).filter(Boolean)
        .map((l) => { const [a, b] = l.split("|"); return [(a || "").trim(), (b || "").trim()]; });
    }
    if (key === "addons") return value.split("\n").map((l) => l.trim()).filter(Boolean);
    if (key === "featured") return /^(yes|true|1)$/i.test(value.trim());
  }
  return value;
}
/* Render arrays back into the form controls they came from. */
function decorate(listPath, rows) {
  if (listPath === "packages.tiers") {
    return rows.map((r) => ({
      ...r,
      includes: Array.isArray(r.includes) ? r.includes.map((x) => Array.isArray(x) ? x.join(" | ") : x).join("\n") : r.includes,
      addons:   Array.isArray(r.addons) ? r.addons.join("\n") : r.addons,
      featured: r.featured ? "yes" : "no"
    }));
  }
  if (listPath === "gallery.items") {
    return rows.map((r) => ({ ...r, orientation: (r.h || 0) > (r.w || 0) ? "Portrait" : "Landscape" }));
  }
  return rows;
}

function ensureList(p) {
  const cur = get(draft, p);
  if (Array.isArray(cur)) return cur;
  return JSON.parse(JSON.stringify(get(DEFAULTS, p) || []));
}

function rebuild() {
  const active = $$('[role="tab"]').find((t) => t.getAttribute("aria-selected") === "true");
  buildEditors();
  if (active) selectTab(active);
  $("#jsonBox").value = JSON.stringify(draft, null, 2);
}

/* ====================================================== 5. INQUIRIES */
async function loadInquiries() {
  const host = $("#inqList");
  host.innerHTML = `<p class="empty">Loading inquiries…</p>`;
  try {
    const q = fb.fs.query(
      fb.fs.collection(db, PATHS.inquiriesCol),
      fb.fs.orderBy("createdAt", "desc"),
      fb.fs.limit(300)
    );
    const snap = await fb.fs.getDocs(q);
    inquiries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderInquiries();
  } catch (err) {
    host.innerHTML = `<div class="banner banner--err">Could not load inquiries: ${esc(err.code || err.message)}.
      If this says <code>permission-denied</code>, check the Firestore rules in README.md.</div>`;
  }
}

function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function renderInquiries() {
  const filter = $("#inqFilter").value;
  const rows = inquiries.filter((r) => filter === "all" || (r.status || "new") === filter);
  const host = $("#inqList");

  if (!rows.length) {
    host.innerHTML = `<p class="empty">No ${filter === "all" ? "" : filter + " "}inquiries yet.</p>`;
    return;
  }

  host.innerHTML = rows.map((r) => {
    const st = r.status || "new";
    /* Older submissions (before the contact form was simplified) used
       firstName/lastName and weddingDate — fall back to those so past
       inquiries still display correctly. */
    const name = r.name || [r.firstName, r.lastName].filter(Boolean).join(" ") || "(no name)";
    const eventDate = r.eventDate || r.weddingDate;
    return `<article class="inq-row${st === "new" ? " is-new" : ""}">
      <div>
        <p class="inq-name">${esc(name)}</p>
        <p class="inq-meta">${fmtDate(r.createdAt)} &middot; <span class="pill${st === "new" ? " pill--new" : ""}">${esc(st)}</span></p>
      </div>
      <div class="inq-meta">
        ${r.email ? `<div><b>Email</b> <a href="mailto:${esc(r.email)}">${esc(r.email)}</a></div>` : ""}
        ${r.phone ? `<div><b>Phone</b> <a href="tel:${esc(r.phone)}">${esc(r.phone)}</a></div>` : ""}
        ${r.heardAbout ? `<div><b>Heard via</b> ${esc(r.heardAbout)}</div>` : ""}
      </div>
      <div class="inq-meta">
        ${eventDate ? `<div><b>Date</b> ${esc(eventDate)}</div>` : ""}
        ${r.location ? `<div><b>Where</b> ${esc(r.location)}</div>` : ""}
        ${r.guests ? `<div><b>Guests</b> ${esc(r.guests)}</div>` : ""}
        ${(r.services || []).length ? `<div><b>Wants</b> ${esc((r.services || []).join(", "))}</div>` : ""}
      </div>
      <div style="display:flex;flex-direction:column;gap:.4rem">
        ${st !== "contacted" ? `<button class="btn btn--ghost btn--sm" data-mark="contacted" data-id="${esc(r.id)}">Mark contacted</button>` : ""}
        ${st !== "archived" ? `<button class="btn btn--ghost btn--sm" data-mark="archived" data-id="${esc(r.id)}">Archive</button>` : ""}
        ${st !== "new" ? `<button class="btn btn--ghost btn--sm" data-mark="new" data-id="${esc(r.id)}">Back to new</button>` : ""}
      </div>
      ${r.message ? `<p class="inq-msg">${esc(r.message)}</p>` : ""}
    </article>`;
  }).join("");
}

async function markInquiry(id, status) {
  try {
    await fb.fs.updateDoc(fb.fs.doc(db, PATHS.inquiriesCol, id), { status });
    const row = inquiries.find((r) => r.id === id);
    if (row) row.status = status;
    renderInquiries();
  } catch (err) {
    alert("Could not update that inquiry: " + (err.code || err.message));
  }
}

function exportCsv() {
  const cols = ["createdAt", "status", "name", "email", "phone", "eventDate", "location", "guests", "message"];
  const cell = (v) => {
    if (v == null) return "";
    if (Array.isArray(v)) v = v.join("; ");
    if (v && v.toDate) v = v.toDate().toISOString();
    return `"${String(v).replace(/"/g, '""')}"`;
  };
  /* Older submissions used firstName/lastName and weddingDate — fold
     those into the current column shape so past inquiries export cleanly. */
  const norm = (r) => ({
    ...r,
    name: r.name || [r.firstName, r.lastName].filter(Boolean).join(" "),
    eventDate: r.eventDate || r.weddingDate
  });
  const csv = [cols.join(",")].concat(
    inquiries.map((r) => cols.map((c) => cell(norm(r)[c])).join(","))
  ).join("\r\n");

  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `bdm-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ============================================================ 6. TABS */
function selectTab(tab) {
  $$('[role="tab"]').forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    $("#" + t.getAttribute("aria-controls")).hidden = !on;
  });
}

document.addEventListener("click", (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (tab) { selectTab(tab); return; }

  const mark = e.target.closest("[data-mark]");
  if (mark) { markInquiry(mark.dataset.id, mark.dataset.mark); return; }
});

$("#saveBtn").addEventListener("click", publish);
$("#reloadBtn").addEventListener("click", async () => {
  if (dirty && !confirm("Discard your unpublished changes?")) return;
  dirty = false;
  await loadContent();
  rebuild();
  status("Reloaded from the published version");
});
$("#inqFilter").addEventListener("change", renderInquiries);
$("#inqRefresh").addEventListener("click", loadInquiries);
$("#inqExport").addEventListener("click", exportCsv);
$("#jsonBox").addEventListener("input", markDirty);
