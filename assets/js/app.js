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
    document.querySelectorAll("section[id]").forEach(function(s){ if(window.scrollY>=s.offsetTop-80) cur=s.id; });
    document.querySelectorAll(".nav-links a").forEach(function(a){ a.classList.toggle("active",a.getAttribute("href")==="#"+cur); });
  });
