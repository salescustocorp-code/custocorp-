/* ==========================================================
   CustoCorp: premium interactions
   Pairs with index.html + style.css
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const WHATSAPP_NUMBER = '918136830182'; // country code + number, no "+" or spaces

    const navbar = $('.navbar');
    const navLinks = $('.nav-links');
    const mobileBtn = $('.mobile-menu-btn');
    const heroContent = $('.hero-content');

    /* ---------- Footer year ---------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Scroll progress + back to top ---------- */
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);

    const toTop = document.createElement('button');
    toTop.className = 'back-to-top';
    toTop.type = 'button';
    toTop.setAttribute('aria-label', 'Back to top');
    toTop.innerHTML = '&#8593;';
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(toTop);

    /* ---------- Mobile menu ---------- */
    const setMenu = (open) => {
        if (!navLinks) return;
        navLinks.classList.toggle('active', open);
        document.body.style.overflow = open && window.innerWidth <= 768 ? 'hidden' : '';
        if (!mobileBtn) return;
        mobileBtn.setAttribute('aria-expanded', String(open));
        const s = $$('span', mobileBtn);
        if (s.length === 3) {
            s[0].style.transform = open ? 'translateY(8px) rotate(45deg)' : 'none';
            s[1].style.opacity = open ? '0' : '1';
            s[2].style.transform = open ? 'translateY(-8px) rotate(-45deg)' : 'none';
        }
    };

    if (mobileBtn) {
        mobileBtn.setAttribute('aria-label', 'Toggle menu');
        mobileBtn.setAttribute('aria-expanded', 'false');
        const toggle = () => setMenu(!navLinks.classList.contains('active'));
        mobileBtn.addEventListener('click', toggle);
        mobileBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenu(false); });

    /* ---------- Smooth anchor scrolling (offset for fixed navbar) ---------- */
    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (!id) return;
            if (id === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
            const target = $(id);
            if (!target) return;
            e.preventDefault();
            setMenu(false);
            const offset = navbar ? navbar.offsetHeight - 10 : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - (id === '#home' ? 0 : offset);
            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
            history.replaceState(null, '', id);
        });
    });

    /* ---------- Active nav link (scroll-spy) ---------- */
    const spyLinks = $$('.nav-links a[href^="#"]:not(.btn)');
    const spyTargets = spyLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    if (spyTargets.length && 'IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                spyLinks.forEach((a) =>
                    a.classList.toggle('active-link', a.getAttribute('href') === '#' + entry.target.id)
                );
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        spyTargets.forEach((t) => spy.observe(t));
    }

    /* ---------- Scroll handler (rAF-throttled) ---------- */
    let ticking = false;
    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        if (navbar) navbar.classList.toggle('scrolled', y > 50);
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        toTop.classList.toggle('show', y > 700);

        if (heroContent && !reduceMotion && y < window.innerHeight) {
            heroContent.style.transform = `translateY(${y * 0.16}px)`;
            heroContent.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
        }
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ---------- Reveal animations (auto-stagger inside grids) ---------- */
    const animated = $$('.fade-up, .slide-in-left, .slide-in-right');

    ['.product-grid', '.stats-grid', '.gallery-grid', '.process-grid', '.custom-features'].forEach((sel) => {
        $$(sel).forEach((grid) => {
            Array.from(grid.children).forEach((child, i) => {
                if (animated.includes(child) && !/delay-\d/.test(child.className)) {
                    child.style.transitionDelay = `${(i % 3) * 0.12}s`;
                }
            });
        });
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
        animated.forEach((el) => el.classList.add('visible'));
    } else {
        const reveal = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        animated.forEach((el) => reveal.observe(el));
    }

    /* ---------- Animated counters (.experience-badge .number, [data-count]) ---------- */
    const counters = $$('.experience-badge .number, [data-count]');
    const animateCounter = (el) => {
        const raw = el.getAttribute('data-count') || el.textContent;
        const match = raw.match(/([\d,.]+)/);
        if (!match) return;
        const end = parseFloat(match[1].replace(/,/g, ''));
        const prefix = raw.slice(0, match.index);
        const suffix = raw.slice(match.index + match[1].length);
        const start = performance.now();
        const duration = 2000;
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            el.textContent = prefix + Math.round(end * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = prefix + match[1] + suffix;
        };
        requestAnimationFrame(tick);
    };
    if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
        const co = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => co.observe(el));
    }

    /* ---------- Contact form: validate, then send enquiry to WhatsApp ---------- */
    const form = $('.contact-form');
    if (form) {
        const status = $('.form-status', form);

        const clearError = (field) => {
            field.classList.remove('field-error');
            const msg = field.parentElement.querySelector('.field-msg');
            if (msg) msg.remove();
        };
        const showError = (field, text) => {
            clearError(field);
            field.classList.add('field-error');
            const msg = document.createElement('span');
            msg.className = 'field-msg';
            msg.textContent = text;
            field.parentElement.appendChild(msg);
        };

        $$('input, textarea', form).forEach((f) =>
            f.addEventListener('input', () => { clearError(f); if (status) status.textContent = ''; })
        );

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let firstBad = null;

            $$('input, textarea', form).forEach((field) => {
                const value = field.value.trim();
                clearError(field);
                let error = '';

                if (field.required && !value) error = 'This field is required.';
                else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address.';
                else if (field.type === 'tel' && value && !/^[+\d][\d\s\-()]{6,}$/.test(value)) error = 'Please enter a valid phone number.';

                if (error) { showError(field, error); if (!firstBad) firstBad = field; }
            });

            if (firstBad) { firstBad.focus(); return; }

            const get = (name) => (form.elements[name] ? form.elements[name].value.trim() : '');
            const lines = [
                'Hello CustoCorp, I would like a quote.',
                '',
                `Name: ${get('name')}`,
                `Company: ${get('company')}`,
                `Phone: ${get('phone')}`,
                get('email') ? `Email: ${get('email')}` : null,
                '',
                `Requirement: ${get('requirement')}`
            ].filter((l) => l !== null);

            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;

            const btn = $('button[type="submit"]', form);
            const original = btn ? btn.textContent : '';
            if (btn) { btn.classList.add('is-loading'); btn.textContent = 'Opening WhatsApp...'; }

            window.open(url, '_blank', 'noopener');

            setTimeout(() => {
                if (btn) { btn.classList.remove('is-loading'); btn.textContent = original; }
                if (status) status.textContent = 'Thank you! Please press send in WhatsApp and we will respond shortly.';
                form.reset();
            }, 1200);
        });
    }

    /* ---------- Lazy-load images below the fold ---------- */
    $$('img').forEach((img) => {
        if (!img.hasAttribute('loading') && !img.closest('.hero') && !img.closest('.navbar')) {
            img.setAttribute('loading', 'lazy');
        }
        img.setAttribute('decoding', 'async');
    });
});
