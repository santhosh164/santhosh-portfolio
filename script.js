
(() => {
  "use strict";

  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle?.querySelector("i");
  const copyEmail = document.getElementById("copyEmail");
  const copyFeedback = document.getElementById("copyFeedback");
  const backToTop = document.getElementById("backToTop");
  const year = document.getElementById("currentYear");
  const navItems = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];

  if (year) year.textContent = new Date().getFullYear();

  // Theme: save preference when storage is available, but still work if it is blocked.
  const applyTheme = (theme) => {
    const isLight = theme === "light";
    root.classList.toggle("light-theme", isLight);
    if (themeIcon) {
      themeIcon.className = isLight ? "fa-regular fa-sun" : "fa-regular fa-moon";
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
      themeToggle.title = isLight ? "Switch to dark theme" : "Switch to light theme";
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", isLight ? "#f7f8fc" : "#0b0d12");
  };

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("santhosh-portfolio-theme"); } catch (_) {}
  const preferredTheme = savedTheme || (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(preferredTheme);

  themeToggle?.addEventListener("click", () => {
    const next = root.classList.contains("light-theme") ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem("santhosh-portfolio-theme", next); } catch (_) {}
  });

  // Mobile navigation
  const closeMenu = () => {
    navLinks?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation menu");
  };
  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "Close navigation menu" : "Open navigation menu");
    navLinks?.classList.toggle("open", willOpen);
  });
  navItems.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  document.addEventListener("click", event => {
    if (!navLinks?.classList.contains("open")) return;
    if (!navLinks.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });

  // Header and back-to-top visibility
  const handleScroll = () => {
    const y = window.scrollY || 0;
    header?.classList.toggle("scrolled", y > 8);
    backToTop?.classList.toggle("visible", y > 550);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // Highlight the navigation item for the section in view.
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navItems.forEach(link => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -60% 0px", threshold: [0, .15, .35, .6] });
    sections.forEach(section => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
  }

  // Accessible project filters
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const projectCards = [...document.querySelectorAll(".project-card")];
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach(card => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
    });
  });

  // Copy email with a graceful fallback and clear feedback.
  copyEmail?.addEventListener("click", async () => {
    const email = copyEmail.dataset.email;
    if (!email || !copyFeedback) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = email;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand("copy");
        temporary.remove();
        if (!copied) throw new Error("Copy unavailable");
      }
      copyFeedback.textContent = "Email address copied.";
    } catch (_) {
      copyFeedback.textContent = `Email: ${email}`;
    }
    window.setTimeout(() => { if (copyFeedback) copyFeedback.textContent = ""; }, 4500);
  });
})();
