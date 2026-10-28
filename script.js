/* ==========================================================
   Premium interactions
   Works with style-premium.css and your existing HTML classes:
   .navbar .nav-links .mobile-menu-btn .fade-up .slide-in-* .visible
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const navbar = $('.navbar');
    const navLinks = $('.nav-links');
    const mobileBtn = $('.mobile-menu-btn');

    /* ---------- Footer year ---------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Injected UI styles (progress bar, back-to-top, form states) ---------- */
    const style = document.createElement('style');
    style.textContent = `
        .scroll-progress{position:fixed;top:0;left:0;height:2px;width:100%;z-index:1100;
            background:linear-gradient(90deg,#8f6f2e,#f1e3b5,#c9a45c);transform-origin:0 50%;
            transform:scaleX(0);pointer-events:none}
        .back-to-top{position:fixed;right:28px;bottom:28px;width:48px;height:48px;z-index:900;
            display:flex;align-items:center;justify-content:center;cursor:pointer;
            background:rgba(8,8,10,.8);color:#c9a45c;border:1px solid rgba(201,164,92,.35);
            backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
            opacity:0;transform:translateY(20px);pointer-events:none;
            transition:all .5s cubic-bezier(.22,1,.36,1);font-size:1.1rem}
        .back-to-top.show{opacity:1;transform:translateY(0);pointer-events:auto}
        .back-to-top:hover{background:#c9a45c;color:#08080a;transform:translateY(-4px)}
        .nav-links a.active-link:not(.btn){color:#ecdcb0}
        .nav-links a.active-link:not(.btn)::after{width:100%;left:0}
        .testimonial-slider{cursor:grab}
        .testimonial-slider.dragging{cursor:grabbing;scroll-snap-type:none;scroll-behavior:auto}
        .testimonial-slider.dragging *{user-select:none;pointer-events:none}
        .field-error{border-bottom-color:#c0605a!important}
        .field-msg{display:block;color:#c0605a;font-size:.75rem;margin-top:6px;letter-spacing:.04em}
        .btn.is-loading{opacity:.7;pointer-events:none}
    `;
    document.head.appendChild(style);

    /* ---------- Scroll progress bar + back to top ---------- */
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);

    const toTop = document.createElement('button');
    toTop.className = 'back-to-top';
    toTop.setAttribute('aria-label', 'Back to top');
    toTop.innerHTML = '&#8593;';
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(toTop);

    /* ---------- Mobile menu ---------- */
    const setMenu = (open) => {
        if (!navLinks) return;
        navLinks.classList.toggle('active', open);
        document.body.style.overflow = open && window.innerWidth <= 768 ? 'hidden' : '';
        if (mobileBtn) {
            mobileBtn.setAttribute('aria-expanded', String(open));
            const s = $$('span', mobileBtn);
            if (s.length === 3) {
                s[0].style.transform = open ? 'translateY(8px) rotate(45deg)' : 'none';
                s[1].style.opacity = open ? '0' : '1';
                s[2].style.transform = open ? 'translateY(-8px) rotate(-45deg)' : 'none';
            }
        }
    };

    if (mobileBtn) {
        mobileBtn.setAttribute('aria-label', 'Toggle menu');
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenu(false); });

    /* ---------- Smooth anchor scrolling with navbar offset ---------- */
    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;
            const target = $(id);
            if (!target) return;
            e.preventDefault();
            setMenu(false);
            const offset = navbar ? navbar.offsetHeight - 10 : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            history.replaceState(null, '', id);
        });
    });

    /* ---------- Active nav link on scroll (scroll-spy) ---------- */
    const spyLinks = $$('.nav-links a[href^="#"]:not(.btn)');
    const spySections = spyLinks
        .map((a) => $(a.getAttribute('href')))
        .filter(Boolean);

    if (spySections.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                spyLinks.forEach((a) =>
                    a.classList.toggle('active-link', a.getAttribute('href') === '#' + entry.target.id)
                );
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        spySections.forEach((s) => spy.observe(s));
    }

    /* ---------- Scroll handler (rAF-throttled) ---------- */
    const heroContent = $('.hero-content');
    let ticking = false;

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        if (navbar) navbar.classList.toggle('scrolled', y > 50);
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        toTop.classList.toggle('show', y > 700);

        // Subtle hero parallax (content drifts up and fades)
        if (heroContent && !prefersReducedMotion && y < window.innerHeight) {
            heroContent.style.transform = `translateY(${y * 0.18}px)`;
            heroContent.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    /* ---------- Reveal animations (with automatic stagger) ---------- */
    const animated = $$('.fade-up, .slide-in-left, .slide-in-right');

    // Stagger siblings inside grids so cards appear one after another
    ['.product-grid', '.stats-grid', '.gallery-grid', '.custom-features', '.testimonial-slider'].forEach((sel) => {
        $$(sel).forEach((grid) => {
            Array.from(grid.children).forEach((child, i) => {
                if (animated.includes(child) && !/delay-\d/.test(child.className)) {
                    child.style.transitionDelay = `${Math.min(i, 6) * 0.1}s`;
                }
            });
        });
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        animated.forEach((el) => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target); // animate once, stays visible
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
        animated.forEach((el) => revealObserver.observe(el));
    }

    /* ---------- Animated counters ---------- */
    // Works on .experience-badge .number (e.g. "15+") and any [data-count] element
    const counters = $$('.experience-badge .number, [data-count]');

    const animateCounter = (el) => {
        const raw = el.getAttribute('data-count') || el.textContent;
        const match = raw.match(/([\d,.]+)/);
        if (!match) return;
        const end = parseFloat(match[1].replace(/,/g, ''));
        const prefix = raw.slice(0, match.index);
        const suffix = raw.slice(match.index + match[1].length);
        const decimals = (match[1].split('.')[1] || '').length;
        const duration = 2200;
        const start = performance.now();

        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
            const val = (end * eased).toFixed(decimals);
            el.textContent = prefix + Number(val).toLocaleString('en-IN', {
                minimumFractionDigits: decimals, maximumFractionDigits: decimals
            }) + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = prefix + match[1] + suffix;
        };
        requestAnimationFrame(tick);
    };

    if (counters.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => counterObserver.observe(el));
    }

    /* ---------- Testimonial slider: drag to scroll + gentle autoplay ---------- */
    const slider = $('.testimonial-slider');
    if (slider) {
        let isDown = false, startX = 0, startScroll = 0, moved = false;
        let autoplay = null;

        const stopAuto = () => { clearInterval(autoplay); autoplay = null; };
        const startAuto = () => {
            if (prefersReducedMotion || autoplay) return;
            autoplay = setInterval(() => {
                const card = slider.firstElementChild;
                if (!card) return;
                const step = card.offsetWidth + 32;
                const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10;
                slider.scrollTo({ left: atEnd ? 0 : slider.scrollLeft + step, behavior: 'smooth' });
            }, 5000);
        };

        slider.addEventListener('mousedown', (e) => {
            isDown = true; moved = false;
            startX = e.pageX; startScroll = slider.scrollLeft;
            stopAuto();
        });
        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const dx = e.pageX - startX;
            if (Math.abs(dx) > 4) { moved = true; slider.classList.add('dragging'); }
            if (moved) slider.scrollLeft = startScroll - dx;
        });
        window.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            slider.classList.remove('dragging');
            startAuto();
        });
        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);
        slider.addEventListener('touchstart', stopAuto, { passive: true });

        // Only autoplay while slider is on screen
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => {
                entry.isIntersecting ? startAuto() : stopAuto();
            }, { threshold: 0.3 }).observe(slider);
        }
    }

    /* ---------- Contact form: validation + loading state ---------- */
    const form = $('.contact-form-wrapper form');
    if (form) {
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

        $$('input, textarea', form).forEach((f) => f.addEventListener('input', () => clearError(f)));

        form.addEventListener('submit', (e) => {
            let valid = true;
            let firstBad = null;

            $$('input, textarea', form).forEach((field) => {
                if (field.type === 'hidden' || field.type === 'submit') return;
                const value = field.value.trim();
                clearError(field);

                if (field.required && !value) {
                    showError(field, 'This field is required.');
                } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    showError(field, 'Please enter a valid email address.');
                } else if (field.type === 'tel' && value && !/^[+\d][\d\s\-()]{6,}$/.test(value)) {
                    showError(field, 'Please enter a valid phone number.');
                } else {
                    return;
                }
                valid = false;
                if (!firstBad) firstBad = field;
            });

            if (!valid) {
                e.preventDefault();
                firstBad.focus();
                return;
            }

            // Valid: show loading state, let the form submit normally
            const btn = $('button[type="submit"], .btn', form);
            if (btn) {
                btn.classList.add('is-loading');
                btn.dataset.original = btn.textContent;
                btn.textContent = 'Sending...';
            }
        });
    }

    /* ---------- Lazy-fade images once loaded ---------- */
    $$('img').forEach((img) => {
        if (!img.hasAttribute('loading') && !img.closest('.hero')) img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
    });
});
