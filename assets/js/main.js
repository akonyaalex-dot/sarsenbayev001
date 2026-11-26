/* =========================================================
   QazaqTarih Ойындары — Portal interactions
   - In-portal iframe for embeddable games
   - New-tab launch for games that block framing
   - Scroll reveal + accessible modal handling
   ========================================================= */
(function () {
  "use strict";

  var modal = document.getElementById("gameModal");
  var frame = document.getElementById("gameFrame");
  var launchPanel = document.getElementById("launchPanel");
  var launchBtn = document.getElementById("launchBtn");
  var launchUrl = document.getElementById("launchUrl");
  var modalTitle = document.getElementById("modalTitle");
  var modalNewTab = document.getElementById("modalNewTab");
  var lastFocused = null;

  function openModalEmbed(title, url) {
    lastFocused = document.activeElement;
    modalTitle.textContent = title;
    modalNewTab.href = url;
    launchPanel.hidden = true;
    frame.src = url;
    frame.style.display = "block";
    showModal();
  }

  function openModalLaunch(title, url) {
    lastFocused = document.activeElement;
    modalTitle.textContent = title;
    modalNewTab.href = url;
    frame.removeAttribute("src");
    frame.style.display = "none";
    launchPanel.hidden = false;
    launchBtn.href = url;
    launchUrl.textContent = url;
    showModal();
    // Best-effort: also open in a new tab (user gesture) in case popups are allowed.
    window.open(url, "_blank", "noopener");
  }

  function showModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    frame.removeAttribute("src"); // stop the game / free resources
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  // Card play buttons
  var cards = document.querySelectorAll(".card");
  Array.prototype.forEach.call(cards, function (card) {
    var btn = card.querySelector(".play-btn");
    if (!btn) return;
    var title = card.querySelector(".card-title")
      ? card.querySelector(".card-title").textContent
      : "Ойын";
    var url = card.getAttribute("data-url");
    var embed = card.getAttribute("data-embed") === "true";

    btn.addEventListener("click", function () {
      if (embed) {
        openModalEmbed(title, url);
      } else {
        openModalLaunch(title, url);
      }
    });
  });

  // Close interactions
  var closers = modal.querySelectorAll("[data-close]");
  Array.prototype.forEach.call(closers, function (el) {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  // Scroll reveal for cards
  var revealEls = document.querySelectorAll(".card");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var t = entry.target;
            setTimeout(function () { t.classList.add("in-view"); }, (i % 3) * 90);
            io.unobserve(t);
          }
        });
      },
      { threshold: 0.15 }
    );
    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("in-view"); });
  }

  // Subtle parallax on the ornamental background
  var ornament = document.querySelector(".bg-ornament");
  if (ornament && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var y = window.scrollY || 0;
          ornament.style.transform = "translateY(" + y * 0.04 + "px)";
          ticking = false;
        });
        ticking = true;
      }
    });
  }
})();
