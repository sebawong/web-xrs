/* ============================================================
   XRS — script.js
   Strategic Partner V2 — Scroll Sequence Hero + Firebase Config
   ============================================================ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js';
import { getFirestore, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js';

const fbApp = initializeApp({
    apiKey: "AIzaSyAfQZ4RARhe-jTD3emW4JVTmS_HMYBbZ2E",
    authDomain: "xrs-landing.firebaseapp.com",
    projectId: "xrs-landing",
    storageBucket: "xrs-landing.firebasestorage.app",
    messagingSenderId: "225138279563",
    appId: "1:225138279563:web:50dcbb04dc3eea32cf008e"
});
const db = getFirestore(fbApp);

// ── Config ──────────────────────────────────────────────────
let cfg = {
    scrollHeight: 5, frameCount: 168, overlayOpacity: 0.75, fadeDuration: 0.04,
    tracks: []
};

// ── Hero Elements ───────────────────────────────────────────
const heroSection = document.querySelector('.hero-scroll-section');
const canvas = document.getElementById('heroCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const images = [];
let heroReady = false;

function pad(n, s) { let r = String(n); while (r.length < s) r = '0' + r; return r; }

// ── Build dynamic text elements from config ─────────────────
function buildDOM() {
    if (!heroSection) return;
    heroSection.style.height = (cfg.scrollHeight * 100) + 'vh';

    const ov = heroSection.querySelector('.hero-scroll-overlay');
    if (ov) {
        const o = cfg.overlayOpacity;
        ov.style.background = `linear-gradient(135deg,rgba(19,19,19,${o}) 0%,rgba(19,19,19,${o * 0.53}) 40%,rgba(19,19,19,${o * 0.2}) 100%)`;
    }

    // Remove old modules
    heroSection.querySelectorAll('.hero-dyn').forEach(el => el.remove());
    const sticky = heroSection.querySelector('.hero-scroll-sticky');
    if (!sticky) return;

    cfg.tracks.forEach(track => {
        if (track.type !== 'text' || !track.visible) return;
        track.clips.forEach(clip => {
            if (!clip.modules) return;
            clip.modules.forEach(m => {
                const el = document.createElement('div');
                el.className = 'hero-dyn';
                // Independent start/end per module (fallback to clip range + delay for old configs)
                el.dataset.cs = m.start != null ? m.start : (clip.start + (m.delay || 0));
                el.dataset.ce = m.end != null ? m.end : clip.end;
                el.dataset.anim = m.animation || 'fade-up';
                el.dataset.fadeIn = m.fadeIn || 0;
                el.dataset.fadeOut = m.fadeOut || 0;

                // Styling
                Object.assign(el.style, {
                    position: 'absolute', zIndex: '10', pointerEvents: 'none', opacity: '0',
                    left: m.x + '%', top: m.y + '%',
                    fontFamily: (m.fontFamily || 'Inter') + ', sans-serif',
                    fontWeight: m.fontWeight || 400,
                    color: m.color || '#e2e2e2',
                    letterSpacing: (m.letterSpacing || 0) + 'px',
                    lineHeight: m.lineHeight || 1.4,
                    textAlign: m.textAlign || 'left',
                    whiteSpace: 'pre-line',
                    maxWidth: '60vw',
                    padding: '0 24px',
                });

                // Responsive font size (base 1280px viewport)
                el.dataset.baseFontSize = m.fontSize || 16;
                el.dataset.opacity = m.opacity != null ? m.opacity : 1;
                el.dataset.textAlign = m.textAlign || 'left';

                if (m.textAlign === 'right') { el.style.left = 'auto'; el.style.right = (100 - m.x) + '%'; }
                if (m.textAlign === 'center') { el.style.transform = 'translateX(-50%)'; }
                if (m.type === 'tag' || m.type === 'cta' || m.type === 'button' || m.type === 'badge') el.style.textTransform = 'uppercase';

                if (m.type === 'cta' && m.bgColor) {
                    Object.assign(el.style, {
                        background: m.bgColor, display: 'inline-block',
                        padding: '0.9em 2.4em', borderRadius: '2px', cursor: 'pointer',
                    });
                    el.dataset.isCta = 'true';
                    el.dataset.href = m.href || '#diagnostico';
                    el.style.pointerEvents = 'auto';
                    el.addEventListener('click', () => {
                        const target = document.querySelector(m.href || '#diagnostico');
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }

                if (m.type === 'button') {
                    Object.assign(el.style, {
                        display: 'inline-block', padding: '0.7em 2em', borderRadius: '2px',
                        border: '1.5px solid ' + (m.borderColor || m.color || '#e7bf9c'), cursor: 'pointer',
                    });
                    el.dataset.isCta = 'true';
                    el.dataset.href = m.href || '#contacto';
                    el.style.pointerEvents = 'auto';
                    el.addEventListener('click', () => {
                        const target = document.querySelector(m.href || '#contacto');
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }

                if (m.type === 'badge' && m.bgColor) {
                    Object.assign(el.style, {
                        background: m.bgColor, display: 'inline-block',
                        padding: '0.4em 1.2em', borderRadius: '100px',
                    });
                }

                el.textContent = m.content || '';
                sticky.appendChild(el);
            });
        });
    });

    // Set responsive font sizes
    updateFontSizes();
}

function updateFontSizes() {
    const vw = window.innerWidth;
    const scale = vw / 1280;
    heroSection.querySelectorAll('.hero-dyn').forEach(el => {
        const base = parseFloat(el.dataset.baseFontSize) || 16;
        el.style.fontSize = Math.max(10, base * scale) + 'px';
    });
}

// ── Canvas + Scroll Animation ───────────────────────────────
if (canvas && ctx && heroSection) {
    let loadedCount = 0;

    function onAllLoaded() {
        heroReady = true;
        resizeCanvas();
        buildDOM();
        requestAnimationFrame(renderHero);
    }

    function loadFrames() {
        loadedCount = 0; images.length = 0;
        for (let i = 1; i <= cfg.frameCount; i++) {
            const img = new Image();
            img.src = 'img/hero-frames/frame_' + pad(i, 4) + '.jpg';
            img.onload = () => { loadedCount++; if (loadedCount === cfg.frameCount) onAllLoaded(); };
            images.push(img);
        }
    }

    loadFrames();

    function renderHero() {
        if (!heroReady) return;

        const rect = heroSection.getBoundingClientRect();
        const scrollH = heroSection.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollH));

        // Frame
        const fi = Math.min(cfg.frameCount - 1, Math.floor(progress * cfg.frameCount));
        const img = images[fi];
        if (img && img.complete) {
            const cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
            const cr = cw / ch, ir = iw / ih;
            let dx = 0, dy = 0, dw = cw, dh = ch;
            if (ir > cr) { dw = ch * ir; dx = (cw - dw) / 2; } else { dh = cw / ir; dy = (ch - dh) / 2; }
            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
        }

        // Animate text modules
        const fd = cfg.fadeDuration || 0.04;
        heroSection.querySelectorAll('.hero-dyn').forEach(el => {
            const ms = parseFloat(el.dataset.cs);
            const ce = parseFloat(el.dataset.ce);
            const anim = el.dataset.anim || 'fade-up';
            const maxOp = parseFloat(el.dataset.opacity) || 1;
            const align = el.dataset.textAlign || 'left';
            const fdIn = parseFloat(el.dataset.fadeIn) || fd;
            const fdOut = parseFloat(el.dataset.fadeOut) || fd;

            let op = 0, tx = 0, ty = 0, sc = 1, bl = 0;
            if (progress >= ms && progress <= ce) {
                const inP = Math.min(1, (progress - ms) / fdIn);
                const outP = Math.min(1, (ce - progress) / fdOut);
                op = Math.min(inP, outP) * maxOp;
                const ease = 1 - inP, dist = 40;
                switch (anim) {
                    case 'fade-up': ty = dist * ease; break;
                    case 'fade-down': ty = -dist * ease; break;
                    case 'fade-left': tx = dist * ease; break;
                    case 'fade-right': tx = -dist * ease; break;
                    case 'scale-up': sc = 0.85 + 0.15 * inP; break;
                    case 'blur-in': bl = 12 * ease; break;
                }
            }

            el.style.opacity = op;
            const base = align === 'center' ? 'translateX(-50%)' : '';
            el.style.transform = `${base} translateX(${tx}px) translateY(${ty}px) scale(${sc})`;
            el.style.filter = bl > 0 ? `blur(${bl}px)` : '';
            el.style.pointerEvents = (op > 0 && el.dataset.isCta) ? 'auto' : 'none';
        });

        requestAnimationFrame(renderHero);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => { resizeCanvas(); updateFontSizes(); });
    resizeCanvas();
}

// ── Firebase Real-time Sync ─────────────────────────────────
onSnapshot(doc(db, 'config', 'hero'), (snap) => {
    if (snap.exists()) {
        const data = snap.data();
        if (data && data.tracks) {
            cfg = data;
            if (heroReady) buildDOM();
        }
    }
}, (err) => {
    console.warn('Firebase config error:', err.message);
});

// ── Navbar ──────────────────────────────────────────────────
const mainNav = document.getElementById('mainNav');
if (mainNav) {
    window.addEventListener('scroll', () => {
        mainNav.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ── Active nav link ─────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
function updateActiveLink() {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
        const top = section.offsetTop, h = section.offsetHeight, id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + h) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) link.classList.add('active');
            });
        }
    });
}
window.addEventListener('scroll', updateActiveLink);

// ── Scroll Reveal ──────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                let idx = 0;
                siblings.forEach((el, j) => { if (el === entry.target) idx = j; });
                setTimeout(() => entry.target.classList.add('active'), idx * 80);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
}

// ── Smooth scroll ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});
