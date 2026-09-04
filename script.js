// HandWriter — small progressive-enhancement script.
// No frameworks, no tracking. Pen picker, tabs, and a restrained scroll reveal.

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Pen color picker ---------- */
  const swatches = document.querySelectorAll('.pen-swatch');
  const sampleTexts = document.querySelectorAll('[data-sample-text]');
  const penNameEl = document.querySelector('[data-pen-name]');

  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      swatches.forEach((s) => {
        s.classList.remove('is-active');
        s.setAttribute('aria-pressed', 'false');
      });
      swatch.classList.add('is-active');
      swatch.setAttribute('aria-pressed', 'true');

      const color = swatch.dataset.pen;
      const name = swatch.dataset.name;

      sampleTexts.forEach((el) => {
        el.style.setProperty('--pen-color', color);
      });
      if (penNameEl) penNameEl.textContent = name;
    });
  });

  /* ---------- Mobile menu drawer ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
    };
    const openMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('is-open');
      mobileNav.setAttribute('aria-hidden', 'false');
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    mobileNav.querySelectorAll('[data-nav-link]').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Accessible tabs with sliding indicator ---------- */
  const tabsRoot = document.querySelector('[data-tabs]');
  if (tabsRoot) {
    const tabs = Array.from(tabsRoot.querySelectorAll('.tab'));
    const panels = Array.from(tabsRoot.querySelectorAll('.tab-panel'));
    const indicator = tabsRoot.querySelector('.tab-indicator');

    function moveIndicator(tab) {
      if (!indicator) return;
      indicator.style.width = tab.offsetWidth + 'px';
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    }

    function activateTab(targetTab) {
      tabs.forEach((tab) => {
        const isActive = tab === targetTab;
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== targetTab.getAttribute('aria-controls');
      });
      moveIndicator(targetTab);
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(tab);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = tabs[(i + 1) % tabs.length];
          next.focus();
          activateTab(next);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = tabs[(i - 1 + tabs.length) % tabs.length];
          prev.focus();
          activateTab(prev);
        }
      });
    });

    // Initial indicator position (after fonts/layout settle).
    window.requestAnimationFrame(() => {
      const active = tabsRoot.querySelector('.tab[aria-selected="true"]');
      if (active) moveIndicator(active);
    });
    window.addEventListener('resize', () => {
      const active = tabsRoot.querySelector('.tab[aria-selected="true"]');
      if (active) moveIndicator(active);
    });
  }

  /* ---------- Scroll reveal (once per section) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }
});
