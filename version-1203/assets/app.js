(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 6200);
  }

  const filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    const input = filterRoot.querySelector('[data-filter-input]');
    const typeSelect = filterRoot.querySelector('[data-filter-type]');
    const yearSelect = filterRoot.querySelector('[data-filter-year]');
    const cards = Array.from(filterRoot.querySelectorAll('[data-movie-card]'));
    const empty = filterRoot.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      const keyword = normalize(input && input.value);
      const typeValue = normalize(typeSelect && typeSelect.value);
      const yearValue = normalize(yearSelect && yearSelect.value);
      let visibleCount = 0;

      cards.forEach(function (card) {
        const blob = normalize(card.getAttribute('data-search'));
        const type = normalize(card.getAttribute('data-type'));
        const year = normalize(card.getAttribute('data-year'));
        const matchesKeyword = !keyword || blob.indexOf(keyword) !== -1;
        const matchesType = !typeValue || type === typeValue;
        const matchesYear = !yearValue || year === yearValue;
        const visible = matchesKeyword && matchesType && matchesYear;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();
