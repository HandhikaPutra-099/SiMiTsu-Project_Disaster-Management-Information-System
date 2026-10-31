// BOOT — after all external scripts loaded
  // ══════════════════════════════════════════════════════════════
  window.addEventListener("load", function() {
    updateSim();
    renderQuiz();
    initLeafletMap();
    init3DScene();
    initCauseAnimations();
  });

  // Scroll top button
  window.addEventListener("scroll", function(){
    document.getElementById("scrollTop").classList.toggle("show", window.scrollY>300);
  });

  // Nav active highlight
  window.addEventListener("scroll", function(){
    var cur="";
    var destinations = Array.from(document.querySelectorAll(".nav-links a[href^='#']"))
      .map(function(a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean)
      .sort(function(a, b) { return a.offsetTop - b.offsetTop; });
    destinations.forEach(function(target) {
      var scrollMargin = parseFloat(getComputedStyle(target).scrollMarginTop) || 80;
      if(window.scrollY>=target.offsetTop-scrollMargin-1) cur=target.id;
    });
    document.querySelectorAll(".nav-links a").forEach(function(a){ a.classList.toggle("active",a.getAttribute("href")==="#"+cur); });
  });
