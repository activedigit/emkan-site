/* ===========================
   EMKAN - Main Script
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Header scroll effect ----------
    const header = document.getElementById('header');
    const floatingCta = document.querySelector('.floating-cta');

    const handleScroll = () => {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (floatingCta) {
            if (scrollY > 600) {
                floatingCta.classList.add('visible');
            } else {
                floatingCta.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ---------- Mobile menu (hamburger) ----------
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = (open) => {
        const isOpen = open !== undefined ? open : !nav.classList.contains('active');

        if (isOpen) {
            nav.classList.add('active');
            hamburger.classList.add('active');
            document.body.classList.add('nav-open');
            hamburger.setAttribute('aria-label', 'סגירת תפריט');
        } else {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('nav-open');
            hamburger.setAttribute('aria-label', 'פתיחת תפריט');
        }
    };

    hamburger.addEventListener('click', () => toggleMenu());

    navLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') &&
            !nav.contains(e.target) &&
            !hamburger.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // Close menu on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            toggleMenu(false);
        }
    });

    // ---------- Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ---------- Active nav link based on scroll ----------
    const sections = document.querySelectorAll('section[id]');

    const updateActiveLink = () => {
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);

            if (link) {
                if (scrollPos >= top && scrollPos < bottom) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // ---------- Bar fill animation (Retirement section) ----------
    const barFills = document.querySelectorAll('.bar-fill');

    const animateBars = () => {
        barFills.forEach(bar => {
            const width = bar.style.width;
            bar.style.setProperty('--width', width);
            bar.style.width = '0';
            requestAnimationFrame(() => {
                bar.style.width = width;
            });
        });
    };

    // ---------- Counter animation ----------
    const animateCounter = (el) => {
        const text = el.textContent.trim();
        const hasPlus = text.includes('+');
        const hasPercent = text.includes('%');
        const hasSlash = text.includes('/');

        if (hasSlash) return; // Don't animate "24/7"

        const numMatch = text.match(/[\d,]+/);
        if (!numMatch) return;

        const target = parseInt(numMatch[0].replace(/,/g, ''), 10);
        if (isNaN(target)) return;

        const duration = 1800;
        const steps = 60;
        const stepDuration = duration / steps;
        let current = 0;
        const increment = target / steps;

        const tick = () => {
            current += increment;
            if (current >= target) {
                current = target;
                const formatted = target.toLocaleString('he-IL');
                el.textContent = (hasPlus ? '+' : '') + formatted + (hasPercent ? '%' : '');
                return;
            }
            const formatted = Math.floor(current).toLocaleString('he-IL');
            el.textContent = (hasPlus ? '+' : '') + formatted + (hasPercent ? '%' : '');
            setTimeout(tick, stepDuration);
        };

        tick();
    };

    const animateAllCounters = (container) => {
        const counters = container.querySelectorAll('.stat-number, .trust-stat-number');
        counters.forEach(animateCounter);
    };

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('retirement')) {
                    animateBars();
                }
                if (entry.target.classList.contains('hero') ||
                    entry.target.classList.contains('trust-banner')) {
                    animateAllCounters(entry.target);
                }
                entry.target.classList.add('in-view');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(s => sectionObserver.observe(s));

    // ---------- Reveal on scroll animation ----------
    const revealOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.advantage-card, .service-card, .process-step, .testimonial-card, .partner-logo')
        .forEach(el => {
            el.classList.add('reveal-element');
            revealObserver.observe(el);
        });

    // ---------- Form handling ----------
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = form.querySelector('.btn-submit');

    const validators = {
        fullName: (value) => {
            if (!value.trim()) return 'נא להזין שם מלא';
            if (value.trim().length < 2) return 'השם קצר מדי';
            if (!/^[֐-׿a-zA-Z\s'\-]+$/.test(value.trim())) return 'נא להזין שם תקין';
            return '';
        },
        phone: (value) => {
            const cleaned = value.replace(/[\s\-]/g, '');
            if (!cleaned) return 'נא להזין מספר טלפון';
            if (!/^0\d{8,9}$/.test(cleaned)) return 'מספר טלפון לא תקין';
            return '';
        },
        email: (value) => {
            if (!value.trim()) return 'נא להזין כתובת אימייל';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'כתובת אימייל לא תקינה';
            return '';
        },
        topic: (value) => {
            if (!value) return 'נא לבחור תחום';
            return '';
        },
        consent: (checked) => {
            if (!checked) return 'יש לאשר את קבלת ההודעות';
            return '';
        }
    };

    const showError = (fieldName, message) => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const errorEl = form.querySelector(`.error-msg[data-for="${fieldName}"]`);

        if (fieldName === 'consent') {
            const wrapper = field.closest('.form-checkbox');
            if (message) {
                wrapper.classList.add('error');
            } else {
                wrapper.classList.remove('error');
            }
        } else {
            if (message) {
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        }

        if (errorEl) {
            errorEl.textContent = message;
        }
    };

    const validateField = (fieldName) => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field || !validators[fieldName]) return true;

        const value = fieldName === 'consent' ? field.checked : field.value;
        const error = validators[fieldName](value);
        showError(fieldName, error);
        return !error;
    };

    // Real-time validation on blur
    Object.keys(validators).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        const eventType = fieldName === 'consent' ? 'change' : 'blur';
        field.addEventListener(eventType, () => validateField(fieldName));

        // Clear error on input
        field.addEventListener('input', () => {
            if (fieldName === 'consent') return;
            const errorEl = form.querySelector(`.error-msg[data-for="${fieldName}"]`);
            if (errorEl && errorEl.textContent) {
                field.classList.remove('error');
                errorEl.textContent = '';
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        Object.keys(validators).forEach(fieldName => {
            if (!validateField(fieldName)) isValid = false;
        });

        if (!isValid) {
            // Scroll to first error
            const firstError = form.querySelector('.error, .form-checkbox.error');
            if (firstError) {
                const offset = firstError.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
            return;
        }

        // Collect data
        const formData = {
            fullName: form.fullName.value.trim(),
            phone: form.phone.value.trim(),
            email: form.email.value.trim(),
            city: form.city.value.trim(),
            topic: form.topic.value,
            notes: form.notes.value.trim(),
            consent: form.consent.checked,
            timestamp: new Date().toISOString()
        };

        // Simulate submission
        submitBtn.classList.add('loading');

        setTimeout(() => {
            console.log('EMKAN - Form submitted:', formData);

            // Hide form, show success
            form.style.display = 'none';
            successMessage.classList.add('show');

            // Scroll to success message
            const wrapper = document.querySelector('.contact-form-wrapper');
            const offset = wrapper.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });

            // Reset after delay (for demo purposes)
            // In production - remove this or send to backend
            // setTimeout(() => {
            //     form.reset();
            //     form.style.display = 'flex';
            //     successMessage.classList.remove('show');
            //     submitBtn.classList.remove('loading');
            // }, 8000);
        }, 1200);
    });

    // ---------- Auto-fill topic from service cards ----------
    document.querySelectorAll('.service-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const card = link.closest('.service-card');
            const serviceName = card.querySelector('h3').textContent.trim();
            const topicSelect = form.querySelector('#topic');

            if (topicSelect) {
                const option = Array.from(topicSelect.options).find(opt => opt.value === serviceName);
                if (option) {
                    topicSelect.value = serviceName;
                }
            }
        });
    });

    // ---------- Initial active link ----------
    updateActiveLink();

    // ---------- Accessibility Widget ----------
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yPanel = document.getElementById('a11yPanel');
    const a11yClose = document.getElementById('a11yClose');
    const a11yOptions = document.querySelectorAll('.a11y-option');

    if (a11yToggle && a11yPanel) {
        const STORAGE_KEY = 'emkan-a11y-settings';

        const state = {
            toggles: { contrast: false, dark: false, links: false, readable: false, pause: false, cursor: false },
            fontStep: 0
        };

        const loadState = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) Object.assign(state, JSON.parse(saved));
            } catch (e) { /* ignore */ }
        };

        const saveState = () => {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
        };

        const applyState = () => {
            const body = document.body;
            // Apply boolean toggles
            Object.entries(state.toggles).forEach(([key, value]) => {
                body.classList.toggle('a11y-' + key, value);
            });
            // Clear all font classes
            body.classList.forEach(c => {
                if (c.startsWith('a11y-font-') || c.startsWith('a11y-font--')) {
                    body.classList.remove(c);
                }
            });
            // Apply font step
            if (state.fontStep !== 0) {
                const cls = state.fontStep > 0 ? 'a11y-font-' + state.fontStep : 'a11y-font-' + state.fontStep;
                body.classList.add(cls);
            }
            // Update button states
            a11yOptions.forEach(btn => {
                const action = btn.dataset.action;
                if (action in state.toggles) {
                    btn.classList.toggle('active', state.toggles[action]);
                    btn.setAttribute('aria-pressed', state.toggles[action]);
                }
            });
        };

        const togglePanel = (open) => {
            const isOpen = open !== undefined ? open : a11yPanel.hidden;
            a11yPanel.hidden = !isOpen;
            a11yToggle.setAttribute('aria-expanded', isOpen);
            if (isOpen) {
                a11yClose.focus();
            }
        };

        a11yToggle.addEventListener('click', () => togglePanel());
        a11yClose.addEventListener('click', () => {
            togglePanel(false);
            a11yToggle.focus();
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!a11yPanel.hidden &&
                !a11yPanel.contains(e.target) &&
                !a11yToggle.contains(e.target)) {
                togglePanel(false);
            }
        });

        // Escape to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !a11yPanel.hidden) {
                togglePanel(false);
                a11yToggle.focus();
            }
        });

        a11yOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;

                if (action === 'font-bigger') {
                    state.fontStep = Math.min(state.fontStep + 1, 4);
                } else if (action === 'font-smaller') {
                    state.fontStep = Math.max(state.fontStep - 1, -2);
                } else if (action === 'reset') {
                    state.toggles = { contrast: false, dark: false, links: false, readable: false, pause: false, cursor: false };
                    state.fontStep = 0;
                } else if (action in state.toggles) {
                    // Mutually exclusive: contrast vs dark
                    if (action === 'contrast' && !state.toggles.contrast) state.toggles.dark = false;
                    if (action === 'dark' && !state.toggles.dark) state.toggles.contrast = false;
                    state.toggles[action] = !state.toggles[action];
                }

                applyState();
                saveState();
            });
        });

        // Initialize
        loadState();
        applyState();
    }
});
