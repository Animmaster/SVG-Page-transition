// ===== Page templates =====
const pages = {
  home: `<section class="hero" data-page="home"><h1>Home</h1></section>`,
  about: `<section class="hero" data-page="about"><h1>About</h1></section>`,
  contact: `<section class="hero" data-page="contact"><h1>Contact</h1></section>`,
};

// ===== Setup SVG paths (mirrors the useEffect in TransitionProvider) =====
const svgEl = document.querySelector(".transition-svg svg");
const paths = Array.from(svgEl.querySelectorAll("path"));

paths.forEach((path) => {
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
});

// ===== Animations (1:1 with original leave/enter) =====
function leave() {
  return new Promise((resolve) => {
    const tween = gsap.timeline({ onComplete: resolve });

    paths.forEach((path) => {
      tween.to(
        path,
        {
          strokeDashoffset: 0,
          attr: { "stroke-width": 700 },
          duration: 1,
          ease: "power1.inOut",
        },
        0,
      );
    });
  });
}

function enter() {
  return new Promise((resolve) => {
    const tween = gsap.timeline({ onComplete: resolve });

    paths.forEach((path) => {
      const length = path.getTotalLength();
      tween.to(
        path,
        {
          strokeDashoffset: -length,
          attr: { "stroke-width": 200 },
          duration: 1,
          ease: "power1.inOut",
          onComplete: () => {
            gsap.set(path, { strokeDashoffset: length });
          },
        },
        0,
      );
    });
  });
}

// ===== Routing =====
const pageContent = document.getElementById("page-content");
let isTransitioning = false;
let currentRoute = getRouteFromHash();

function getRouteFromHash() {
  const hash = window.location.hash.replace("#", "");
  return pages[hash] ? hash : "home";
}

function renderPage(route) {
  pageContent.innerHTML = pages[route] || pages.home;
}

async function navigate(route) {
  if (isTransitioning) return;
  if (route === currentRoute) return;
  if (!pages[route]) return;

  isTransitioning = true;

  await leave();
  currentRoute = route;
  renderPage(route);
  if (window.location.hash !== `#${route}`) {
    history.pushState(null, "", `#${route}`);
  }
  await enter();

  isTransitioning = false;
}

// Intercept nav clicks
document.querySelectorAll("[data-link]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const route = link.getAttribute("data-link");
    navigate(route);
  });
});

// Back/forward buttons
window.addEventListener("popstate", () => {
  const route = getRouteFromHash();
  navigate(route);
});

// Initial render based on hash
renderPage(currentRoute);
