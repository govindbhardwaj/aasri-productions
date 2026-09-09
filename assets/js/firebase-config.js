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
  apiKey: "AIzaSyDjWzokx1IJhuD-7ckk9M7u_mVLzKgSOuE",

  authDomain: "aasri-productions.firebaseapp.com",

  projectId: "aasri-productions",

  storageBucket: "aasri-productions.firebasestorage.app",

  messagingSenderId: "66156451027",

  appId: "1:66156451027:web:2c3fc1b5904e22c90ef026",

  measurementId: "G-CDDTELRDQN",
};

/* Firestore locations used by the site */
window.BDM_PATHS = {
  contentDoc: ["site", "content"], // published site content
  inquiriesCol: "inquiries", // form submissions
};

/* True once real values are in place. */
window.BDM_FIREBASE_READY = (function (c) {
  return (
    !!c &&
    typeof c.apiKey === "string" &&
    c.apiKey.length > 12 &&
    c.apiKey.indexOf("YOUR_") !== 0 &&
    typeof c.projectId === "string" &&
    c.projectId.indexOf("YOUR_") !== 0
  );
})(window.BDM_FIREBASE_CONFIG);
