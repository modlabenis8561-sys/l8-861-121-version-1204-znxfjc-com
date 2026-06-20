(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('[data-menu-toggle]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function autoPlay() {
    if (slides.length <= 1) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(index - 1);
      autoPlay();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      autoPlay();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      autoPlay();
    });
  });

  showSlide(0);
  autoPlay();

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.search-card'));
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    function applyFilter() {
      var value = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var filters = (card.getAttribute('data-filter-value') || '').toLowerCase();
        var matchText = !value || haystack.indexOf(value) !== -1;
        var matchFilter = activeFilter === 'all' || filters.indexOf(activeFilter) !== -1;
        var ok = matchText && matchFilter;
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });
      scope.classList.toggle('no-results', visible === 0);
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = (chip.getAttribute('data-filter') || 'all').toLowerCase();
        applyFilter();
      });
    });

    applyFilter();
  });
})();
