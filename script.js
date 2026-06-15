const selectors = {
  nav: ".nav",
  navToggle: "[data-nav-toggle]",
  navLinks: "[data-nav-links]",
  pageLink: "[data-page-link]",
  year: "[data-year]",
  typewriter: "[data-typewriter]",
  accordionToggle: "[data-accordion-toggle]",
  contactForm: "[data-contact-form]",
  formNote: "[data-form-note]",
  counter: "[data-counter]",
};

const siteState = {
  prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

function setFooterYear() {
  document.querySelectorAll(selectors.year).forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

function setActiveNavigation() {
  const currentPage = document.body.dataset.page;

  document.querySelectorAll(selectors.pageLink).forEach((link) => {
    const isActive = link.dataset.pageLink === currentPage;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setupMobileNavigation() {
  const nav = document.querySelector(selectors.nav);
  const navToggle = document.querySelector(selectors.navToggle);
  const navLinks = document.querySelector(selectors.navLinks);

  if (!nav || !navToggle || !navLinks) return;

  function closeMenu() {
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open") || nav.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) {
      closeMenu();
    }
  });
}

function parseTypewriterPhrases(element) {
  return (element.dataset.phrases || "")
    .split("|")
    .map((phrase) => phrase.trim())
    .filter(Boolean);
}

function setupTypewriter() {
  const element = document.querySelector(selectors.typewriter);
  if (!element) return;

  const phrases = parseTypewriterPhrases(element);
  if (!phrases.length) return;

  if (siteState.prefersReducedMotion) {
    element.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let characterIndex = phrases[0].length;
  let deleting = true;

  function renderNextFrame() {
    const phrase = phrases[phraseIndex];
    element.textContent = phrase.slice(0, characterIndex);

    if (deleting) {
      characterIndex -= 1;
    } else {
      characterIndex += 1;
    }

    if (characterIndex < 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      characterIndex = 0;
    }

    if (characterIndex > phrases[phraseIndex].length) {
      deleting = true;
      characterIndex = phrases[phraseIndex].length;
    }

    const atFullPhrase = deleting && characterIndex === phrase.length;
    const atEmptyPhrase = !deleting && characterIndex === 0;
    const delay = atFullPhrase ? 1450 : atEmptyPhrase ? 420 : deleting ? 34 : 58;

    window.setTimeout(renderNextFrame, delay);
  }

  window.setTimeout(renderNextFrame, 1200);
}

function setupAccordions() {
  document.querySelectorAll(selectors.accordionToggle).forEach((toggle) => {
    const content = toggle.nextElementSibling;
    if (!content) return;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      content.hidden = isOpen;
    });
  });
}

function getErrorElement(field) {
  return document.querySelector(`[data-error-for="${field.name}"]`);
}

function setFieldError(field, message) {
  const errorElement = getErrorElement(field);
  field.setAttribute("aria-invalid", message ? "true" : "false");

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function validateContactForm(form) {
  const fields = Array.from(form.querySelectorAll("input, textarea"));
  let firstInvalidField = null;

  fields.forEach((field) => {
    const value = field.value.trim();
    let message = "";

    if (field.required && !value) {
      message = "This field is required.";
    }

    if (!message && field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = "Enter a valid email address.";
    }

    setFieldError(field, message);

    if (message && !firstInvalidField) {
      firstInvalidField = field;
    }
  });

  return { isValid: !firstInvalidField, firstInvalidField };
}

function setupContactForm() {
  const form = document.querySelector(selectors.contactForm);
  const formNote = document.querySelector(selectors.formNote);

  if (!form || !formNote) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const validation = validateContactForm(form);
    if (!validation.isValid) {
      formNote.textContent = "Please fix the highlighted fields and try again.";
      formNote.classList.remove("is-success");
      validation.firstInvalidField.focus();
      return;
    }

    const formData = new FormData(form);
    const subject = `KorvexIT enquiry from ${formData.get("company") || formData.get("name")}`;
    const body = [
      `Name: ${formData.get("name") || ""}`,
      `Company: ${formData.get("company") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Phone: ${formData.get("phone") || ""}`,
      `Employees: ${formData.get("employees") || ""}`,
      `Main need: ${formData.get("need") || ""}`,
      "",
      "Message:",
      formData.get("message") || "",
    ].join("\n");

    window.location.href = `mailto:Support@KorvexIT.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    formNote.textContent = "Your email app should open with the request ready to send.";
    formNote.classList.add("is-success");
    form.reset();
  });
}

function animateCounter(element) {
  const end = Number(element.dataset.counterEnd || element.textContent);
  const duration = Number(element.dataset.counterDuration || 900);

  if (!Number.isFinite(end)) return;

  if (siteState.prefersReducedMotion) {
    element.textContent = String(Math.round(end));
    return;
  }

  const startTime = window.performance.now();

  function renderFrame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(end * easedProgress));

    if (progress < 1) {
      window.requestAnimationFrame(renderFrame);
    }
  }

  element.textContent = "0";
  window.requestAnimationFrame(renderFrame);
}

function setupCounters() {
  const counters = document.querySelectorAll(selectors.counter);
  if (!counters.length) return;

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function init() {
  setFooterYear();
  setActiveNavigation();
  setupMobileNavigation();
  setupTypewriter();
  setupAccordions();
  setupContactForm();
  setupCounters();
}

init();
