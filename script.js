(function () {
  const currentPage = document.body.dataset.page || '';
  const navLinks = document.querySelectorAll('.site-nav a[data-page-link]');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  navLinks.forEach((link) => {
    if (link.dataset.pageLink === currentPage) {
      link.classList.add('is-active');
    }

    link.addEventListener('click', () => {
      if (siteNav && menuToggle) {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const revealTargets = document.querySelectorAll('.reveal, .stagger');
  if (revealTargets.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    revealTargets.forEach((item) => observer.observe(item));
  }

  const inquiryForms = document.querySelectorAll('.inquiry-form');
  inquiryForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = form.querySelector('.form-message');

      if (message) {
        message.textContent = 'Thank you. Your inquiry has been submitted successfully. We will contact you soon.';
      }

      form.reset();
    });
  });

  const yearTargets = document.querySelectorAll('[data-year]');
  yearTargets.forEach((target) => {
    target.textContent = String(new Date().getFullYear());
  });
})();
