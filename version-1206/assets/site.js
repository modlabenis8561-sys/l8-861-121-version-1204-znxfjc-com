(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initHeader() {
    var header = document.querySelector(".js-site-header");
    var button = document.querySelector(".js-mobile-menu-button");
    var nav = document.querySelector(".js-mobile-nav");
    if (header) {
      var toggleHeader = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 20);
      };
      toggleHeader();
      window.addEventListener("scroll", toggleHeader, { passive: true });
    }
    if (button && nav) {
      button.addEventListener("click", function () {
        var opened = nav.classList.toggle("is-open");
        button.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    var show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    };
    var restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    };
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initCardFilters() {
    var input = document.querySelector(".js-card-search");
    var list = document.querySelector(".js-card-list");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var typeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-type]"));
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
    var selectedType = "全部";
    var selectedCategory = "全部";
    var apply = function () {
      var keyword = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags"));
        var type = card.getAttribute("data-type") || "";
        var category = card.getAttribute("data-category") || "";
        var typeMatched = selectedType === "全部" || type.indexOf(selectedType) !== -1;
        var categoryMatched = selectedCategory === "全部" || category === selectedCategory;
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !(typeMatched && categoryMatched && keywordMatched));
      });
    };
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", apply);
      var form = input.closest("form");
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          apply();
        });
      }
    }
    typeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedType = button.getAttribute("data-filter-type") || "全部";
        typeButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedCategory = button.getAttribute("data-filter-category") || "全部";
        categoryButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
    if (typeButtons[0]) {
      typeButtons[0].classList.add("is-active");
    }
    if (categoryButtons[0]) {
      categoryButtons[0].classList.add("is-active");
    }
    apply();
  }

  function initHomeSearch() {
    var form = document.querySelector(".js-home-search-form");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var url = "./search.html";
      if (value) {
        url += "?q=" + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initCardFilters();
    initHomeSearch();
  });
})();
