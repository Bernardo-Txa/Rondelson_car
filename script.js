const whatsappNumber = "5527997283536";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const header = document.querySelector("[data-header]");
const vehicleSearch = document.querySelector("#vehicleSearch");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const vehicles = Array.from(document.querySelectorAll(".vehicle-card"));
const emptyState = document.querySelector("#emptyState");
const budgetRange = document.querySelector("#budgetRange");
const budgetOutput = document.querySelector("#budgetOutput");
const downPayment = document.querySelector("#downPayment");
const testimonialCarousel = document.querySelector("[data-testimonial-carousel]");
const testimonialTrack = document.querySelector(".testimonial-track");
const testimonialSlides = Array.from(document.querySelectorAll(".testimonial-slide"));
const testimonialDots = Array.from(document.querySelectorAll("[data-testimonial-dot]"));
const testimonialCurrent = document.querySelector("[data-testimonial-current]");
const testimonialPrev = document.querySelector("[data-testimonial-prev]");
const testimonialNext = document.querySelector("[data-testimonial-next]");
let testimonialIndex = 0;
let testimonialTimer;

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const getActiveFilter = () => {
  const activeButton = filterButtons.find((button) => button.classList.contains("is-active"));
  return activeButton?.dataset.filter || "all";
};

const updateVehicles = () => {
  const query = vehicleSearch.value.trim().toLowerCase();
  const activeFilter = getActiveFilter();
  let visibleCount = 0;

  vehicles.forEach((vehicle) => {
    const matchesBrand = activeFilter === "all" || vehicle.dataset.brand === activeFilter;
    const matchesQuery = vehicle.dataset.name.toLowerCase().includes(query);
    const shouldShow = matchesBrand && matchesQuery;

    vehicle.hidden = !shouldShow;
    if (shouldShow) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
};

const updateFinance = () => {
  const value = Number(budgetRange.value);
  budgetOutput.value = formatCurrency(value);
  downPayment.textContent = formatCurrency(value * 0.2);
};

const getCircularOffset = (slideIndex) => {
  const total = testimonialSlides.length;
  let offset = slideIndex - testimonialIndex;

  if (offset > total / 2) offset -= total;
  if (offset < total / -2) offset += total;

  return offset;
};

const setTestimonial = (index) => {
  if (!testimonialTrack || testimonialSlides.length === 0) return;

  testimonialIndex = (index + testimonialSlides.length) % testimonialSlides.length;
  const carouselWidth = testimonialCarousel.clientWidth || window.innerWidth;
  const isMobile = carouselWidth < 660;
  const spread = isMobile ? Math.min(carouselWidth * 0.32, 124) : Math.min(carouselWidth * 0.38, 430);
  const angleStep = isMobile ? 38 : 50;

  testimonialSlides.forEach((slide, slideIndex) => {
    const offset = getCircularOffset(slideIndex);
    const side = Math.sign(offset);
    const isActive = offset === 0;
    const x = side * spread;
    const z = isActive ? (isMobile ? 48 : 120) : (isMobile ? -110 : -160);
    const angle = side * -angleStep;
    const scale = isActive ? 1 : isMobile ? 0.76 : 0.86;

    slide.classList.toggle("is-active", isActive);
    slide.classList.toggle("is-side", !isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
    slide.style.zIndex = String(isActive ? 3 : 2);
    slide.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg) scale(${scale})`;
  });

  testimonialDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === testimonialIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-selected", String(isActive));
  });

  if (testimonialCurrent) {
    testimonialCurrent.textContent = String(testimonialIndex + 1).padStart(2, "0");
  }
};

const startTestimonialTimer = () => {
  if (!testimonialCarousel || testimonialSlides.length < 2) return;
  stopTestimonialTimer();
  testimonialTimer = window.setInterval(() => {
    setTestimonial(testimonialIndex + 1);
  }, 5600);
};

const stopTestimonialTimer = () => {
  window.clearInterval(testimonialTimer);
};

const scrollToHashTarget = () => {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);
  target?.scrollIntoView();
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    updateVehicles();
  });
});

document.querySelectorAll("[data-whatsapp-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("nome");
    const model = formData.get("modelo");
    const km = formData.get("km");
    const message = `Ola, sou ${name}. Quero avaliar meu carro: ${model}, ${km}.`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    form.reset();
  });
});

window.addEventListener("scroll", updateHeader, { passive: true });
vehicleSearch.addEventListener("input", updateVehicles);
budgetRange.addEventListener("input", updateFinance);

if (testimonialCarousel) {
  testimonialPrev.addEventListener("click", () => {
    setTestimonial(testimonialIndex - 1);
    startTestimonialTimer();
  });

  testimonialNext.addEventListener("click", () => {
    setTestimonial(testimonialIndex + 1);
    startTestimonialTimer();
  });

  testimonialDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      setTestimonial(Number(dot.dataset.testimonialDot));
      startTestimonialTimer();
    });
  });

  testimonialCarousel.addEventListener("mouseenter", stopTestimonialTimer);
  testimonialCarousel.addEventListener("mouseleave", startTestimonialTimer);
  testimonialCarousel.addEventListener("focusin", stopTestimonialTimer);
  testimonialCarousel.addEventListener("focusout", startTestimonialTimer);
  window.addEventListener("resize", () => setTestimonial(testimonialIndex), { passive: true });
}

updateHeader();
updateFinance();
setTestimonial(0);
startTestimonialTimer();
scrollToHashTarget();
window.addEventListener("load", scrollToHashTarget);

if (window.lucide) {
  window.lucide.createIcons();
}
