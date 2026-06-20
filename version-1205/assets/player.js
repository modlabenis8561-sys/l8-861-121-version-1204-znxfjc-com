(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        var shell = document.querySelector("[data-player]");
        var video = document.getElementById("movie-player");
        var button = document.querySelector("[data-player-start]");
        if (!shell || !video || !button) {
            return;
        }

        var source = shell.getAttribute("data-hls-src");
        var hls = null;
        var loaded = false;

        function loadSource() {
            if (loaded || !source) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            }
        }

        function startPlayback() {
            loadSource();
            shell.classList.add("is-playing");
            video.controls = true;
            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === "function") {
                playAttempt.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
