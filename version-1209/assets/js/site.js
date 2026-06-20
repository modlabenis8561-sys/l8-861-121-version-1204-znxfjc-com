
(function () {
    'use strict';

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        selectAll('[data-filter-form]').forEach(function (form) {
            var input = form.querySelector('[data-filter-input]');
            var type = form.querySelector('[data-filter-type]');
            var year = form.querySelector('[data-filter-year]');
            var scope = form.closest('section') && form.closest('section').nextElementSibling;
            var container = scope && scope.querySelector('[data-card-scope]') ? scope.querySelector('[data-card-scope]') : document;
            var cards = selectAll('[data-movie-card]', container);

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
                    var matchedYear = !yearValue || cardYear === yearValue;
                    card.classList.toggle('hidden-by-filter', !(matchedKeyword && matchedType && matchedYear));
                });
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function initPlayers() {
        selectAll('[data-player]').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            var status = shell.querySelector('[data-player-status]');
            var hlsInstance = null;
            var loaded = false;

            function setStatus(text) {
                if (status) {
                    status.textContent = text || '';
                }
            }

            function attach() {
                if (!video || loaded) {
                    return;
                }
                var stream = video.getAttribute('data-stream');
                if (!stream) {
                    setStatus('播放遇到问题');
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            setStatus('播放遇到问题');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    setStatus('播放遇到问题');
                }
                loaded = true;
            }

            function play() {
                attach();
                var attempt = video && video.play ? video.play() : null;
                if (attempt && attempt.catch) {
                    attempt.catch(function () {});
                }
            }

            function toggle() {
                if (!video) {
                    return;
                }
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', toggle);
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                    setStatus('');
                });
                video.addEventListener('pause', function () {
                    shell.classList.remove('is-playing');
                });
                video.addEventListener('ended', function () {
                    shell.classList.remove('is-playing');
                });
            }
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
