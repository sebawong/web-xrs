/* ============================================================
   XRS — script.js
   Strategic Partner V2 — Scroll Sequence Hero + Firebase Config
   ============================================================ */

// ── Firebase SDK (modular) ──────────────────────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js';
import { getFirestore, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAfQZ4RARhe-jTD3emW4JVTmS_HMYBbZ2E",
    authDomain: "xrs-landing.firebaseapp.com",
    projectId: "xrs-landing",
    storageBucket: "xrs-landing.firebasestorage.app",
    messagingSenderId: "225138279563",
    appId: "1:225138279563:web:50dcbb04dc3eea32cf008e"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// ── Default Config (fallback) ───────────────────────────────
const DEFAULT_CONFIG = {
    scrollHeight: 5,
    frameCount: 168,
    fadeDuration: 0.04,
    translateY: 40,
    overlayOpacity: 0.75,
    scenes: [
        { start: 0, end: 0.12, modules: [
            { type: 'tag', content: 'Comercialización estratégica para real estate', position: 'bottom-left', animation: 'fade-up', delay: 0 },
            { type: 'headline', content: 'Del plano\na la estrategia.', position: 'bottom-left', animation: 'fade-up', delay: 0.01, size: 'h1' },
        ]},
        { start: 0.15, end: 0.30, modules: [
            { type: 'headline', content: 'Transformamos la visión del desarrollador\nen un activo comercial de alto impacto.', position: 'center-left', animation: 'fade-up', delay: 0, size: 'h2' },
        ]},
        { start: 0.33, end: 0.50, modules: [
            { type: 'tag', content: 'Precisión en cada capa', position: 'bottom-left', animation: 'fade-up', delay: 0 },
            { type: 'headline', content: 'Cada metro cuadrado\ntiene una historia que contar.', position: 'bottom-left', animation: 'fade-up', delay: 0.01, size: 'h2' },
            { type: 'body', content: 'Diseñamos el ecosistema que la hace irresistible.', position: 'bottom-left', animation: 'fade-up', delay: 0.02 },
        ]},
        { start: 0.55, end: 0.72, modules: [
            { type: 'tag', content: 'Experiencia inmersiva', position: 'center-right', animation: 'fade-left', delay: 0 },
            { type: 'headline', content: 'No mostramos renders.\nCreamos vivencias.', position: 'center-right', animation: 'fade-left', delay: 0.01, size: 'h2' },
            { type: 'body', content: 'Tecnología y narrativa al servicio de la decisión de compra.', position: 'center-right', animation: 'fade-left', delay: 0.02 },
        ]},
        { start: 0.78, end: 1, modules: [
            { type: 'headline', content: 'Potenciamos cómo un proyecto\nse presenta, se entiende\ny se vende.', position: 'center', animation: 'fade-up', delay: 0, size: 'h1' },
            { type: 'cta', content: 'Hacer autodiagnóstico', position: 'center', animation: 'fade-up', delay: 0.02, href: '#diagnostico' },
        ]},
    ]
};

let heroConfig = DEFAULT_CONFIG;

// ── Hero Elements ───────────────────────────────────────────
const heroSection = document.querySelector('.hero-scroll-section');
const canvas = document.getElementById('heroCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const images = [];
let heroReady = false;
let FRAME_COUNT = heroConfig.frameCount;

function padNumber(num, size) {
    let s = String(num);
    while (s.length < size) s = '0' + s;
    return s;
}

// ── Build Text Blocks from Config ───────────────────────────
function buildHeroDOM() {
    if (!heroSection) return;

    heroSection.style.height = (heroConfig.scrollHeight * 100) + 'vh';

    // Update overlay
    const ov = heroSection.querySelector('.hero-scroll-overlay');
    if (ov) {
        const o = heroConfig.overlayOpacity;
        ov.style.background = `linear-gradient(135deg, rgba(19,19,19,${o}) 0%, rgba(19,19,19,${o*0.53}) 40%, rgba(19,19,19,${o*0.2}) 100%)`;
    }

    // Remove old dynamic text blocks
    heroSection.querySelectorAll('.hero-text-module').forEach(el => el.remove());

    const sticky = heroSection.querySelector('.hero-scroll-sticky');
    if (!sticky) return;

    // Remove old static text blocks too
    sticky.querySelectorAll('.hero-text-block').forEach(el => el.remove());

    heroConfig.scenes.forEach((scene) => {
        if (!scene.modules) return;
        scene.modules.forEach((mod) => {
            const div = document.createElement('div');
            div.className = 'hero-text-module';
            div.dataset.sceneStart = scene.start;
            div.dataset.sceneEnd = scene.end;
            div.dataset.delay = mod.delay || 0;
            div.dataset.animation = mod.animation || 'fade-up';
            div.dataset.position = mod.position || 'bottom-left';
            div.style.opacity = '0';
            div.style.position = 'absolute';
            div.style.zIndex = '10';
            div.style.maxWidth = '900px';
            div.style.padding = '0 24px';
            div.style.pointerEvents = 'none';

            // Position
            applyPosition(div, mod.position);

            // Content
            if (mod.type === 'tag') {
                div.innerHTML = `<span class="hero-detail-tag">${esc(mod.content)}</span>`;
            } else if (mod.type === 'headline') {
                const tag = mod.size === 'h1' ? 'h1' : 'h2';
                const cls = mod.size === 'h1' ? 'hero-headline' : '';
                div.innerHTML = `<${tag} class="${cls}">${esc(mod.content).replace(/\n/g, '<br class="desktop-only"/>')}</${tag}>`;
            } else if (mod.type === 'body') {
                div.innerHTML = `<p style="color:var(--on-surface-variant);font-weight:300;line-height:1.7;max-width:520px;font-size:clamp(1rem,1.5vw,1.25rem);">${esc(mod.content)}</p>`;
            } else if (mod.type === 'cta') {
                div.innerHTML = `<div class="hero-ctas"><a href="${mod.href || '#diagnostico'}" class="btn-primary btn-lg">${esc(mod.content)}</a><a href="#enfoque" class="btn-outline btn-lg">Ver cómo trabajamos</a></div>`;
            }

            sticky.appendChild(div);
        });
    });
}

function applyPosition(el, pos) {
    el.style.top = ''; el.style.bottom = ''; el.style.left = ''; el.style.right = '';
    el.style.textAlign = 'left'; el.style.transform = '';

    if (pos === 'center') {
        el.style.top = '50%'; el.style.left = '50%';
        el.style.textAlign = 'center'; el.style.maxWidth = '1100px';
    } else if (pos === 'center-left') {
        el.style.top = '50%'; el.style.left = '0';
    } else if (pos === 'center-right') {
        el.style.top = '50%'; el.style.right = '0'; el.style.left = 'auto';
        el.style.textAlign = 'right';
    } else if (pos === 'bottom-left') {
        el.style.bottom = '12%'; el.style.left = '0';
    } else if (pos === 'bottom-right') {
        el.style.bottom = '12%'; el.style.right = '0'; el.style.left = 'auto';
        el.style.textAlign = 'right';
    } else if (pos === 'top-left') {
        el.style.top = '15%'; el.style.left = '0';
    } else if (pos === 'top-right') {
        el.style.top = '15%'; el.style.right = '0'; el.style.left = 'auto';
        el.style.textAlign = 'right';
    }
}

function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Canvas + Scroll Animation ───────────────────────────────
if (canvas && ctx && heroSection) {
    let loadedCount = 0;

    function onAllLoaded() {
        heroReady = true;
        resizeCanvas();
        buildHeroDOM();
        requestAnimationFrame(renderHero);
    }

    function loadFrames() {
        loadedCount = 0;
        images.length = 0;
        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = 'img/hero-frames/frame_' + padNumber(i, 4) + '.jpg';
            img.onload = () => { loadedCount++; if (loadedCount === FRAME_COUNT) onAllLoaded(); };
            images.push(img);
        }
    }

    loadFrames();

    function renderHero() {
        if (!heroReady) return;

        const rect = heroSection.getBoundingClientRect();
        const scrollHeight = heroSection.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollHeight));

        // Draw frame
        const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
        const img = images[frameIndex];

        if (img && img.complete) {
            const cw = canvas.width, ch = canvas.height;
            const iw = img.naturalWidth, ih = img.naturalHeight;
            const canvasRatio = cw / ch, imgRatio = iw / ih;
            let dx = 0, dy = 0, dw = cw, dh = ch;

            if (imgRatio > canvasRatio) { dw = ch * imgRatio; dx = (cw - dw) / 2; }
            else { dh = cw / imgRatio; dy = (ch - dh) / 2; }

            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
        }

        // Animate text modules
        const modules = heroSection.querySelectorAll('.hero-text-module');
        const fadeD = heroConfig.fadeDuration;
        const transY = heroConfig.translateY;

        modules.forEach(mod => {
            const scStart = parseFloat(mod.dataset.sceneStart);
            const scEnd = parseFloat(mod.dataset.sceneEnd);
            const delay = parseFloat(mod.dataset.delay) || 0;
            const anim = mod.dataset.animation || 'fade-up';
            const pos = mod.dataset.position || 'bottom-left';
            const modStart = scStart + delay;

            let opacity = 0, tx = 0, ty = 0, scale = 1, blur = 0;

            if (progress >= modStart && progress <= scEnd) {
                const inP = Math.min(1, (progress - modStart) / fadeD);
                const outP = Math.min(1, (scEnd - progress) / fadeD);
                opacity = Math.min(inP, outP);
                const ease = 1 - inP;

                switch (anim) {
                    case 'fade-up': ty = transY * ease; break;
                    case 'fade-down': ty = -transY * ease; break;
                    case 'fade-left': tx = transY * ease; break;
                    case 'fade-right': tx = -transY * ease; break;
                    case 'scale-up': scale = 0.85 + 0.15 * inP; break;
                    case 'blur-in': blur = 12 * ease; break;
                }
            }

            mod.style.opacity = opacity;
            mod.style.pointerEvents = opacity > 0 ? 'auto' : 'none';

            const isCenterV = pos === 'center' || pos === 'center-left' || pos === 'center-right';
            if (pos === 'center') {
                mod.style.transform = `translate(-50%, calc(-50% + ${ty}px)) translateX(${tx}px) scale(${scale})`;
            } else if (isCenterV) {
                mod.style.transform = `translateY(calc(-50% + ${ty}px)) translateX(${tx}px) scale(${scale})`;
            } else {
                mod.style.transform = `translateY(${ty}px) translateX(${tx}px) scale(${scale})`;
            }

            if (blur > 0) mod.style.filter = `blur(${blur}px)`;
            else mod.style.filter = '';
        });

        requestAnimationFrame(renderHero);
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// ── Firebase Real-time Config ───────────────────────────────
const configDoc = doc(db, 'config', 'hero');
onSnapshot(configDoc, (snap) => {
    if (snap.exists()) {
        const data = snap.data();
        if (data && data.scenes) {
            heroConfig = data;
            FRAME_COUNT = heroConfig.frameCount || 168;
            if (heroReady) buildHeroDOM();
        }
    }
}, (err) => {
    console.warn('Firebase config listener error:', err.message, '— using defaults');
});

// ── Navbar scroll effect ────────────────────────────────────
const mainNav = document.getElementById('mainNav');
if (mainNav) {
    window.addEventListener('scroll', () => {
        mainNav.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ── Active nav link on scroll ───────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}
window.addEventListener('scroll', updateActiveLink);

// ── Scroll Reveal ──────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                let idx = 0;
                siblings.forEach((el, j) => { if (el === entry.target) idx = j; });
                setTimeout(() => { entry.target.classList.add('active'); }, idx * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
}

// ── Smooth scroll for anchor links ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
