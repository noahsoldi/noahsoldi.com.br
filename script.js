gsap.registerPlugin(Observer);
gsap.registerPlugin(ScrambleTextPlugin);
const panels = gsap.utils.toArray(".panel");
let index = 0;
let animating = false;
const indicators = gsap.utils.toArray(".section-indicator button");
const textTargets = gsap.utils.toArray(
    ".panel h3"
);
const blockShow = gsap.utils.toArray(
    ".editor"
);


const splitTexts = textTargets.map(el =>
    new SplitText(el, { type: "chars", charsClass: "char" })
);

splitTexts.forEach(split => {
    gsap.set(split.chars, {
        autoAlpha: 0,
        yPercent: 80
    });
});

function animateText(panel, direction = 1) {
    const chars = panel.querySelectorAll(".char");
    chars.forEach(char => {
        gsap.fromTo(char,
            { autoAlpha: 0, yPercent: 80 },
            {
                autoAlpha: 1,
                yPercent: 0,
                duration: 2,
                scrambleText: {
                    text: char.textContent,
                    chars: "upperAndLowerCase",
                    revealDelay: 0.5
                },
                ease: "power2.out"
            }
        );
    });
}

window.addEventListener("DOMContentLoaded", () => {
    const scrambleConfigs = [
        { selector: "#scramble-nome", attr: "js-texto-nome" },
        { selector: "#scramble-titulo", attr: "js-texto-titulo" },
        { selector: "#scramble-descricao", attr: "js-texto-descricao", preserveSpaces: true }
    ];

    scrambleConfigs.forEach(cfg => {
        const el = document.querySelector(cfg.selector);
        if (!el) return;
        gsap.from(cfg.selector, {
            duration: 2,
            scrambleText: {
                text: el.getAttribute(cfg.attr),
                chars: "upperAndLowerCase",
                revealDelay: 0.5,
                ...(cfg.preserveSpaces ? { preserveSpaces: true } : {})
            },
            ease: "power2.out"
        });
    });
});


panels.forEach((panel, i) => {
    gsap.set(panel, {
        yPercent: i === 0 ? 0 : 100,
        autoAlpha: i === 0 ? 1 : 0
    });
});

const panelAnimated = panels.map(() => false);

function goToPanel(newIndex, direction) {
    if (animating || newIndex < 0 || newIndex >= panels.length) return;

    animating = true;

    const current = panels[index];
    const next = panels[newIndex];
    //const idNextPanel = next.getAttribute("id");
    const prevChars = current.querySelectorAll(".char");
    gsap.set(prevChars, {
        autoAlpha: 0,
        yPercent: -120 * direction
    });

    if (panelAnimated[newIndex]) {
        const chars = next.querySelectorAll(".char");
        gsap.set(chars, { autoAlpha: 1, yPercent: 0 });
    }

    gsap.timeline({
        defaults: {
            duration: 1,
            ease: "power1.inOut"
        },
        onComplete: () => {
            index = newIndex;
            animating = false;
            updateIndicator(index);
            if (!panelAnimated[newIndex]) {
                animateText(next, direction);
                panelAnimated[newIndex] = true;
            }
        }
    })
        .to(current, { yPercent: direction > 0 ? -100 : 100, autoAlpha: 0 })
        .fromTo(next,
            { yPercent: direction > 0 ? 100 : -100, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1 },
            0
        );
}

function updateIndicator(activeIndex) {
    indicators.forEach((btn, i) => {
        if (i === activeIndex) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    if (activeIndex === 0) {
        document.querySelector(".section-indicator").classList.add("indicator-clean");
    } else {
        document.querySelector(".section-indicator").classList.remove("indicator-clean");
    }
}


document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
        e.preventDefault();
        goToPanel(index + 1, 1);
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();
        goToPanel(index - 1, -1);
    }
});

indicators.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetIndex = Number(btn.dataset.index);
        if (targetIndex === index) return;

        const direction = targetIndex > index ? 1 : -1;
        goToPanel(targetIndex, direction);
    });
});

Observer.create({
    type: "pointer",
    tolerance: 10,
    preventDefault: false,
});

panels.forEach((panel, i) => {
    // Evento para desktop (wheel)
    panel.addEventListener('wheel', function(e) {
        if (animating || i !== index) return;
        const delta = e.deltaY;
        if (delta > 0) { // scroll para baixo
            if (panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2) {
                e.preventDefault();
                goToPanel(index + 1, 1);
            }
        } else if (delta < 0) { // scroll para cima
            if (panel.scrollTop <= 2) {
                e.preventDefault();
                goToPanel(index - 1, -1);
            }
        }
    }, { passive: false });

    // Evento para mobile (touch)
    let touchStartY = null;
    panel.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
        }
    });
    panel.addEventListener('touchend', function(e) {
        if (touchStartY === null) return;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        touchStartY = null;
        if (Math.abs(deltaY) < 30) return; // ignorar toques pequenos
        if (animating || i !== index) return;
        if (deltaY > 0) { // swipe para cima (scroll para baixo)
            if (panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2) {
                goToPanel(index + 1, 1);
            }
        } else if (deltaY < 0) { // swipe para baixo (scroll para cima)
            if (panel.scrollTop <= 2) {
                goToPanel(index - 1, -1);
            }
        }
    });
});

animateText(panels[0], 1);
panelAnimated[0] = true;
updateIndicator(0);



/* ================================ PARTICLES.JS ================================ */
particlesJS("particles-js", {
    "particles": {
        "number":
        {
            "value": 110,
            "density":
                { "enable": true, "value_area": 800 }
        },
        "color": { "value": "#ffffff" },
        "shape": {
            "type": "circle", "stroke":
                { "width": 0, "color": "#000000" }, "polygon":
                { "nb_sides": 5 }, "image": { "src": "img/github.svg", "width": 100, "height": 100 }
        }, "opacity": {
            "value": 0.07891476416322726,
            "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false }
        },
        "size": {
            "value": 2, "random": true, "anim": {
                "enable": false, "speed": 50, "size_min": 0.1,
                "sync": false
            }
        }, "line_linked": {
            "enable": true, "distance": 205,
            "color": "#ffffff", "opacity": 0.1, "width": 1
        }, "move":
        {
            "enable": true, "speed": 3, "direction": "none", "random": true,
            "straight": false, "out_mode": "out", "bounce": false, "attract": {
                "enable": false, "rotateX": 1200, "rotateY": 1200
            }
        }
    }, "interactivity": {
        "detect_on": "canvas", "events": {
            "onhover":
                { "enable": true, "mode": "grab" }, "onclick":
                { "enable": true, "mode": "push" }, "resize": true
        }, "modes": {
            "grab":
                { "distance": 270, "line_linked": { "opacity": 1 } }, "bubble":
                { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
            "repulse": { "distance": 200, "duration": 0.4 }, "push": { "particles_nb": 4 },
            "remove": { "particles_nb": 2 }
        }
    }, "retina_detect": false
});
// var count_particles, stats, update;
// stats = new Stats;
// stats.setMode(0);
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.left = '0px'; stats.domElement.style.top = '0px';
// document.body.appendChild(stats.domElement); count_particles =
//     document.querySelector('.js-count-particles');
// update = function () {
//     stats.begin(); stats.end();
//     if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) {
//         count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
//     }
//     requestAnimationFrame(update);
// };
// requestAnimationFrame(update);


