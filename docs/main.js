import { animate, stagger, inView } from "https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function show(el) {
  if (!el) return;
  el.style.opacity = "1";
  el.style.transform = "none";
}

function prepareHidden(selector, y = 24) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px)`;
  });
}

function runHero() {
  const brand = document.querySelector(".hero-brand");
  const headline = document.querySelector(".hero-headline");
  const lead = document.querySelector(".hero-lead");
  const cta = document.querySelector(".hero-cta");
  const phone = document.querySelector(".phone");
  const visit = document.querySelector(".mock-visit");
  const rows = document.querySelectorAll(".mock-row");

  if (reduced) {
    [brand, headline, lead, cta, phone, visit, ...rows].forEach(show);
    return;
  }

  prepareHidden(".hero-brand, .hero-headline, .hero-lead, .hero-cta", 28);
  if (phone) {
    phone.style.opacity = "0";
    phone.style.transform = "translateY(36px)";
  }
  prepareHidden(".mock-visit", 16);
  prepareHidden(".mock-row", 12);

  animate(
    [brand, headline, lead, cta].filter(Boolean),
    { opacity: [0, 1], y: [28, 0] },
    { delay: stagger(0.1), duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  );

  if (phone) {
    animate(
      phone,
      { opacity: [0, 1], y: [36, 0] },
      { delay: 0.25, duration: 0.85, ease: [0.22, 1, 0.36, 1] }
    ).finished.then(() => {
      animate(
        phone,
        { y: [0, -10, 0] },
        { duration: 5.5, ease: "easeInOut", repeat: Infinity }
      );
    });
  }

  animate(
    visit,
    { opacity: [0, 1], y: [16, 0] },
    { delay: 0.45, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  );

  animate(
    rows,
    { opacity: [0, 1], y: [12, 0] },
    { delay: stagger(0.08, { start: 0.6 }), duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  );
}

function runReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (reduced) {
    items.forEach(show);
    return;
  }

  items.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
  });

  inView(
    ".reveal",
    (element) => {
      animate(
        element,
        { opacity: [0, 1], y: [28, 0] },
        { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
      );
    },
    { margin: "0px 0px -8% 0px" }
  );
}

runHero();
runReveals();
