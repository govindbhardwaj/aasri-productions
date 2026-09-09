/* =============================================================
   Firebase configuration
   -------------------------------------------------------------
   Paste the config object from:
     Firebase console → Project settings → Your apps → Web app

   Leave the placeholders in place and the site still works — it
   renders from assets/js/data.js and the inquiry form politely
   asks visitors to call instead. Fill these in to switch on the
   admin panel and inquiry capture.

   These values are NOT secrets. A web API key identifies your
   project; access is controlled by Firestore security rules.
   See README.md for the rules to paste in.
   ============================================================= */

window.BDM_FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

/* Firestore locations used by the site */
window.BDM_PATHS = {
  contentDoc:        ["site", "content"],   // published site content
  inquiriesCol:      "inquiries"            // form submissions
};

/* True once real values are in place. */
window.BDM_FIREBASE_READY = (function (c) {
  return !!c && typeof c.apiKey === "string" &&
         c.apiKey.length > 12 && c.apiKey.indexOf("YOUR_") !== 0 &&
         typeof c.projectId === "string" && c.projectId.indexOf("YOUR_") !== 0;
})(window.BDM_FIREBASE_CONFIG);
