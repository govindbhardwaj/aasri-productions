/* =============================================================
   store.js — Firebase bridge (ES module)
   -------------------------------------------------------------
   • Loads published content from Firestore and deep-merges it
     over the bundled defaults in data.js, then tells main.js.
   • Exposes window.BDM_STORE.saveInquiry() for the contact form.
   • Loads the Firebase SDK lazily from the CDN, and only when a
     real config is present, so an unconfigured site ships zero
     extra bytes and still renders completely.
   ============================================================= */

const SDK = "https://www.gstatic.com/firebasejs/10.12.5";

/* Deep merge: plain objects merge, everything else (arrays,
   scalars) is replaced wholesale by the override. */
export function merge(base, over) {
  if (!isPlain(base) || !isPlain(over)) return over === undefined ? base : over;
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  for (const k of Object.keys(over)) {
    const v = over[k];
    if (v === undefined) continue;
    out[k] = isPlain(v) && isPlain(base[k]) ? merge(base[k], v) : v;
  }
  return out;
}
function isPlain(v) {
  return !!v && typeof v === "object" && !Array.isArray(v) &&
         Object.getPrototypeOf(v) !== Date.prototype;
}

let appPromise = null;

/** Lazily initialise Firebase. Resolves null when unconfigured. */
export async function getFirebase() {
  if (!window.BDM_FIREBASE_READY) return null;
  if (appPromise) return appPromise;

  appPromise = (async () => {
    const [{ initializeApp, getApps }, fs] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-firestore.js`)
    ]);
    const app = getApps().length ? getApps()[0] : initializeApp(window.BDM_FIREBASE_CONFIG);
    return { app, fs, initializeApp, getApps };
  })().catch((err) => {
    console.warn("[BDM] Firebase unavailable, using bundled content.", err);
    appPromise = null;
    return null;
  });

  return appPromise;
}

/** Auth module, loaded on demand (admin panel only). */
export async function getAuthModule() {
  const fb = await getFirebase();
  if (!fb) return null;
  const auth = await import(`${SDK}/firebase-auth.js`);
  return { ...fb, auth, authInstance: auth.getAuth(fb.app) };
}

/** Read the published content document. */
export async function fetchContent() {
  const fb = await getFirebase();
  if (!fb) return null;
  const { fs, app } = fb;
  const [col, doc] = window.BDM_PATHS.contentDoc;
  try {
    const db = fs.getFirestore(app);
    const snap = await fs.getDoc(fs.doc(db, col, doc));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn("[BDM] Could not read published content.", err);
    return null;
  }
}

/** Write an inquiry. Throws when Firebase is not configured. */
export async function saveInquiry(payload) {
  const fb = await getFirebase();
  if (!fb) throw new Error("NOT_CONFIGURED");
  const { fs, app } = fb;
  const db = fs.getFirestore(app);
  return fs.addDoc(fs.collection(db, window.BDM_PATHS.inquiriesCol), {
    ...payload,
    status: "new",
    createdAt: fs.serverTimestamp(),
    source: location.pathname,
    userAgent: navigator.userAgent.slice(0, 300)
  });
}

/* ---- Boot: publish merged content to the page ------------------------ */
window.BDM_STORE = { merge, getFirebase, getAuthModule, fetchContent, saveInquiry };

(async function boot() {
  const remote = await fetchContent();
  if (!remote) return;
  const merged = merge(window.BDM_DEFAULT_CONTENT, remote);
  window.BDM_REMOTE_CONTENT = merged;
  document.dispatchEvent(new CustomEvent("bdm:content", { detail: merged }));
})();
