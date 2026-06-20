(function () {
  var players = {};

  function hideButton(buttonId) {
    var button = document.getElementById(buttonId);
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  window.startMovie = function (videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    if (!video || !url) {
      return;
    }

    hideButton(buttonId);

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', url);
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!players[videoId]) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        players[videoId] = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (!video.getAttribute('src')) {
      video.setAttribute('src', url);
    }
    video.play().catch(function () {});
  };

  document.addEventListener('play', function (event) {
    var target = event.target;
    if (target && target.tagName === 'VIDEO') {
      var buttonId = target.getAttribute('data-play-button');
      hideButton(buttonId);
    }
  }, true);
})();
