(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- intro: once per session, click to skip ---------- */
  const intro = $("#intro");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = false;
  try { seen = sessionStorage.getItem("ak-intro") === "1"; } catch {}
  if (!intro || seen || reduce) {
    intro?.remove();
  } else {
    document.body.classList.add("intro-playing");
    const done = () => { document.body.classList.remove("intro-playing"); intro.remove(); };
    intro.addEventListener("animationend", (e) => { if (e.animationName === "intro-out") done(); });
    intro.addEventListener("click", () => intro.classList.add("is-skipped"));
    setTimeout(done, 3200); // safety net
    try { sessionStorage.setItem("ak-intro", "1"); } catch {}
  }

  /* ---------- nav: solid on scroll + current section ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = $$(".nav__links a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ---------- mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#navLinks");
  const setMenu = (open) => { burger.setAttribute("aria-expanded", open); menu.classList.toggle("is-open", open); };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  links.forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- modal ---------- */
  const modal = $("#modal");
  const body = $("#modalBody");
  const open = (key) => {
    const tpl = $("#tpl-" + key);
    if (!tpl) return;
    body.replaceChildren(tpl.content.cloneNode(true));
    modal.showModal();
    modal.scrollTop = 0;
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("a[href]")) return; // let real links (GitHub) work
    const trigger = e.target.closest("[data-open]");
    if (trigger) open(trigger.dataset.open);
  });
  $$(".title-card").forEach((card) =>
    card.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target === card) { e.preventDefault(); open(card.dataset.open); }
    })
  );
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) modal.close();
  });

  /* ---------- season tabs ---------- */
  const tabs = $$(".season");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on);
        const panel = $("#" + t.dataset.season);
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
      });
    })
  );

  /* ---------- row arrows ---------- */
  $$("[data-scroll]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const track = btn.parentElement.querySelector(".row__track");
      track.scrollBy({ left: Number(btn.dataset.scroll) * track.clientWidth * 0.8, behavior: "smooth" });
    })
  );

  /* ---------- footer year ---------- */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
