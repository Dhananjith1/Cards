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
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const action = (form.getAttribute('action') || '').trim();
      const message = form.querySelector('.form-message');

      if (!action || action === '#') {
        if (message) {
          message.textContent = 'Form endpoint is not configured.';
        }

        return;
      }

      if (message) {
        message.textContent = 'Submitting your inquiry...';
      }

      try {
        const ajaxEndpoint = action.includes('/ajax/')
          ? action
          : action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

        const formData = new FormData(form);
        const emailValue = (form.querySelector('#email-address') || {}).value || '';
        const staticCc = (formData.get('_cc') || '').toString();
        const ccList = staticCc
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

        if (emailValue && !ccList.includes(emailValue)) {
          ccList.push(emailValue);
        }

        formData.set('_cc', ccList.join(','));

        if (emailValue) {
          formData.set('_replyto', emailValue);
        }

        const pdfBlob = createInquiryPdf(formData);
        formData.append('attachment', new File([pdfBlob], `eColink-inquiry-${Date.now()}.pdf`, {
          type: 'application/pdf'
        }));

        const response = await fetch(ajaxEndpoint, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        if (message) {
          message.textContent = 'Thank you. Inquiry sent successfully as PDF to team and customer emails.';
        }

        form.reset();
      } catch (error) {
        if (message) {
          message.textContent = 'Submission failed. Please try again in a moment.';
        }
      }
    });
  });

  function createInquiryPdf(formData) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('PDF library not loaded');
    }

    const doc = new window.jspdf.jsPDF();
    const createdAt = new Date().toLocaleString();
    const entries = [];

    formData.forEach((value, key) => {
      if (!key.startsWith('_') && key !== 'attachment' && typeof value === 'string') {
        entries.push([key, value || '-']);
      }
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('eColink Smart Card Inquiry', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Submitted: ${createdAt}`, 14, 28);

    let y = 40;
    entries.forEach(([key, value]) => {
      const label = `${key}:`;
      const wrappedValue = doc.splitTextToSize(String(value), 130);

      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(label, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(wrappedValue, 58, y);
      y += Math.max(8, wrappedValue.length * 6 + 2);
    });

    return doc.output('blob');
  }

  const yearTargets = document.querySelectorAll('[data-year]');
  yearTargets.forEach((target) => {
    target.textContent = String(new Date().getFullYear());
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('submitted') === 'true') {
    const contactMessage = document.querySelector('.inquiry-form .form-message');
    if (contactMessage) {
      contactMessage.textContent = 'Thank you. Your inquiry has been submitted successfully.';
    }
  }
})();
