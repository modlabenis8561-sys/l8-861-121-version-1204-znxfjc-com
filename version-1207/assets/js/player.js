(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function attachStream(video, source) {
        if (video.dataset.ready === "1") {
            return;
        }
        video.dataset.ready = "1";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        video.src = source;
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell[data-stream]"));
        players.forEach(function (shell) {
            var source = shell.getAttribute("data-stream");
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".player-overlay");
            if (!source || !video || !overlay) {
                return;
            }

            function playMovie() {
                attachStream(video, source);
                shell.classList.add("is-playing");
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            overlay.addEventListener("click", playMovie);
            video.addEventListener("click", function () {
                if (video.paused) {
                    playMovie();
                }
            });
        });
    });
})();
