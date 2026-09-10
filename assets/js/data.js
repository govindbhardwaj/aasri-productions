/* =============================================================
   Aasri Productions — content source of truth
   -------------------------------------------------------------
   Every string rendered on the site lives here. The Firebase admin
   panel writes overrides into Firestore (site/content); store.js
   deep-merges those over this object at runtime, so the site always
   renders correctly even with Firebase unconfigured.

   PROVENANCE:
   - Business facts (phone, socials, stats, packages, "Est. 2018", the
     studio name and map pin) were built against bigdaymemories.com as
     a design reference and still belong to that studio. Replace them
     with Aasri Productions' own before this goes live.
   - Photography and video (gallery, story cards, hero, reels, about
     clips) are free-to-use stock media from Pexels, chosen to show
     Indian wedding ceremonies and celebrations rather than the
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
    tagline: "You live the day. We keep it.",
    taglineNeedsReview: true,          /* placeholder — replace with Aasri's own line */
    phone: "+1 323-447-2333",
    phoneHref: "tel:+13234472333",
    email: "",                         /* not published on the reference site */
    emailNeedsReview: true,
    studioName: "Solar Space Studio",
    studioNote: "our main office / creative space",
    city: "Downtown Los Angeles, California",
    streetAddress: "",                 /* not published on the reference site */
    addressNeedsReview: true,
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d52896.3874045477!2d-118.250035!3d34.04325!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c7919a9bd2b9%3A0xe31e3fe2d68f7e3!2sBig%20Day%20Memories!5e0!3m2!1sen!2sus!4v1744915395291!5m2!1sen!2sus",
    startingAt: "$2,999",
    founded: "2018",
    /* Carried over from the reference site — must be replaced. */
    identityNeedsReview: true,
    social: {
      instagram: "https://www.instagram.com/bigdaymemories/",
      youtube: "https://www.youtube.com/@bigdaymemories_la",
      facebook: "https://www.facebook.com/profile.php?id=100086097605146"
    }
  },

  hero: {
    eyebrow: "Wedding Photography &amp; Cinematography — Los Angeles &amp; Worldwide",
    headlineTop: "The moments",
    headlineEm: "you will live in",
    headlineBottom: "forever.",
    sub: "Twenty years behind the camera, more than a thousand weddings, and one promise: you live the day, we keep every part of it worth keeping.",
    primaryCta: { label: "Check Your Date", href: "#inquire" },
    secondaryCta: { label: "Watch a Wedding Film", href: "#films" },
    video: "assets/video/hero.mp4",
    poster: "assets/img/posters/video-poster-00001.jpg"
  },

  manifesto: {
    words: ["Elegant", "Cinematic", "Unhurried", "Yours"],
    lead: "A wedding lasts a day. The way it felt should last considerably longer.",
    body: "We photograph and film weddings the way you will want to remember them — the half-second before the vows, the hand your father would not let go of, the room at midnight. Nothing staged that should not be. Nothing missed that matters."
  },

  /* Stats and promises — all published on bigdaymemories.com */
  difference: {
    eyebrow: "Why couples choose us",
    title: "Twenty years of first looks,\nlast dances and everything between.",
    items: [
      { figure: "20",   suffix: "+",         label: "Years",          copy: "More than 20 years in the wedding industry." },
      { figure: "1000", suffix: "+",         label: "Weddings",       copy: "Photographed and filmed more than 1000 weddings worldwide." },
      { figure: "3",    suffix: " days",     label: "Sneak peek",     copy: "Just 3 days to see a sneak peek of your celebration." },
      { figure: "30",   suffix: "–45 days", label: "Final delivery", copy: "Your complete gallery and films, delivered in 30 to 45 days." }
    ],
    notes: [
      { title: "Excellence",          copy: "Top rated, award-winning service in LA." },
      { title: "A beautiful studio",  copy: "A sun-drenched studio and event space in LA downtown." },
      { title: "Beside you all the way", copy: "We are here to support, guide, help you plan, lend a helping hand and, of course, document your Big Day in the most stress free and enjoyable way." }
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
    items: [
      { id: "r1", src: "assets/video/reels-1-transcode.mp4", poster: "assets/img/posters/reels-1-poster-00001.jpg", w: 404, h: 720, caption: "The grand entrance",  alt: "Bride walking through a smoke-filled floral mandap entrance", instagram: "" },
      { id: "r2", src: "assets/video/a-2-transcode.mp4",     poster: "assets/img/posters/a-2-poster-00001.jpg",     w: 300, h: 300, caption: "The ritual",         alt: "Close-up of a bridal ceremony ritual in red and gold",         instagram: "" },
      { id: "r3", src: "assets/video/a-3-transcode.mp4",     poster: "assets/img/posters/a-3-poster-00001.jpg",     w: 300, h: 300, caption: "The bride",          alt: "Bride portrait in traditional jewelry and attire",             instagram: "" },
      { id: "r4", src: "assets/video/a-4-transcode.mp4",     poster: "assets/img/posters/a-4-poster-00001.jpg",     w: 300, h: 300, caption: "The reveal",         alt: "Bride lifting her red dupatta, close portrait",                instagram: "" },
      { id: "r5", src: "assets/video/a-5-transcode.mp4",     poster: "assets/img/posters/a-5-poster-00001.jpg",     w: 300, h: 300, caption: "Mehndi magic",       alt: "Close-up of intricate mehndi on the bride's hands",            instagram: "" }
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
    eyebrow: "Wedding films",
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
    title: "Everything your day\nneeds remembering by.",
    items: [
      { name: "Wedding Photography",  copy: "Candid moments, portraits, details, ceremony and celebration — two cameras, all day, nothing missed.", img: "assets/img/gallery/g08.webp" },
      { name: "Wedding Videography",  copy: "Cinematic highlight films and documentary coverage, from getting ready to the last dance.",                 img: "assets/img/gallery/g14.webp" },
      { name: "Engagement Sessions",  copy: "A relaxed photo shoot built around the two of you — and the best rehearsal for your wedding day.",      img: "assets/img/gallery/g12.webp" },
      { name: "Engagement Films",     copy: "Short cinematic engagement stories, shot on location and cut like a trailer.",                              img: "assets/img/gallery/g18.webp" },
      { name: "Drone Cinematography", copy: "Aerial perspective on your venue, your coastline, your celebration from above.",                            img: "assets/img/gallery/g31.webp" },
      { name: "Reels &amp; Teasers",  copy: "Vertical, share-ready films within days — the first thing everyone asks for.",                          img: "assets/img/gallery/g20.webp" },
      { name: "Full Wedding Movies",  copy: "The long-form film: up to 30 or 60 minutes of your day, start to finish.",                                  img: "assets/img/gallery/g03.webp" },
      { name: "Destination Weddings", copy: "We have filmed weddings worldwide. Tell us where, and we will be there.",                                   img: "assets/img/gallery/g27.webp" },
      { name: "Posing Master Class",  copy: "An in-person session so you know exactly how to stand, move and look on the day.",                          img: "assets/img/gallery/g26.webp" }
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
      "We are here to support, guide, help you plan, lend a helping hand and, of course, document your Big Day in the most stress free and enjoyable way.",
      "Twenty years and more than a thousand weddings later, very little surprises us — which is exactly what you want on a day with a hundred moving parts. We will help you build the timeline, tell you when the light will be best, and be the calmest people in the room.",
      "Our home is a sun-drenched studio and event space in downtown Los Angeles. Come by, meet us, and see the work printed."
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
    title: "Your big day\nstarts here.",
    copy: "Tell us a little about your wedding. We will come back to you with availability, a real answer on pricing, and no pressure whatsoever.",
    submitLabel: "Check My Date",
    successTitle: "Thank you — that has arrived.",
    successCopy: "We will be in touch shortly about your date. If it is urgent, call us on +1 323-447-2333.",
    services: ["Wedding Photography", "Wedding Videography", "Photo + Video", "Engagement Session", "Engagement Film", "Drone Coverage", "Destination Wedding", "Not sure yet"],
    heardAbout: ["Instagram", "YouTube", "Google", "A friend or family member", "A wedding planner or venue", "Other"]
  },

  footer: {
    statement: "Wedding photography and cinematography from a downtown Los Angeles studio — for celebrations in California and anywhere in the world.",
    legalName: "Aasri Productions",
    copyrightFrom: "2018"
  }
};
