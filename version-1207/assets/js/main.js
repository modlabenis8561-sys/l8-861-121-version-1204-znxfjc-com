(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        if (toggle) {
            toggle.addEventListener("click", function () {
                document.body.classList.toggle("nav-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === active);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === active);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });
        showSlide(0);
        startHero();

        var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        filterInputs.forEach(function (input) {
            var targetSelector = input.getAttribute("data-filter-input");
            var target = document.querySelector(targetSelector);
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
            var empty = document.querySelector(input.getAttribute("data-empty-target") || "");

            function applyFilter() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type")
                    ].join(" ").toLowerCase();
                    var matched = !value || text.indexOf(value) !== -1;
                    card.classList.toggle("hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            input.addEventListener("input", applyFilter);
            applyFilter();
        });

        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var value = chip.getAttribute("data-filter-chip") || "";
                var input = document.querySelector(chip.getAttribute("data-filter-for") || "");
                var group = chip.closest(".filter-row");
                if (group) {
                    Array.prototype.slice.call(group.querySelectorAll(".filter-chip")).forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                }
                chip.classList.add("is-active");
                if (input) {
                    input.value = value;
                    input.dispatchEvent(new Event("input"));
                }
            });
        });
    });
})();
