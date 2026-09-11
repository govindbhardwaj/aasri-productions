/* =============================================================
   Aasri Productions — content source of truth
   -------------------------------------------------------------
   Every string rendered on the site lives here. The Firebase admin
   panel writes overrides into Firestore (site/content); store.js
   deep-merges those over this object at runtime, so the site always
   renders correctly even with Firebase unconfigured.

   PROVENANCE:
   - Business facts (phone, YouTube/Facebook links, stats, packages,
     "Est. 2018" and the studio name) were built against bigdaymemories.com
     as a design reference and still belong to that studio. Replace them
     with Aasri Productions' own before this goes live. business.city and
     business.mapEmbed point at Bhiwani, Haryana — the studio's real base.
     business.social.instagram is also real, the studio's own account
     (@aasri_productions).
   - reels.items are the studio's own real work: their five most-liked
     Instagram Reels (by like count, pulled Sept 2026), each linking
     out to the real post rather than a re-hosted copy of the video.
   - The rest of the photography and video (gallery, story cards, hero,
     about clips) are free-to-use stock media from Pexels, chosen to
     show Indian wedding ceremonies and celebrations rather than the
     reference site's Western photography. They are real photographs
     and films, but not of Aasri Productions clients — swap in the
     studio's own work when it exists. The nine "signature stories"
     use invented couple names purely as placeholder captions.
   - films.* and loveLetters.filmYoutube point at real, public YouTube
     uploads from other studios, used only to demonstrate the film
     gallery layout, and deliberately captioned without the real
     couples' names. Replace every video ID before launch.
   - Anything neither site published (a public email, the street
     address, real client reviews, team bios) is left blank and
     flagged with a *NeedsReview key. See README.md for the full
     checklist of what still needs replacing before launch.
   ============================================================= */

window.BDM_DEFAULT_CONTENT = {

  business: {
    name: "Aasri Productions",
    tagline: "You live it. We keep it.",
    taglineNeedsReview: true,          /* placeholder — replace with Aasri's own line */
    phone: "+1 323-447-2333",
    phoneHref: "tel:+13234472333",
    email: "",                         /* not published on the reference site */
    emailNeedsReview: true,
    studioName: "Solar Space Studio",
    studioNote: "our main office / creative space",
    city: "Bhiwani, Haryana",
    streetAddress: "",                 /* not published on the reference site */
    addressNeedsReview: true,
    mapEmbed: "https://www.google.com/maps?q=Bhiwani,+Haryana,+India&output=embed",
    startingAt: "$2,999",
    founded: "2018",
    /* Carried over from the reference site — must be replaced. */
    identityNeedsReview: true,
    social: {
      instagram: "https://www.instagram.com/aasri_productions/",
      youtube: "https://www.youtube.com/@bigdaymemories_la",
      facebook: "https://www.facebook.com/profile.php?id=100086097605146"
    }
  },

  hero: {
    eyebrow: "Event Photography &amp; Cinematography — Bhiwani &amp; Worldwide",
    headlineTop: "The moments",
    headlineEm: "you will live in",
    headlineBottom: "forever.",
    sub: "Twenty years behind the camera, more than a thousand projects, and one promise: you live it, we keep every part of it worth keeping.",
    primaryCta: { label: "Check Your Date", href: "#inquire" },
    secondaryCta: { label: "Watch a Film", href: "#films" },
    video: "assets/video/hero.mp4",
    poster: "assets/img/posters/video-poster-00001.jpg"
  },

  manifesto: {
    words: ["Elegant", "Cinematic", "Unhurried", "Yours"],
    lead: "A moment lasts a second. The way it felt should last considerably longer.",
    body: "We photograph and film every occasion the way you will want to remember it — the half-second before the vows, the hand your father would not let go of, the room at midnight. Nothing staged that should not be. Nothing missed that matters."
  },

  /* Stats and promises — all published on bigdaymemories.com */
  difference: {
    eyebrow: "Why clients choose us",
    title: "Twenty years of milestones,\ncampaigns and everything between.",
    items: [
      { figure: "20",   suffix: "+",         label: "Years",          copy: "More than 20 years in the photography and film industry." },
      { figure: "1000", suffix: "+",         label: "Projects",       copy: "Photographed and filmed more than 1000 projects worldwide." },
      { figure: "3",    suffix: " days",     label: "Sneak peek",     copy: "Just 3 days to see a sneak peek of your celebration." },
      { figure: "30",   suffix: "–45 days", label: "Final delivery", copy: "Your complete gallery and films, delivered in 30 to 45 days." }
    ],
    notes: [
      { title: "Excellence",          copy: "Top rated, award-winning service in Bhiwani." },
      { title: "A beautiful studio",  copy: "A sun-drenched studio and event space in Bhiwani." },
      { title: "Beside you all the way", copy: "We are here to support, guide, help you plan, lend a helping hand and, of course, document it all in the most stress free and enjoyable way." }
    ]
  },

  /* Real published projects */
  /* These are illustrative placeholders built on stock photography, not
     real Aasri Productions clients — see the PROVENANCE note above. Each
     card links to the full gallery rather than a fabricated case-study
     page. */
  stories: [
    { slug: "gallery.html", couple: "Priya &amp; Arjun",   type: "Traditional Hindu Wedding", location: "Jaipur, Rajasthan",   pkg: "Gold",   img: "assets/img/stories/priya-arjun.jpg" },
    { slug: "gallery.html", couple: "Ananya &amp; Rohan",  type: "Sangeet &amp; Reception",   location: "Mumbai, Maharashtra", pkg: "Silver", img: "assets/img/stories/ananya-rohan.jpg" },
    { slug: "gallery.html", couple: "Meera &amp; Vikram",  type: "South Indian Wedding",      location: "Chennai, Tamil Nadu", pkg: "Custom", img: "assets/img/stories/meera-vikram.jpg" },
    { slug: "gallery.html", couple: "Kavya &amp; Siddharth", type: "Destination Wedding",     location: "Udaipur, Rajasthan",  pkg: "Gold",   img: "assets/img/stories/kavya-siddharth.jpg" },
    { slug: "gallery.html", couple: "Diya &amp; Karan",    type: "Sikh Wedding",              location: "Amritsar, Punjab",    pkg: "Bronze", img: "assets/img/stories/diya-karan.jpg" },
    { slug: "gallery.html", couple: "Ishita &amp; Aryan",  type: "Varmala Ceremony",          location: "New Delhi",           pkg: "Custom", img: "assets/img/stories/ishita-aryan.jpg" },
    { slug: "gallery.html", couple: "Sana &amp; Imran",    type: "Nikah Ceremony",            location: "Hyderabad, Telangana",pkg: "Silver", img: "assets/img/stories/sana-imran.jpg" },
    { slug: "gallery.html", couple: "Riya &amp; Dev",      type: "Baraat &amp; Pheras",       location: "Jodhpur, Rajasthan",  pkg: "Gold",   img: "assets/img/stories/riya-dev.jpg" },
    { slug: "gallery.html", couple: "Tanvi &amp; Nikhil",  type: "Palace Wedding",            location: "Udaipur, Rajasthan",  pkg: "Custom", img: "assets/img/stories/tanvi-nikhil.jpg" }
  ],
  storiesBaseUrl: "",

  /* Vertical 9:16 brand reels, self-hosted. Add an Instagram permalink
     from the admin panel and a "View on Instagram" link appears. */
  reels: {
    eyebrow: "From the feed",
    title: "Little moments.\nBig memories.",
    copy: "One reel, four moments. Short films cut the way you would actually want to watch them back — and share them.",
    /* The studio's five real most-liked Reels from @aasri_productions,
       ranked by like count at the time this was pulled (Sept 2026):
       1,066 / 309 / 244 / 242 / 133 likes. No video file is hosted here
       -- src is deliberately blank, so pressing play opens the reel on
       Instagram itself rather than re-hosting someone's Instagram video
       on a different domain. Posters are cropped stills saved locally
       so they do not depend on Instagram's short-lived CDN links. */
    items: [
      { id: "ig1", src: "", poster: "assets/img/reels/ig-reel-1.webp", w: 404, h: 720, caption: "Behind the lens",     alt: "Filming a wedding celebration through a camera monitor rig", instagram: "https://www.instagram.com/aasri_productions/reel/DXmf6Gckmgk/" },
      { id: "ig2", src: "", poster: "assets/img/reels/ig-reel-2.webp", w: 600, h: 600, caption: "Bas sone do yaar",    alt: "Two guests dozing off together at 3 AM during the celebration", instagram: "https://www.instagram.com/aasri_productions/reel/DX_7q0VSAuC/" },
      { id: "ig3", src: "", poster: "assets/img/reels/ig-reel-3.webp", w: 600, h: 600, caption: "Pure celebration",    alt: "Bride and groom dancing joyfully under purple reception lighting", instagram: "https://www.instagram.com/aasri_productions/reel/Db8aPsWu3pF/" },
      { id: "ig4", src: "", poster: "assets/img/reels/ig-reel-4.webp", w: 600, h: 600, caption: "The grand entry",     alt: "Groom's dramatic sparkler entrance at night", instagram: "https://www.instagram.com/aasri_productions/reel/DT2A4xakkHX/" },
      { id: "ig5", src: "", poster: "assets/img/reels/ig-reel-5.webp", w: 600, h: 600, caption: "Through the arch",    alt: "Couple walking together through an elaborate floral entrance arch", instagram: "https://www.instagram.com/aasri_productions/reel/DRv5HcnElYU/" }
    ]
  },

  gallery: {
    eyebrow: "Portfolio",
    title: "A few love stories\nwe have captured.",
    categories: ["All", "Ceremony", "Couples", "Details", "Celebration"],
    items: [
      { src: "assets/img/gallery/g01.webp", w: 900, h: 675,  cat: "Celebration", alt: "Bride dancing under dramatic red uplighting" },
      { src: "assets/img/gallery/g02.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple in coordinated traditional outfits, posed portrait" },
      { src: "assets/img/gallery/g03.webp", w: 900, h: 675,  cat: "Ceremony",    alt: "Puja thali and deity idol set out before the ceremony" },
      { src: "assets/img/gallery/g04.webp", w: 900, h: 1350, cat: "Couples",     alt: "Bride portrait in red and gold ceremonial jewelry" },
      { src: "assets/img/gallery/g05.webp", w: 900, h: 1350, cat: "Details",     alt: "Mehndi design and ring on the bride's hand" },
      { src: "assets/img/gallery/g06.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple in Sikh wedding attire, formal portrait" },
      { src: "assets/img/gallery/g07.webp", w: 900, h: 675,  cat: "Celebration", alt: "Guests dancing under string lights at the reception" },
      { src: "assets/img/gallery/g08.webp", w: 900, h: 675,  cat: "Ceremony",    alt: "Tilak and vermillion ritual during the ceremony" },
      { src: "assets/img/gallery/g09.webp", w: 900, h: 1350, cat: "Couples",     alt: "Bride portrait in a sunlit courtyard" },
      { src: "assets/img/gallery/g10.webp", w: 900, h: 675,  cat: "Celebration", alt: "Sangeet performance in a dramatic pose" },
      { src: "assets/img/gallery/g11.webp", w: 900, h: 1350, cat: "Details",     alt: "Mehndi-covered hands with gold bangles" },
      { src: "assets/img/gallery/g12.webp", w: 900, h: 1350, cat: "Couples",     alt: "Family blessing moment during the ceremony" },
      { src: "assets/img/gallery/g13.webp", w: 900, h: 1350, cat: "Ceremony",    alt: "Bride in traditional jewelry before the pheras" },
      { src: "assets/img/gallery/g14.webp", w: 900, h: 675,  cat: "Celebration", alt: "Sangeet night dance in coordinated orange outfits" },
      { src: "assets/img/gallery/g15.webp", w: 900, h: 675,  cat: "Ceremony",    alt: "Wide view of a floral mandap at dusk" },
      { src: "assets/img/gallery/g16.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple in an embrace, bride in a pink lehenga" },
      { src: "assets/img/gallery/g17.webp", w: 900, h: 675,  cat: "Details",     alt: "Mehndi detail against a pink dupatta" },
      { src: "assets/img/gallery/g18.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple portrait in traditional dress" },
      { src: "assets/img/gallery/g19.webp", w: 900, h: 1350, cat: "Ceremony",    alt: "Varmala garland exchange during the ceremony" },
      { src: "assets/img/gallery/g20.webp", w: 900, h: 1350, cat: "Couples",     alt: "Bride and groom, formal wedding portrait" },
      { src: "assets/img/gallery/g21.webp", w: 900, h: 675,  cat: "Celebration", alt: "Baraat procession at night" },
      { src: "assets/img/gallery/g22.webp", w: 900, h: 675,  cat: "Celebration", alt: "Temple procession as part of the celebration" },
      { src: "assets/img/gallery/g23.webp", w: 900, h: 675,  cat: "Ceremony",    alt: "Red and gold mandap arch from below" },
      { src: "assets/img/gallery/g24.webp", w: 900, h: 1350, cat: "Details",     alt: "Elders' hands clasped in blessing" },
      { src: "assets/img/gallery/g25.webp", w: 900, h: 675,  cat: "Celebration", alt: "Dhol drummers performing at the celebration" },
      { src: "assets/img/gallery/g26.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple portrait outdoors in golden light" },
      { src: "assets/img/gallery/g27.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple in traditional attire, candid portrait" },
      { src: "assets/img/gallery/g28.webp", w: 900, h: 1350, cat: "Ceremony",    alt: "Haldi ceremony, turmeric paste ritual" },
      { src: "assets/img/gallery/g29.webp", w: 900, h: 675,  cat: "Celebration", alt: "Sangeet dance in coordinated pink outfits" },
      { src: "assets/img/gallery/g30.webp", w: 900, h: 675,  cat: "Details",     alt: "Temple architecture ahead of the ceremony" },
      { src: "assets/img/gallery/g31.webp", w: 900, h: 675,  cat: "Ceremony",    alt: "Garland exchange witnessed by the priest and family" },
      { src: "assets/img/gallery/g32.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple portrait in casual traditional wear" },
      { src: "assets/img/gallery/g33.webp", w: 900, h: 675,  cat: "Celebration", alt: "Bride dancing, black and white portrait" },
      { src: "assets/img/gallery/g34.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple laughing together, candid moment" },
      { src: "assets/img/gallery/g35.webp", w: 900, h: 1350, cat: "Details",     alt: "Mehndi-covered hands and dupatta detail" },
      { src: "assets/img/gallery/g36.webp", w: 900, h: 1350, cat: "Couples",     alt: "Couple sharing a quiet embrace" },
      { src: "assets/img/gallery/g37.webp", w: 900, h: 675,  cat: "Celebration", alt: "Bride dancing under blue reception lighting" }
    ]
  },

  /* Real published films from youtube.com/@bigdaymemories_la */
  films: {
    eyebrow: "Our films",
    title: "Press play.\nThen imagine it is yours.",
    /* Reference placeholders only: real, public YouTube uploads by other
       studios, shown to demonstrate the film-gallery layout. Captioned
       without the couples' real names on purpose — replace every ID
       with Aasri Productions' own films before launch. */
    featured: {
      youtube: "Kz25W3XOg44",
      couple: "A Rajasthan Wedding",
      meta: "Palace Wedding — Udaipur, Rajasthan",
      note: "Reference placeholder — replace with your own film"
    },
    items: [
      { youtube: "RWVfABdWGRQ", couple: "A Luxury Celebration", meta: "North Indian Wedding" },
      { youtube: "NLJlBJ56IF4", couple: "A Punjabi Wedding",    meta: "Sikh Wedding — Punjab" },
      { youtube: "A6pKIvLtL-4", couple: "A South Indian Union", meta: "Christian Wedding — Tamil Nadu" },
      { youtube: "Pm3NfZDC48k", couple: "A Wedding Abroad",     meta: "Destination Wedding — Mexico" }
    ]
  },

  services: {
    eyebrow: "What we do",
    title: "Every occasion,\nproperly remembered.",
    items: [
      { name: "Wedding Photography",       copy: "Candid moments, portraits, details, ceremony and celebration — two cameras, all day, nothing missed.", img: "assets/img/gallery/g08.webp" },
      { name: "Wedding Films &amp; Cinematography", copy: "Cinematic highlight films and documentary coverage, from getting ready to the last dance.",     img: "assets/img/gallery/g14.webp" },
      { name: "Pre-Wedding &amp; Post-Wedding Shoots", copy: "A relaxed session built around the two of you, on location — photography and film.",         img: "assets/img/gallery/g12.webp" },
      { name: "Maternity &amp; Baby Shoots", copy: "Studio or on-location sessions for the months before, and the ones right after.",                      img: "assets/img/services/maternity.webp" },
      { name: "Event &amp; Party Photography", copy: "Birthdays, receptions, family functions and corporate events, covered properly.",                    img: "assets/img/services/event-party.webp" },
      { name: "Product &amp; Catalogue Photography", copy: "Clean, consistent studio photography for e-commerce, lookbooks and catalogues.",                img: "assets/img/services/product.webp" },
      { name: "Commercial &amp; Advertisement Shoots", copy: "Brand campaigns, lookbooks and advertising work, shot to a brief.",                           img: "assets/img/services/commercial.webp" },
      { name: "Drone Cinematography",      copy: "Aerial perspective on your venue, your coastline, your celebration from above.",                          img: "assets/img/gallery/g31.webp" },
      { name: "Reels &amp; Social Content", copy: "Vertical, share-ready edits within days — the first thing everyone asks for.",                          img: "assets/img/gallery/g20.webp" },
      { name: "Full-Length Wedding Films", copy: "The long-form film: up to 30 or 60 minutes of your day, start to finish.",                                img: "assets/img/gallery/g03.webp" },
      { name: "Destination Shoots",        copy: "Weddings, portraits and campaigns filmed worldwide. Tell us where, and we will be there.",                img: "assets/img/gallery/g27.webp" },
      { name: "Posing &amp; Styling Guidance", copy: "An in-person session so you know exactly how to stand, move and look on the day.",                    img: "assets/img/gallery/g26.webp" }
    ]
  },

  /* Published Photo + Video packages. Prices, hours and inclusions are
     reproduced from bigdaymemories.com — do not edit casually. */
  packages: {
    eyebrow: "Investment",
    title: "Four ways to be\nremembered properly.",
    note: "All packages include unlimited consultations, customised timeline planning, print release and RAW material download.",
    footnote: "Photo-only and video-only packages are also available — ask us when you inquire.",
    tiers: [
      {
        id: "bronze", name: "Bronze", hours: "5 hours",
        price: "$2,999", was: "$3,699", priceNote: "if you inquire today",
        blurb: "Perfect for intimate weddings. Not available on Saturdays.",
        featured: false,
        includes: [
          ["1 Photographer", "2 cameras"],
          ["1 Videographer", "2 cameras"],
          ["Edited photos", "360+"],
          ["Highlight movie", "Up to 5 min"],
          ["Teaser video", "1 reel"]
        ],
        addons: ["Up to 30 min movie — $400", "Cameraman (per hour) — $150", "Drone — $275", "Engagement photoshoot — $600", "Engagement video — $350", "Extra hour — $300"]
      },
      {
        id: "silver", name: "Silver", hours: "8 hours",
        price: "$3,799", was: "$4,499", priceNote: "if you inquire today",
        blurb: "Our most popular package. Just enough to capture every important detail of your day.",
        featured: true,
        includes: [
          ["1 Photographer", "2 cameras"],
          ["1 Videographer", "2 cameras"],
          ["Edited photos", "500+"],
          ["Highlight movie", "Up to 7 min"],
          ["Teaser video", "1 reel"]
        ],
        addons: ["Up to 30 min movie — $400", "Cameraman (per hour) — $150", "Drone — $275", "Engagement photoshoot — $600", "Engagement video — $350", "Extra hour — $300"]
      },
      {
        id: "gold", name: "Gold", hours: "10 hours",
        price: "$4,199", was: "$4,899", priceNote: "if you inquire today",
        blurb: "Allow yourself extra time for the more relaxed and stress-free wedding experience.",
        featured: false,
        includes: [
          ["1 Photographer", "2 cameras"],
          ["1 Videographer", "2 cameras"],
          ["Edited photos", "750+"],
          ["Highlight movie", "Up to 6–8 min"],
          ["Teaser video", "1 reel"]
        ],
        addons: ["Up to 30 min movie — $400", "Up to 60 min movie — $600", "Cameraman (per hour) — $150", "Drone — $275", "Engagement photoshoot — $600", "Engagement video — $350", "Extra hour — $300"]
      },
      {
        id: "premium", name: "Premium", hours: "10 hours · two-person crew",
        price: "$6,999", was: "$7,699", priceNote: "if you inquire today",
        blurb: "A unique experience for our most demanding brides.",
        featured: false,
        includes: [
          ["2 Photographers", "10 hours"],
          ["2 Videographers", "10 hours"],
          ["Edited photos", "750+"],
          ["Highlight movie", "Up to 10 min"],
          ["Teaser videos", "2 reels"],
          ["Drone footage", "Included"],
          ["Posing master class + photoshoot", "Included"],
          ["Full movie", "Up to 30 min"]
        ],
        addons: ["Up to 60 min movie — $600", "Extra hour — $500"]
      }
    ]
  },

  /* NOTE: no written client reviews are published on bigdaymemories.com.
     The entries below are PLACEHOLDERS, labelled as such in the UI, until
     you replace them from the admin panel. The testimonial film is real. */
  loveLetters: {
    eyebrow: "Love letters",
    title: "In their words.",
    /* filmYoutube is a public reference placeholder from another studio,
       same disclosure as films.* above — replace before launch. */
    filmYoutube: "jUA_dR-rdFQ",
    filmLabel: "Real couples, real experiences — a note from the field",
    placeholder: true,
    items: [
      { quote: "Placeholder — replace with a real client review from the admin panel.", couple: "Couple name", location: "Venue, City", img: "assets/img/gallery/g02.webp" },
      { quote: "Placeholder — replace with a real client review from the admin panel.", couple: "Couple name", location: "Venue, City", img: "assets/img/gallery/g16.webp" },
      { quote: "Placeholder — replace with a real client review from the admin panel.", couple: "Couple name", location: "Venue, City", img: "assets/img/gallery/g34.webp" }
    ]
  },

  about: {
    eyebrow: "Inside the studio",
    title: "The people who will\nbe standing beside you.",
    body: [
      "We are here to support, guide, help you plan, lend a helping hand and, of course, document it all in the most stress free and enjoyable way.",
      "Twenty years and more than a thousand projects later, very little surprises us — which is exactly what you want on a day with a hundred moving parts. We will help you build the timeline, tell you when the light will be best, and be the calmest people in the room.",
      "Our home is a sun-drenched studio and event space in Bhiwani. Come by, meet us, and see the work printed."
    ],
    clips: [
      { src: "assets/video/about-1.mp4", label: "Behind the scenes" },
      { src: "assets/video/about-3.mp4", label: "On location" },
      { src: "assets/video/about-4.mp4", label: "In the studio" },
      { src: "assets/video/about-5.mp4", label: "Crew at work" },
      { src: "assets/video/about-6.mp4", label: "The details" }
    ],
    team: [],                /* no team members published on the reference site */
    teamNeedsReview: true
  },

  inquire: {
    eyebrow: "Let us begin",
    title: "Your story\nstarts here.",
    copy: "Tell us a little about your event. We will come back to you with availability, a real answer on pricing, and no pressure whatsoever.",
    submitLabel: "Check My Date",
    successTitle: "Thank you — that has arrived.",
    successCopy: "We will be in touch shortly about your date. If it is urgent, call us on +1 323-447-2333."
  },

  footer: {
    statement: "Photography and cinematography from a Bhiwani studio — weddings, events and campaigns, across India and anywhere in the world.",
    legalName: "Aasri Productions",
    copyrightFrom: "2018"
  }
};
