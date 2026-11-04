window.addEventListener("load", function() {
  updateSim();
  initLeafletMap();
  init3DScene();
  initCauseAnimations();
  initNavigation();
  initMitigationTabs();
  initDatabaseDialog();
  initScrollToTop();
});

function initNavigation() {
  var nav = document.querySelector("nav");
  var navLinks = document.getElementById("primaryNavLinks");
  var toggle = document.querySelector(".nav-toggle");
  var links = Array.from(navLinks.querySelectorAll("a[href^='#']"));
  var indicator = navLinks.querySelector(".nav-indicator");
  var animationFrame = null;

  function closeMenu(returnFocus) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Buka menu navigasi");
    navLinks.classList.remove("is-open");
    if (returnFocus) toggle.focus();
  }

  function updateActiveLink() {
    animationFrame = null;
    var threshold = nav.offsetHeight + 96;
    var activeId = "hero";
    var activePosition = -Infinity;

    links.forEach(function(link) {
      var target = document.querySelector(link.getAttribute("href"));
      var position = target ? target.getBoundingClientRect().top : Infinity;
      if (target && position <= threshold && position >= activePosition) {
        activeId = target.id;
        activePosition = position;
      }
    });

    var activeLink = null;
    links.forEach(function(link) {
      var isActive = link.getAttribute("href") === "#" + activeId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
        activeLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (activeLink) {
      var indicatorWidth = Math.min(24, activeLink.offsetWidth - 12);
      var indicatorOffset = activeLink.offsetLeft + (activeLink.offsetWidth - indicatorWidth) / 2;
      indicator.style.width = indicatorWidth + "px";
      indicator.style.transform = "translateX(" + indicatorOffset + "px)";
    }
  }

  function scheduleActiveLinkUpdate() {
    if (animationFrame === null) animationFrame = window.requestAnimationFrame(updateActiveLink);
  }

  toggle.addEventListener("click", function() {
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Buka menu navigasi" : "Tutup menu navigasi");
    navLinks.classList.toggle("is-open", !isOpen);
  });

  links.forEach(function(link) {
    link.addEventListener("click", function() {
      if (window.matchMedia("(max-width: 900px)").matches) closeMenu(false);
    });
  });

  document.addEventListener("click", function(event) {
    if (!nav.contains(event.target) && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu(false);
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  window.addEventListener("scroll", scheduleActiveLinkUpdate, { passive: true });
  window.addEventListener("resize", function() {
    scheduleActiveLinkUpdate();
    if (!window.matchMedia("(max-width: 900px)").matches && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu(false);
    }
  });
  updateActiveLink();
}

function initMitigationTabs() {
  var tabs = Array.from(document.querySelectorAll(".mitigation-tab"));
  var panels = Array.from(document.querySelectorAll(".mitigation-panel"));

  tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      var selectedPhase = tab.dataset.phase;
      tabs.forEach(function(item) {
        item.setAttribute("aria-pressed", String(item === tab));
      });
      panels.forEach(function(panel) {
        panel.hidden = panel.dataset.panel !== selectedPhase;
      });
    });
  });
}

function initDatabaseDialog() {
  var dialog = document.getElementById("databaseDialog");
  if (!dialog) return;
  dialog.addEventListener("click", function(event) {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && dialog.open) {
      event.preventDefault();
      dialog.close();
    }
  });
}

function initScrollToTop() {
  var button = document.getElementById("scrollTop");
  if (!button) return;

  function updateVisibility() {
    button.classList.toggle("show", window.scrollY > 420);
  }

  button.addEventListener("click", function() {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  window.addEventListener("scroll", updateVisibility, { passive: true });
  updateVisibility();
}
