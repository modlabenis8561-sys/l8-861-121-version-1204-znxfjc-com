(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(to) {
        if (!slides.length) {
          return;
        }
        index = (to + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function play() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          play();
        });
      });
      show(0);
      play();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var category = scope.querySelector("[data-filter-category]");
      var type = scope.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-item"));
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (input && q) {
        input.value = q;
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var categoryValue = category ? category.value : "";
        var typeValue = type ? type.value : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardCategory = card.getAttribute("data-category") || "";
          var cardType = card.getAttribute("data-type") || "";
          var ok = true;
          if (term && text.indexOf(term) === -1) {
            ok = false;
          }
          if (categoryValue && cardCategory !== categoryValue) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (category) {
        category.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      apply();
    });

    document.querySelectorAll(".video-frame").forEach(function (frame) {
      var video = frame.querySelector("[data-video]");
      var button = frame.querySelector("[data-player-start]");
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-hls");
      var loaded = false;
      var hlsInstance = null;

      function reveal() {
        button.hidden = true;
        video.controls = true;
      }

      function retry() {
        button.hidden = false;
      }

      function playVideo() {
        reveal();
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            loaded = true;
            video.play().catch(retry);
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(retry);
            });
            loaded = true;
            return;
          }
          video.src = source;
          loaded = true;
        }
        video.play().catch(retry);
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", reveal);
      video.addEventListener("error", retry);
      frame._hls = hlsInstance;
    });
  });
})();
