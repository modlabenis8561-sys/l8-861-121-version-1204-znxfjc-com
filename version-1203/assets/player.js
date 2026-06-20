(function () {
  window.initMoviePlayer = function (videoId, streamUrl, overlayId) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    let loaded = false;
    let hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function bindStream() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      loaded = true;
    }

    function startPlayback() {
      bindStream();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      const request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('emptied', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
        hls = null;
      }
      loaded = false;
    });
  };
})();
