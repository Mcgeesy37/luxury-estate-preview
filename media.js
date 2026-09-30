/* Media hosted on the Higgsfield CDN (CORS enabled). */
(() => {
  const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3FChx5WXLy8y12Ce3etPH90KSLq/hf_20260930_";
  const img = id => CDN + id + "_min.webp";

  const K = {
    exterior: img("211219_67a44e6f-33bd-4f36-81fe-ea0075f505b0"),
    foyer:    img("211221_2cfef250-7030-4b81-8d9d-4b68790b7fcd"),
    living:   img("211219_dcee11c6-4209-4164-b5de-f3db0baaa285"),
    kitchen:  img("211220_30bd9521-9bf1-494b-ae95-0d4d45e6ee35"),
    terrace:  img("211220_89b95d92-3c47-4561-b1f8-3637010b8336"),
    suite:    img("211219_81ead7f4-ca2b-4601-aca2-aa1c1bd1897d"),
    spaEve:   img("212010_53ad1b6f-e3d5-49d7-8a77-0cf2b806ee7d"),
    spaDay:   img("211221_53afd5e9-00c2-4612-a961-8e9633ffb63b"),
    spaDark:  img("212010_655c4abb-00a7-4733-a7c0-29cc2d185a8d"),
    spaRain:  img("212011_8576efd9-8edf-4c9b-8303-62e86b3ed1ce"),
    spaSauna: img("212010_88c151d9-168e-4cc9-9747-f6433242423d")
  };

  window.MEDIA = {
    video: "https://d2ol7oe51mr4n9.cloudfront.net/user_3FChx5WXLy8y12Ce3etPH90KSLq/775485fd-d964-43ab-9f09-77393147c196.mp4",
    videoMobile: "https://d2ol7oe51mr4n9.cloudfront.net/user_3FChx5WXLy8y12Ce3etPH90KSLq/e643f4f2-ff35-4a6c-b94a-906609bbb9a5.mp4",
    stations: [0.0, 7.958, 15.917, 23.875, 31.833, 39.792, 47.74],
    rooms: [K.exterior, K.foyer, K.living, K.kitchen, K.terrace, K.suite, K.spaEve].map(u => ({ src: u, thumb: u })),
    gallery: [
      { src: K.exterior, thumb: K.exterior, caption: "Ankunft · Sichtbeton-Auskragung und Walnuss-Pivot-Tür", wide: true },
      { src: K.foyer,    thumb: K.foyer,    caption: "Foyer · Calacatta Viola und Travertin-Treppe" },
      { src: K.living,   thumb: K.living,   caption: "Wohnraum · Kamin aus Nero Marquina" },
      { src: K.kitchen,  thumb: K.kitchen,  caption: "Küche · Marmorinsel mit Wasserfallkanten", wide: true },
      { src: K.terrace,  thumb: K.terrace,  caption: "Terrasse · 25-m-Infinity-Pool bei Sonnenuntergang", wide: true },
      { src: K.suite,    thumb: K.suite,    caption: "Master Suite · Glasecke zum Balkon" },
      { src: K.spaEve,   thumb: K.spaEve,   caption: "Spa · Abendstimmung" },
      { src: K.spaDay,   thumb: K.spaDay,   caption: "Spa · Golden Hour" },
      { src: K.spaRain,  thumb: K.spaRain,  caption: "Spa · Blick aus der Regendusche" },
      { src: K.spaSauna, thumb: K.spaSauna, caption: "Spa · Sauna und Kamin", wide: true },
      { src: K.spaDark,  thumb: K.spaDark,  caption: "Materialvariante · Nero Marquina und Verde Alpi" }
    ]
  };
})();
