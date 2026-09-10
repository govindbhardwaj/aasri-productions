# Aasri Productions — website

A static, luxury-editorial website for Aasri Productions, an event photography and
cinematography studio, built to run on **GitHub Pages** with a **Firebase** admin panel
for content and inquiries.

> ⚠️ **The content is placeholder.** Business facts (pricing, phone, socials, stats)
> were built against bigdaymemories.com as a reference and still belong to that studio.
> Photography and film are separately-sourced stock media and public reference videos,
> not Aasri Productions' own work. See [Needs your input](#needs-your-input) before publishing.

No build step. No framework. Open `index.html` and it works.

---

## What's here

```
index.html          Homepage
gallery.html        Full photo portfolio
privacy.html        Privacy policy (draft — have it reviewed)
admin.html          Studio admin (Firebase login)
robots.txt          admin.html is excluded from search engines
sitemap.xml         Update the domain after you deploy
.nojekyll           Stops GitHub Pages running Jekyll over the files

assets/css/style.css        The whole design system
assets/js/data.js           ← ALL site content lives here
assets/js/firebase-config.js ← paste your Firebase config here
assets/js/store.js          Firebase bridge (content + inquiries)
assets/js/main.js           Rendering and interactions
assets/js/admin.js          Admin panel
assets/img/                 Photography, project thumbnails, posters, reel covers
assets/video/               Hero film, studio clips
```

### How content works

`assets/js/data.js` is the source of truth and ships with the site, so **every page
renders completely even with Firebase switched off**. The admin panel saves only the
fields you actually change into Firestore (`site/content`), and `store.js` merges those
over the defaults at runtime. Clear a field in the admin panel and it falls back to the
value in `data.js`.

That means you can edit copy either way: quick changes in the admin panel, or permanent
ones by editing `data.js` and pushing.

---

## Deploy to GitHub Pages

1. Create a repository and push these files to the default branch.

   ```bash
   git init
   git add .
   git commit -m "Aasri Productions website"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. In the repository: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**

3. Wait a minute, then open `https://<you>.github.io/<repo>/`.

4. Update the domain in three places once you know the final URL:
   - `sitemap.xml` and `robots.txt`
   - the `<link rel="canonical">` and `og:` tags at the top of `index.html` and `gallery.html`

> **Custom domain:** live at **aasriproductions.in**, via a `CNAME` file in the repo root
> and DNS records at the registrar (Hostinger) pointing at GitHub Pages: four `A` records
> on the apex (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`) and a `CNAME` on
> `www` → `govindbhardwaj.github.io`. Enforce HTTPS is on once GitHub finishes verifying.

---

## Set up Firebase (about 10 minutes)

This switches on the admin panel and the inquiry form. Skip it and the site still works —
the inquiry form simply asks visitors to call the studio instead.

### 1. Create the project

[console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
Google Analytics is not needed.

### 2. Register a web app

Project overview → the **`</>`** (web) icon → give it a nickname → **Register app**.
Firebase shows you a `firebaseConfig` object. Copy the values into
`assets/js/firebase-config.js`:

```js
window.BDM_FIREBASE_CONFIG = {
  apiKey:            "AIza…",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId:             "1:1234567890:web:abc123"
};
```

These values are **not secrets** — a web API key only identifies the project. Access is
controlled by the security rules in step 5.

### 3. Turn on Firestore

Build → **Firestore Database** → **Create database** → start in **production mode** →
pick a region near Los Angeles (`us-west1` or `nam5`).

### 4. Create your admin login

Build → **Authentication** → **Get started** → enable **Email/Password** →
**Users** tab → **Add user**. Use a real email and a strong password. This is the login
for `admin.html`.

> Only accounts you create here can sign in. Do not enable "Email link" or any other
> provider, and never enable anonymous sign-in.

### 5. Paste the security rules

Firestore Database → **Rules** tab → replace everything with this → **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Published site content: the world reads it, only signed-in staff write it.
    match /site/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Inquiries: anyone may submit a well-formed one; only signed-in staff
    // may read, edit or delete them.
    match /inquiries/{id} {
      allow create: if isValidInquiry(request.resource.data);
      allow read, update, delete: if request.auth != null;
    }

    function isValidInquiry(d) {
      return d.keys().hasOnly([
               'name','phone','email','eventDate','location',
               'guests','message','status','createdAt','source','userAgent'
             ])
             && d.name is string && d.name.size() > 0 && d.name.size() < 150
             && d.phone is string && d.phone.size() > 0 && d.phone.size() < 40
             && d.email is string && d.email.size() < 200 && d.email.matches('.*@.*[.].*')
             && d.eventDate is string && d.eventDate.size() > 0
             && d.message is string && d.message.size() > 0 && d.message.size() < 5000
             && d.status == 'new';
    }

    // Nothing else is reachable.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 6. Allow your domain

Authentication → **Settings** → **Authorized domains** → **Add domain** →
`<you>.github.io` (and your custom domain, if you have one). `localhost` is already
allowed for local testing.

### 7. Sign in

Open `/admin.html`, sign in with the user from step 4, and the panel appears.

---

## Using the admin panel

| Tab | What it does |
|---|---|
| **Inquiries** | Every form submission, newest first. Mark contacted / archive, or export the lot as CSV. |
| **Website content** | Studio details, hero, brand statement, about, inquiry copy, footer. |
| **Photos & videos** | The full photo gallery, YouTube films, reels, signature stories and services. Photo, video and poster fields all take any link (Instagram-hosted, your own site, wherever) as well as local paths, and YouTube fields accept a full link or just the video ID. A reel's Instagram permalink is what actually plays — pressing the tile opens Instagram's own player inline, on the site, via their embed widget; Video link is only used for a self-hosted file when there's no Instagram permalink at all. |
| **Packages** | The four tiers. `Includes` takes one `Label \| Value` per line; `Add-ons` one per line; set `Featured` to `yes` on exactly one tier. |
| **Love letters** | Client reviews. Replace the placeholders and set *Still placeholder copy?* to `no` to drop the warning badge. |
| **Advanced** | The raw content document, for anything the guided tabs don't cover. Save `{}` to reset everything to the built-in defaults. |

**Publish changes** writes to Firestore; the live site picks it up on the next page load.
A small `•` next to a field label means it's currently overriding the default.

### Needs your input

> **Read this before the site goes public.**
>
> This site mixes two kinds of placeholder content, and both need replacing before launch.

**Business facts, carried over from bigdaymemories.com** — this site was designed
against that studio as a reference, and these details still belong to it:

| What | Where it lives |
|---|---|
| Phone number `+1 323-447-2333` | `business.phone` / `business.phoneHref` |
| Instagram, YouTube and Facebook accounts | `business.social` (and the `sameAs` list in `index.html`'s structured data) |
| "Est. 2018", "Solar Space Studio", the LA map pin | `business.founded`, `business.studioName`, `business.mapEmbed`, and the `<span>` in each page's nav |
| 20+ years / 1000+ weddings / 3-day sneak peek / 30–45 day delivery | `difference.items` and `difference.notes` |
| All four package tiers, prices and add-ons | `packages.tiers` |

**Photography and film, sourced independently for this design** — real media, but not
Aasri Productions' own work:

| What | Where it lives |
|---|---|
| Every gallery photograph, story-card portrait and hero image | `assets/img/`, `assets/video/` — free-to-use stock from Pexels |
| The nine "signature stories" (invented couple names as placeholder captions) | `stories`, `storiesBaseUrl` |

The **Reels** section is the exception — it's real: the studio's five most-liked
Instagram Reels (`reels.items`), playing inline on the site through Instagram's
own embed widget rather than being re-hosted here. (Instagram only exposes a
downloadable video file for reels with original/self-recorded audio; reels
built on a licensed music track can't be self-hosted without ripping that
license, so all five play through Instagram's player instead of a mix of
self-hosted and linked-out.)
| The wedding-films section and the Love Letters testimonial film | `films`, `loveLetters.filmYoutube` — real public YouTube uploads from other studios, captioned without the real couples' names, shown only to demonstrate the layout |

Never published anywhere, so left blank rather than invented:

- **A public email address** — every email line on the site stays hidden until you add one.
- **The studio street address**.
- **Real client reviews** — Love Letters shows clearly-labelled placeholder text.
- **Team members** — no names or portraits are shown.
- **A tagline** — `business.tagline` is a placeholder line, not Aasri's own.

---

## Swapping in your own media

- **Photographs** → drop files in `assets/img/gallery/` and update the `gallery.items`
  list (`src`, `w`, `h`, `cat`, `alt`). The `w`/`h` decide whether a photo is treated as
  a portrait or a landscape in the mosaic, so keep them accurate.
- **Hero film** → replace `assets/video/hero.mp4` and `assets/img/posters/video-poster-00001.jpg`.
  Keep it short and under about 5 MB; it is muted, looping, and never loads on
  data-saver or 2G connections.
- **Reels** → `assets/video/` plus a poster. Add the Instagram permalink in the admin
  panel and a link appears on the tile.
- **Films** → YouTube IDs only. Nothing is requested from YouTube until a visitor
  presses play, and the player is `youtube-nocookie`.

GitHub repositories are limited to 100 MB per file and get unhappy past about 1 GB, so
host anything long-form on YouTube or Vimeo rather than committing it here.

---

## Notes on the build

- **Performance** — lazy images with explicit dimensions (no layout shift), YouTube
  facades, a deferred map iframe, clips that only play while on screen, and one reel
  playing at a time. No JS libraries at all.
- **Accessibility** — semantic landmarks, a visible focus ring, a skip link, keyboard and
  swipe support in the lightbox with focus trapped inside it, labelled form fields with
  inline errors, and full `prefers-reduced-motion` support.
- **SEO** — per-page titles and descriptions, Open Graph and Twitter cards,
  `LocalBusiness` structured data with the real package prices, and a sitemap.
- **Browsers** — anything from the last few years. Layout uses CSS grid and
  `aspect-ratio`; there is no IE support and none is intended.

## Local preview

```bash
python -m http.server 8123
```

Then open <http://localhost:8123>. Opening the files directly with `file://` will not
work, because ES modules and `fetch` need a real origin.
