/* Villa Lumen · scroll-driven room tour
   The film is a single video. Scrolling maps to video time through a
   piecewise curve: the camera rests ("hold") at each room so the info card
   can be read, then plays the transition to the next room. */
(() => {
  "use strict";

  const M = window.MEDIA;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Room content ---------- */
  const ROOMS = [
    { name: "Die Ankunft", short: "Ankunft",
      text: "Eine Auffahrt aus Kalkstein, ein Wasserbecken mit Basaltgrund und eine Betonplatte, die acht Meter frei über dem Eingang schwebt.",
      facts: [["Auskragung", "8 m"], ["Pivot-Tür", "4 m"], ["Fassade", "Beton · Glas"]] },
    { name: "Das Foyer", short: "Foyer",
      text: "Doppelte Raumhöhe, buchgespiegelter Calacatta Viola und eine Treppe aus massiven Travertinstufen. Ein Lichtschlitz zeichnet die Tageszeit auf die Betonwand.",
      facts: [["Raumhöhe", "7 m"], ["Boden", "Calacatta Viola"], ["Treppe", "Travertin"]] },
    { name: "Der Wohnraum", short: "Wohnen",
      text: "Eine vierzehn Meter lange Glasfront lässt sich vollständig öffnen. Im Zentrum steht ein schwebender Kaminkörper aus Nero Marquina.",
      facts: [["Glasfront", "14 m"], ["Raumhöhe", "5 m"], ["Fläche", "140 m²"]] },
    { name: "Küche & Tafel", short: "Küche",
      text: "Eine monolithische Insel aus Calacatta Viola mit Wasserfallkanten, grifflose Fronten in geräucherter Eiche und eine Weinwand hinter Bronzeglas.",
      facts: [["Insel", "5 m"], ["Tafel", "12 Plätze"], ["Weinwand", "420 Fl."]] },
    { name: "Terrasse & Pool", short: "Terrasse",
      text: "Der Infinity-Pool geht optisch nahtlos in den See über. Ein versenkter Loungebereich mit Feuerstelle fängt die letzten Sonnenstunden ein.",
      facts: [["Pool", "25 m"], ["Terrasse", "310 m²"], ["Ausrichtung", "West"]] },
    { name: "Master Suite", short: "Suite",
      text: "Im obersten Geschoss öffnet sich eine rahmenlose Glasecke zum eigenen Balkon. Geölte Eiche und Sichtbeton halten den Raum ruhig.",
      facts: [["Fläche", "95 m²"], ["Balkon", "Auskragend"], ["Boden", "Eiche"]] },
    { name: "Das Spa", short: "Spa",
      text: "Eine Wanne aus einem einzigen Marmorblock vor dem See, eine begehbare Regendusche und ein kleiner Farngarten unter dem Oberlicht.",
      facts: [["Wanne", "Monolith"], ["Wände", "Calacatta"], ["Blick", "Seeseite"]] }
  ];

  /* ---------- Scroll → time curve ---------- */
  const FIRST_HOLD = 1.1, HOLD = 0.7, MOVE = 1.0, VH_PER_UNIT = 1.15;
  const stations = M.stations; // video time (s) at each room
  const segments = [];
  ROOMS.forEach((_, i) => {
    segments.push({ type: "hold", room: i, len: i === 0 ? FIRST_HOLD : HOLD });
    if (i < ROOMS.length - 1) segments.push({ type: "move", from: i, to: i + 1, len: MOVE });
  });
  const TOTAL = segments.reduce((s, x) => s + x.len, 0);

  const film = document.getElementById("film");
  film.style.setProperty("--film-h", `${Math.round(TOTAL * VH_PER_UNIT * 100 + 100)}vh`);

  // Position (in units) where each room's hold is centred, for the rail links.
  const holdCentre = [];
  {
    let u = 0;
    for (const s of segments) {
      if (s.type === "hold") holdCentre[s.room] = u + s.len * (s.room === 0 ? 0.55 : 0.5);
      u += s.len;
    }
  }

  function evaluate(u) {
    let acc = 0;
    for (const s of segments) {
      if (u <= acc + s.len || s === segments[segments.length - 1]) {
        const k = Math.min(1, Math.max(0, (u - acc) / s.len));
        if (s.type === "hold") return { time: stations[s.room], room: s.room, cardVisible: s.room === 0 ? k > 0.3 : true };
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // easeInOutQuad
        const time = stations[s.from] + (stations[s.to] - stations[s.from]) * e;
        const room = k < 0.5 ? s.from : s.to;
        return { time, room, cardVisible: k < 0.18 || k > 0.82 };
      }
      acc += s.len;
    }
    return { time: 0, room: 0, cardVisible: false };
  }

  /* ---------- Build chapters & rail ---------- */
  const chaptersEl = document.getElementById("chapters");
  const railEl = document.getElementById("rail");
  const pad = n => String(n).padStart(2, "0");

  const cards = ROOMS.map((r, i) => {
    const el = document.createElement("article");
    el.className = "chapter";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      `<div class="num">${pad(i + 1)}</div>` +
      `<h2>${r.name}</h2><p>${r.text}</p>` +
      `<dl>${r.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
    chaptersEl.appendChild(el);
    return el;
  });

  const railBtns = ROOMS.map((r, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Zu Raum ${i + 1}: ${r.short}`);
    b.innerHTML = `<span>${r.short}</span><i></i>`;
    b.addEventListener("click", () => goToRoom(i));
    railEl.appendChild(b);
    return b;
  });

  function scrollRange() { return film.offsetHeight - window.innerHeight; }
  function goToRoom(i) {
    const y = film.offsetTop + (holdCentre[i] / TOTAL) * scrollRange();
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ---------- Media ---------- */
  const video = document.getElementById("filmVideo");
  const poster = document.getElementById("filmPoster");
  const intro = document.getElementById("filmIntro");
  const hint = document.getElementById("scrollHint");
  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loaderFill");
  const loaderText = document.getElementById("loaderText");
  const tcRoom = document.getElementById("tcRoom");
  const nav = document.getElementById("nav");

  const small = window.matchMedia("(max-width: 820px)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  poster.src = small ? M.rooms[0].thumb : M.rooms[0].src;

  let videoReady = false;
  let posterRoom = 0;

  async function loadFilm() {
    const url = (small || saveData) ? M.videoMobile : M.video;
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok || !res.body) throw new Error("fetch failed");
      const total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        got += value.length;
        if (total) {
          const p = got / total;
          loaderFill.style.transform = `scaleX(${p})`;
          loaderText.textContent = `Rundgang wird geladen · ${Math.round(p * 100)} %`;
        }
      }
      video.src = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
    } catch (_) {
      video.preload = "auto";
      video.src = url; // fall back to streaming
    }
    await new Promise(r => {
      if (video.readyState >= 2) return r();
      video.addEventListener("loadeddata", r, { once: true });
    });
    // iOS Safari only paints seeked frames after the element has played once.
    try { await video.play(); video.pause(); } catch (_) {}
    video.currentTime = current;
    videoReady = true;
    video.classList.add("ready");
    loaderFill.style.transform = "scaleX(1)";
    loaderText.textContent = "Bereit";
    loader.classList.add("done");
    hint.classList.add("show");
  }

  /* ---------- Frame loop ---------- */
  let target = 0, current = 0, lastRoom = -1, lastCard = -1;

  function onScroll() {
    const range = scrollRange();
    const p = Math.min(1, Math.max(0, (window.scrollY - film.offsetTop) / range));
    const st = evaluate(p * TOTAL);
    target = st.time;

    intro.classList.toggle("gone", p * TOTAL > 0.28);
    nav.classList.toggle("solid", window.scrollY > film.offsetTop + range - 40);

    const showCard = st.cardVisible && p * TOTAL > 0.28 ? st.room : -1;
    if (showCard !== lastCard) {
      cards.forEach((c, i) => {
        const on = i === showCard;
        c.classList.toggle("active", on);
        c.setAttribute("aria-hidden", on ? "false" : "true");
      });
      lastCard = showCard;
    }
    if (st.room !== lastRoom) {
      railBtns.forEach((b, i) => {
        b.classList.toggle("on", i === st.room);
        b.classList.toggle("passed", i < st.room);
        if (i === st.room) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      tcRoom.textContent = pad(st.room + 1);
      if (!videoReady && st.room !== posterRoom) {
        posterRoom = st.room;
        poster.src = small ? M.rooms[st.room].thumb : M.rooms[st.room].src;
      }
      lastRoom = st.room;
    }
  }

  function tick() {
    const d = target - current;
    current = reduceMotion || Math.abs(d) < 0.002 ? target : current + d * 0.14;
    if (videoReady && !video.seeking && Math.abs(video.currentTime - current) > 0.02) {
      video.currentTime = current;
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  requestAnimationFrame(tick);
  loadFilm();

  /* ---------- Gallery & lightbox ---------- */
  const grid = document.getElementById("galleryGrid");
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");

  M.gallery.forEach((g, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "g-item" + (g.wide ? " wide" : "");
    btn.setAttribute("aria-label", `${g.caption} vergrößern`);
    const fig = document.createElement("figure");
    fig.style.margin = "0";
    fig.style.height = "100%";
    const img = new Image();
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = g.caption;
    img.src = g.thumb;
    img.addEventListener("load", () => img.classList.add("loaded"));
    const cap = document.createElement("figcaption");
    cap.textContent = g.caption;
    fig.append(img, cap);
    btn.appendChild(fig);
    btn.addEventListener("click", () => {
      lbImg.src = g.src;
      lbImg.alt = g.caption;
      lbCap.textContent = g.caption;
      lb.showModal();
    });
    grid.appendChild(btn);
  });
  document.getElementById("lbClose").addEventListener("click", () => lb.close());
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  lb.addEventListener("close", () => { lbImg.removeAttribute("src"); });

  /* ---------- Contact form (preview only) ---------- */
  const form = document.getElementById("contactForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    const check = (id, errId, test, msg) => {
      const input = document.getElementById(id);
      const err = document.getElementById(errId);
      const valid = test(input.value.trim());
      input.setAttribute("aria-invalid", valid ? "false" : "true");
      input.setAttribute("aria-describedby", errId);
      err.textContent = valid ? "" : msg;
      if (!valid && ok) { input.focus(); ok = false; }
    };
    check("f-name", "e-name", v => v.length > 1, "Bitte geben Sie Ihren Namen an.");
    check("f-mail", "e-mail", v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Bitte geben Sie eine gültige E-Mail-Adresse an.");
    if (ok) {
      document.getElementById("formStatus").textContent =
        "Danke. Dies ist eine Designvorschau, die Anfrage wurde nicht versendet.";
      form.reset();
    }
  });
})();
