/* GetTicketless — interactions */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;

  /* ---------- Language ---------- */
  const titles = {
    fr: "GetTicketless — Externalisation Support Client BPO Nearshore (SaaS & E-commerce)",
    en: "GetTicketless — Dedicated Customer Support Teams & BPO (SaaS & E-commerce)",
  };
  const getLang = () => root.dataset.lang;
  function setLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang;
    document.title = titles[lang];
    $$("[data-set-lang]").forEach(b => b.classList.toggle("active", b.dataset.setLang === lang));
    $$("[data-ph-" + lang + "]").forEach(el => (el.placeholder = el.dataset["ph" + lang[0].toUpperCase() + lang[1]]));
    try { localStorage.setItem("gt-lang", lang); } catch (e) {}
    updateCalc();
    renderTickets(true);
  }
  $$("[data-set-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.setLang)));

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const links = $("#nav-links");
  $("#burger").addEventListener("click", () => links.classList.toggle("open"));
  $$("a", links).forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

  /* ---------- Reveal + counters + bars ---------- */
  const animateCount = el => {
    const target = +el.dataset.count;
    const dur = 1600;
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");
      $$("[data-count]", el).forEach(animateCount);
      $$(".bar i", el).forEach(b => (b.style.width = b.dataset.w + "%"));
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- Service card glow follows cursor ---------- */
  $$(".service").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- Live ticket feed (hero cockpit) ---------- */
  const feed = {
    fr: [
      ["Camille R.", "Où en est ma commande #48213 ?", "Gorgias", "Amine K.", "il y a 1m", "solved", "✓ Résolu · 1m40"],
      ["James T.", "Can't connect my Stripe account", "Zendesk", "Sarah L.", "il y a 2m", "prog", "⚡ En cours"],
      ["Inès B.", "Demande de remboursement taille M", "Shopify", "Inès S.", "il y a 4m", "solved", "✓ Résolu · 2m10"],
      ["Lucas M.", "Comment exporter mes factures ?", "Intercom", "Yacine M.", "il y a 5m", "new", "● Nouveau"],
      ["Emma W.", "Upgrade to annual enterprise plan", "Zendesk", "Amine K.", "il y a 7m", "solved", "✓ Résolu · 1m15"],
      ["Yanis K.", "Code promo VIP non déduit au panier", "Gorgias", "Sarah L.", "il y a 9m", "prog", "⚡ En cours"],
      ["Chloé D.", "Bug sur l'app iOS v2.4 après update", "Crisp", "Yacine M.", "il y a 12m", "new", "● Nouveau"],
      ["Noah P.", "Need an updated invoice with VAT", "Zendesk", "Inès S.", "il y a 15m", "solved", "✓ Résolu · 48s"],
    ],
    en: [
      ["Camille R.", "Where is my order #48213?", "Gorgias", "Amine K.", "1m ago", "solved", "✓ Solved · 1m40"],
      ["James T.", "Can't connect my Stripe account", "Zendesk", "Sarah L.", "2m ago", "prog", "⚡ In progress"],
      ["Inès B.", "Refund request for size M", "Shopify", "Inès S.", "4m ago", "solved", "✓ Solved · 2m10"],
      ["Lucas M.", "How do I export my invoices?", "Intercom", "Yacine M.", "5m ago", "new", "● New"],
      ["Emma W.", "Upgrade to annual enterprise plan", "Zendesk", "Amine K.", "7m ago", "solved", "✓ Solved · 1m15"],
      ["Yanis K.", "VIP promo code not applied at checkout", "Gorgias", "Sarah L.", "9m ago", "prog", "⚡ In progress"],
      ["Chloé D.", "iOS app v2.4 bug after update", "Crisp", "Yacine M.", "12m ago", "new", "● New"],
      ["Noah P.", "Need an updated invoice with VAT", "Zendesk", "Inès S.", "15m ago", "solved", "✓ Solved · 48s"],
    ],
  };
  const colors = ["#111827", "#1E40AF", "#047857", "#374151", "#6D28D9", "#0369A1"];
  const ticketsEl = $("#tickets");
  let tIdx = 0;
  function ticketHTML([name, msg, channel, agent, time, cls, label], i) {
    const initials = name.split(" ").map(w => w[0]).join("");
    const chLower = channel.toLowerCase();
    const isFr = getLang() === "fr";
    return `<div class="ticket">
      <div class="avatar" style="background:${colors[i % colors.length]}">${initials}</div>
      <div class="ticket-body">
        <div class="ticket-meta">
          <span class="ticket-name">${name}</span>
          <span class="ticket-dot">·</span>
          <span class="ticket-channel ${chLower}">${channel}</span>
          <span class="ticket-dot">·</span>
          <span class="ticket-time">${time}</span>
        </div>
        <div class="ticket-msg">${msg}</div>
        <div class="ticket-agent">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>${isFr ? 'Agent dédié' : 'Dedicated agent'} : <strong>${agent}</strong></span>
        </div>
      </div>
      <span class="tag ${cls}">${label}</span>
    </div>`;
  }
  function renderTickets(reset) {
    if (!ticketsEl) return;
    const list = feed[getLang()];
    if (reset) {
      ticketsEl.innerHTML = "";
      for (let i = 0; i < 4; i++) ticketsEl.insertAdjacentHTML("beforeend", ticketHTML(list[(tIdx + i) % list.length], tIdx + i));
      return;
    }
    tIdx = (tIdx + 1) % list.length;
    ticketsEl.insertAdjacentHTML("afterbegin", ticketHTML(list[tIdx], tIdx));
    while (ticketsEl.children.length > 5) ticketsEl.lastElementChild.remove();
  }
  let solved = 1284;
  setInterval(() => {
    renderTickets(false);
    solved += Math.floor(Math.random() * 3) + 1;
    const solvedEl = $("#kpi-solved");
    if (solvedEl) solvedEl.textContent = solved.toLocaleString("en-US");
  }, 2800);

  /* ---------- World clocks ---------- */
  function updateClocks() {
    $$("[data-tz]").forEach(el => {
      el.textContent = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: el.dataset.tz }).format(new Date());
    });
  }
  updateClocks();
  setInterval(updateClocks, 30000);

  /* ---------- Savings calculator ---------- */
  const IN_HOUSE = 3800;
  const range = $("#agents-range");
  let mult = 1, base = 1290;
  const fmt = n => new Intl.NumberFormat(getLang() === "fr" ? "fr-FR" : "en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  function volumeDiscount(n) { return n >= 20 ? 0.9 : n >= 10 ? 0.95 : 1; }
  function updateCalc() {
    if (!range) return;
    const n = +range.value;
    $("#agents-val").textContent = n;
    const inhouse = n * IN_HOUSE * mult * 12;
    const gt = n * base * mult * volumeDiscount(n) * 12;
    const save = inhouse - gt;
    const per = getLang() === "fr" ? " /an" : " /yr";
    $("#inhouse-cost").textContent = fmt(inhouse) + per;
    $("#gt-cost").textContent = fmt(gt) + per;
    $("#savings").textContent = fmt(save);
    const pct = Math.round((save / inhouse) * 100);
    $("#savings-pct").textContent = getLang() === "fr"
      ? `Soit ${pct} % d'économie${n >= 10 ? " (remise volume incluse)" : ""}.`
      : `That's ${pct}% saved${n >= 10 ? " (volume discount included)" : ""}.`;
    const pctFill = ((n - 1) / 49) * 100;
    range.style.background = `linear-gradient(90deg, #111827 ${pctFill}%, #E5E7EB ${pctFill}%)`;
  }
  range && range.addEventListener("input", updateCalc);
  const segs = (id, cb) => $$("#" + id + " button").forEach(b => b.addEventListener("click", () => {
    $$("#" + id + " button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    cb(b);
    updateCalc();
  }));
  segs("coverage-seg", b => (mult = +b.dataset.mult));
  segs("channel-seg", b => (base = +b.dataset.base));

  /* ---------- FAQ ---------- */
  $$(".faq-item").forEach(item => {
    $(".faq-q", item).addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq-item.open").forEach(o => { o.classList.remove("open"); $(".faq-a", o).style.maxHeight = 0; });
      if (!open) { item.classList.add("open"); const a = $(".faq-a", item); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- Contact form (opens email client) ---------- */
  const form = $("#contact-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const msg = $("#form-msg");
    const fr = getLang() === "fr";
    if (!d.name || !/^\S+@\S+\.\S+$/.test(d.email)) {
      msg.style.color = "var(--rose-500)";
      msg.textContent = fr ? "Merci d'indiquer votre nom et un e-mail valide." : "Please enter your name and a valid email.";
      return;
    }
    const subject = encodeURIComponent(`${fr ? "Demande de devis" : "Quote request"} — ${d.company || d.name}`);
    const body = encodeURIComponent(
      `${fr ? "Nom" : "Name"}: ${d.name}\nEmail: ${d.email}\n${fr ? "Entreprise" : "Company"}: ${d.company}\n${fr ? "Agents" : "Agents"}: ${d.agents}\n\n${d.message}`
    );
    location.href = `mailto:hello@getticketless.com?subject=${subject}&body=${body}`;
    msg.style.color = "var(--emerald-600)";
    msg.textContent = fr ? "Merci ! Votre client e-mail va s'ouvrir. Réponse sous 24h." : "Thanks! Your email client will open. We reply within 24h.";
    form.reset();
  });

  /* ---------- Init ---------- */
  $("#year").textContent = new Date().getFullYear();
  let saved = null;
  try { saved = localStorage.getItem("gt-lang"); } catch (e) {}
  const initial = saved || (navigator.language || "fr").startsWith("fr") ? (saved || "fr") : "en";
  setLang(initial);
})();
