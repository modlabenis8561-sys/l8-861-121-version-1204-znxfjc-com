(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        if (slides.length) {
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                });
            }
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var filterScopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        filterScopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-filter-year]");
            var type = scope.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-card"));
            var empty = scope.querySelector("[data-empty-state]");

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var yearValue = normalize(year ? year.value : "");
                var typeValue = normalize(type ? type.value : "");
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search") || "") + " " + normalize(card.getAttribute("data-title") || "");
                    var cardYear = normalize(card.getAttribute("data-year") || "");
                    var cardType = normalize(card.getAttribute("data-type") || "");
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (year) {
                year.addEventListener("change", applyFilter);
            }
            if (type) {
                type.addEventListener("change", applyFilter);
            }

            var params = new URLSearchParams(window.location.search);
            var queryParam = params.get("q");
            if (queryParam && input) {
                input.value = queryParam;
                applyFilter();
            }
        });
    });
})();
