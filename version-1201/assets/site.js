(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupSearchForms() {
        qsa('.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = './search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function setupMobileMenu() {
        var button = qs('.mobile-menu-button');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = panel.hasAttribute('hidden');
            if (opened) {
                panel.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
                button.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '☰';
            }
        });
    }

    function setupCarousel() {
        var carousel = qs('[data-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('.hero-slide', carousel);
        var dots = qsa('.hero-dot', carousel);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        carousel.addEventListener('mouseenter', function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });
        carousel.addEventListener('mouseleave', restart);
        show(0);
        start();
    }

    function setupCardTools() {
        var filter = qs('.local-filter');
        var sort = qs('.card-sort');
        var grid = qs('[data-card-grid]');
        if (!grid) {
            return;
        }
        var cards = qsa('.js-card', grid);
        function applyFilter() {
            var text = filter ? filter.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden-card', text && haystack.indexOf(text) === -1);
            });
        }
        function applySort() {
            var value = sort ? sort.value : 'default';
            var ordered = cards.slice();
            ordered.sort(function (a, b) {
                if (value === 'views') {
                    return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                }
                if (value === 'score') {
                    return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                }
                if (value === 'year') {
                    return Number(b.getAttribute('data-year').replace(/\D/g, '') || 0) - Number(a.getAttribute('data-year').replace(/\D/g, '') || 0);
                }
                return 0;
            });
            ordered.forEach(function (card) {
                grid.appendChild(card);
            });
            cards = ordered;
            applyFilter();
        }
        if (filter) {
            filter.addEventListener('input', applyFilter);
        }
        if (sort) {
            sort.addEventListener('change', applySort);
        }
    }

    function createResultCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card js-card">' +
                '<a class="poster-link" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + ' 在线观看">' +
                    '<img src="' + item.img + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="type-badge">' + escapeHtml(item.type) + '</span>' +
                    '<span class="score-badge">' + escapeHtml(String(item.score)) + '</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<a class="movie-title" href="./' + item.file + '">' + escapeHtml(item.title) + '</a>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var results = qs('#search-results');
        var state = qs('#search-state');
        var input = qs('#search-page-input');
        if (!results || !state || !input || !window.MovieSearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        input.value = query;
        if (!query) {
            return;
        }
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = window.MovieSearchIndex.filter(function (item) {
            var haystack = [item.title, item.oneLine, item.region, item.type, item.year, item.genre, item.category].concat(item.tags || []).join(' ').toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        }).slice(0, 120);
        if (!matches.length) {
            state.textContent = '未找到相关影片';
            return;
        }
        state.textContent = '搜索结果：' + query;
        results.innerHTML = matches.map(createResultCard).join('');
    }

    window.MoviePlayer = {
        init: function (mediaUrl) {
            var video = document.getElementById('movie-player');
            var overlay = qs('.player-overlay');
            if (!video || !mediaUrl) {
                return;
            }
            var hlsInstance = null;
            function loadMedia() {
                if (video.getAttribute('data-ready') === 'true') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = mediaUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(mediaUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = mediaUrl;
                }
                video.setAttribute('data-ready', 'true');
            }
            function start() {
                loadMedia();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }
            if (overlay) {
                overlay.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (video.getAttribute('data-ready') !== 'true') {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupSearchForms();
        setupMobileMenu();
        setupCarousel();
        setupCardTools();
        setupSearchPage();
    });
})();
