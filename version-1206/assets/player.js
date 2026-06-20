(function () {
  function setupNative(video, src) {
    video.src = src;
  }

  function setupHls(video, src) {
    var Hls = window.Hls;
    if (!Hls || !Hls.isSupported()) {
      return false;
    }
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
    video._hls = hls;
    return true;
  }

  function initPlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var overlay = document.querySelector(options.overlaySelector);
    var src = options.src;
    var started = false;
    if (!video || !src) {
      return;
    }
    var start = function () {
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          setupNative(video, src);
        } else if (!setupHls(video, src)) {
          setupNative(video, src);
        }
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    };
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }

  window.initPlayer = initPlayer;
})();
