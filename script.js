/* navbar */
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    window.scrollY > 40 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');
});

/* carrusel proyectos */
const projectSwiper = new Swiper('.projects-swiper', {
    slidesPerView: 1.2,
    centeredSlides: true,
    spaceBetween: 30,
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
    },
    breakpoints: {
        1024: { slidesPerView: 2.2 }
    }
});

/* efecto continuo de carrusel */
const logoSwiper = new Swiper('.logos-swiper', {
    slidesPerView: 3,
    spaceBetween: 50,
    loop: true,
    speed: 4000, 
    allowTouchMove: false, 
    autoplay: {
        delay: 0, 
        disableOnInteraction: false,
    },
    breakpoints: {
        768: { slidesPerView: 5 },
        1200: { slidesPerView: 7 }
    }
});

/* efecto de revelacion en cascada */
const observerOptions = {
    threshold: 0.3 
};

const manifestoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

const revealTitle = document.querySelector('.reveal-text');
if (revealTitle) {
    manifestoObserver.observe(revealTitle);
}
/* efecto de comparacion */
function actualizarComparador(valor) {
    const antes = document.getElementById('capaAntes');
    const linea = document.getElementById('lineaDiv');
    
    if (antes) antes.style.width = valor + '%';
    if (linea) linea.style.left = valor + '%';
}