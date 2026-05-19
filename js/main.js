/* Cayuga's Watchers — site scripts */

// --- Mobile navigation toggle ---
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  }
})();

// --- Count-up animation for impact numbers ---
(function () {
  var nums = document.querySelectorAll('.num[data-target]');
  if (!nums.length) return;

  function format(n) {
    return n.toLocaleString('en-US');
  }

  function animate(el) {
    var target = parseFloat(el.dataset.target);
    var suffix = el.dataset.suffix || '';
    var duration = 1700;
    var startTime = null;

    function tick(now) {
      if (!startTime) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { observer.observe(n); });
  } else {
    nums.forEach(animate);
  }
})();

// --- Training / application forms via Web3Forms ---
(function () {
  var forms = document.querySelectorAll('form.cw-form');
  if (!forms.length) return;

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorBox = form.querySelector('.form-error');
      if (errorBox) errorBox.style.display = 'none';

      // Require at least one option in any required checkbox group
      var groups = form.querySelectorAll('.checkbox-group[data-required]');
      for (var i = 0; i < groups.length; i++) {
        if (!groups[i].querySelector('input:checked')) {
          if (errorBox) {
            errorBox.textContent = 'Please answer all required questions before submitting.';
            errorBox.style.display = 'block';
          }
          groups[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data.success) throw new Error('failed');
          var success = document.querySelector(form.getAttribute('data-success'));
          form.style.display = 'none';
          if (success) {
            success.style.display = 'block';
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          if (errorBox) {
            errorBox.textContent = 'Sorry — something went wrong sending your form. Please try again, or email hello@cayugaswatchers.org.';
            errorBox.style.display = 'block';
          }
        });
    });
  });
})();

// --- Scroll-reveal + draw-in action-card icons ---
(function () {
  var sel = '.stat, .action-card, .info-card, .timeline-item, .callout, .board-member, .prose, .donate-embed, .cw-form';
  var els = document.querySelectorAll(sel);
  if (!els.length) return;

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function iconShapes(card) {
    return card.querySelectorAll('.icon svg path, .icon svg rect, .icon svg circle, .icon svg line');
  }
  function drawIcon(card) {
    iconShapes(card).forEach(function (s) { s.style.strokeDashoffset = 0; });
  }
  // Prime the action-card icons so they can draw themselves in
  document.querySelectorAll('.action-card').forEach(function (card) {
    iconShapes(card).forEach(function (s) {
      try {
        var len = s.getTotalLength();
        s.style.strokeDasharray = len;
        s.style.strokeDashoffset = reduce ? 0 : len;
      } catch (e) {}
    });
  });

  function show(el) {
    el.classList.add('in-view');
    if (el.classList.contains('action-card')) drawIcon(el);
  }

  if (!('IntersectionObserver' in window)) {
    els.forEach(show);
    return;
  }
  var obs = new IntersectionObserver(function (entries, o) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);
      o.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (el) { obs.observe(el); });
})();

// --- Scroll-progress bar + nav shadow on scroll ---
(function () {
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var nav = document.querySelector('.site-nav');
  var ticking = false;

  function update() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', st > 40);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
