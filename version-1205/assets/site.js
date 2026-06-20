(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupHeaderSearch() {
        var forms = document.querySelectorAll("[data-header-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || input.value.trim()) {
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html";
            });
        });
    }

    function setupPageFilters() {
        var filterInput = document.querySelector("[data-page-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-page-type]"));
        if (!filterInput && buttons.length === 0) {
            return;
        }
        var selectedType = "all";

        function normalize(value) {
            return String(value || "").toLowerCase();
        }

        function apply() {
            var keyword = normalize(filterInput ? filterInput.value : "");
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year")
                ].join(" "));
                var typeText = normalize([
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesType = selectedType === "all" || typeText.indexOf(normalize(selectedType)) !== -1;
                card.style.display = matchesKeyword && matchesType ? "" : "none";
            });
        }

        if (filterInput) {
            filterInput.addEventListener("input", apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                selectedType = button.getAttribute("data-page-type") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });

        apply();
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-input]");
        var form = document.querySelector("[data-search-form]");
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var data = window.movieSearchIndex || [];
        if (!input || !results) {
            return;
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function card(movie) {
            return [
                "<article class="movie-card">",
                "<a class="poster-link" href="" + escapeHtml(movie.file) + "" aria-label="观看" + escapeHtml(movie.title) + "">",
                "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">",
                "<span class="card-badge">" + escapeHtml(movie.year) + "</span>",
                "<span class="card-play">▶</span>",
                "</a>",
                "<div class="card-body">",
                "<div class="card-meta"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
                "<h3><a href="" + escapeHtml(movie.file) + "">" + escapeHtml(movie.title) + "</a></h3>",
                "<p>" + escapeHtml(movie.oneLine) + "</p>",
                "</div>",
                "</article>"
            ].join("");
        }

        function render(query) {
            var q = normalize(query);
            var matches = data.filter(function (movie) {
                if (!q) {
                    return movie.index <= 60;
                }
                return normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags).indexOf(q) !== -1;
            }).slice(0, 120);
            if (title) {
                title.textContent = q ? "搜索结果：" + query + "（" + matches.length + "）" : "推荐片库";
            }
            results.innerHTML = matches.map(card).join("");
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        render(initial);

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input.value.trim();
                var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
                window.history.replaceState(null, "", nextUrl);
                render(query);
            });
        }

        input.addEventListener("input", function () {
            render(input.value.trim());
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupHeaderSearch();
        setupPageFilters();
        setupSearchPage();
    });
})();
