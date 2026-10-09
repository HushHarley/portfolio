// =====================================================
// SITE LOGIC
// Builds the sections from js/content.js, applies the labels from
// js/translations.js, and runs the language and theme buttons, the phone menu,
// the project filters, the project details window and the scroll effects.
// To change what the page says, edit those two files instead.
// =====================================================

// Saved choices. Keep these names, or returning visitors lose their saved theme
// and language. The script in the <head> of index.html reads the theme key too.
const STORAGE_KEYS = { language: "astra-language", theme: "astra-theme" };
const LANGUAGES = ["en", "frCA"];
// Shown to first-time visitors. After that, the flag they last picked is remembered.
const DEFAULT_LANGUAGE = "frCA";

const root = document.documentElement;
const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-navigation");
const projectDialog = document.querySelector("#project-dialog");
const dialogContent = document.querySelector("#dialog-content");
const dialogCloseButton = document.querySelector(".dialog-close");
const progressBar = document.querySelector(".reading-progress-bar");
const sections = [...document.querySelectorAll("[data-section]")];
const sectionLinks = document.querySelectorAll("[data-section-link]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
// Same breakpoint as the phone layout in css/style.css.
const phoneLayout = window.matchMedia("(max-width: 760px)");

const savedLanguage = readSetting(STORAGE_KEYS.language);
let language = LANGUAGES.includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
// Desktop and phones keep separate filter choices. Phones start with none
// selected, which hides the cards until a filter is tapped.
let desktopFilter = "all";
let phoneFilter = null;
let dialogOpener = null;
let scrollUpdateQueued = false;


// ---------- Helpers ----------

function readSetting(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function saveSetting(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Storage can be blocked (strict privacy settings). The choice just isn't remembered.
    }
}

// Text is a plain string or an { en, frCA } pair. A missing French text falls back to English.
function localize(text, lang = language) {
    if (typeof text === "string") return text;
    return text?.[lang] || text?.en || "";
}

// translate("nav.about") returns translations.nav.about in the current language.
function translate(key, lang = language) {
    const text = key.split(".").reduce((group, part) => group?.[part], translations);
    return text ? localize(text, lang) : key;
}

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function createLink(className, label, url, newTab = /^https?:/.test(url)) {
    const link = createElement("a", className, label);
    link.href = url;
    if (newTab) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    }
    return link;
}


// ---------- Sections ----------
// Each section is skipped if its container isn't in index.html.

function renderAbout() {
    const container = document.querySelector("#about-content");
    if (!container) return;

    const buttons = createElement("div", "button-row");
    buttons.append(
        createLink("button", `${translate("about.cv")} ↗`, portfolioContent.cvUrl, true),
        createLink("button button-secondary", `${translate("about.email")} ↗`, `mailto:${portfolioContent.email}`)
    );
    container.replaceChildren(...portfolioContent.about.map((paragraph) => createElement("p", "", localize(paragraph))), buttons);
}

function renderTimeline(containerId, entries) {
    const container = document.querySelector(containerId);
    if (!container) return;

    container.replaceChildren(...entries.map((entry) => {
        const details = createElement("div");
        details.append(
            createElement("h3", "", localize(entry.title)),
            createElement("p", "timeline-place", localize(entry.place)),
            createElement("p", "timeline-description", localize(entry.description))
        );

        if (entry.points?.length) {
            const list = createElement("ul", "timeline-points");
            list.append(...entry.points.map((point) => createElement("li", "", localize(point))));
            details.append(list);
        }

        const item = createElement("article", "timeline-item");
        item.append(createElement("p", "timeline-date", localize(entry.dates)), details);
        return item;
    }));
}

function renderSkills() {
    const container = document.querySelector("#skills-list");
    if (!container) return;

    container.replaceChildren(...portfolioContent.skills.map((group) => {
        const tags = createElement("div", "skill-tags");
        tags.append(...group.items.map((skill) => createElement("span", "skill-tag", localize(skill))));

        const item = createElement("article", "skill-group");
        item.append(createElement("h3", "", localize(group.name)), tags);
        return item;
    }));
}

function renderSocialLinks() {
    const container = document.querySelector("#social-links");
    if (!container) return;

    container.replaceChildren(...portfolioContent.socialLinks.map((social) => createLink("social-link", `${social.name} ↗`, social.url)));
}


// ---------- Projects ----------

function renderFilters() {
    const container = document.querySelector("#project-filters");
    if (!container) return;

    container.replaceChildren(...portfolioContent.filters.map((filter) => {
        const count = portfolioContent.projects.filter((project) => filter.id === "all" || project.filters.includes(filter.id)).length;
        const button = createElement("button", "filter-button", `${localize(filter.label)} · ${count}`);
        button.type = "button";
        button.dataset.filter = filter.id;
        button.setAttribute("aria-controls", "projects-grid");
        button.addEventListener("click", () => chooseFilter(filter.id));
        return button;
    }));
}

function createProjectCard(project) {
    const image = createElement("img", "project-image");
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 1200;
    image.height = 675;
    image.src = project.image;
    image.alt = localize(project.alt);

    const imageWrap = createElement("span", "project-image-wrap");
    imageWrap.append(image, createElement("span", "project-category", localize(project.category)));

    const tags = createElement("span", "project-tech");
    tags.append(...project.tech.slice(0, 3).map((tech) => createElement("span", "tech-tag", localize(tech))));
    const arrow = createElement("span", "card-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    const footer = createElement("span", "card-footer");
    footer.append(tags, arrow);

    const body = createElement("span", "project-card-body");
    body.append(
        createElement("span", "project-title", localize(project.title)),
        createElement("span", "project-summary", localize(project.summary)),
        footer
    );

    const card = createElement("button", "project-card");
    card.type = "button";
    card.dataset.filters = project.filters.join(" ");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `${translate("projects.openLabel")} ${localize(project.title)}`);
    card.append(imageWrap, body);
    card.addEventListener("click", () => openProject(project, card));
    return card;
}

function renderProjects() {
    const grid = document.querySelector("#projects-grid");
    if (!grid) return;

    grid.replaceChildren(...portfolioContent.projects.map(createProjectCard));
    showFilteredProjects();
}

function chooseFilter(filterId) {
    if (phoneLayout.matches) {
        // Tapping the selected filter again hides the cards.
        phoneFilter = phoneFilter === filterId ? null : filterId;
    } else {
        desktopFilter = filterId;
    }
    showFilteredProjects();
}

function showFilteredProjects() {
    const grid = document.querySelector("#projects-grid");
    const status = document.querySelector("#filter-status");
    if (!grid || !status) return;

    const filter = phoneLayout.matches ? phoneFilter : desktopFilter;
    let shown = 0;

    grid.querySelectorAll(".project-card").forEach((card) => {
        const matches = filter === "all" || (filter !== null && card.dataset.filters.split(" ").includes(filter));
        card.hidden = !matches;
        if (matches) shown += 1;
    });

    document.querySelectorAll(".filter-button").forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    grid.hidden = filter === null;
    if (filter === null) {
        status.textContent = translate("projects.chooseFilter");
    } else {
        const hint = phoneLayout.matches ? ` · ${translate("projects.collapseHint")}` : "";
        status.textContent = `${String(shown).padStart(2, "0")} ${translate("projects.results")}${hint}`;
    }
    updateScrollEffects();
}


// ---------- Project details window ----------

function fillProjectDialog(project) {
    const image = createElement("img");
    image.src = project.image;
    image.alt = localize(project.alt);
    const visual = createElement("div", "dialog-visual");
    visual.append(image);

    const title = createElement("h2", "", localize(project.title));
    title.id = "dialog-title";

    const tags = createElement("div", "project-tech");
    tags.append(...project.tech.map((tech) => createElement("span", "tech-tag", localize(tech))));

    const links = createElement("div", "dialog-actions");
    if (project.github) {
        links.append(createLink("button", `${translate("projects.github")} ↗`, project.github));
    }
    if (project.demo) {
        // Demos open in a new tab so visitors keep their place in the portfolio.
        links.append(createLink("button button-secondary", `${translate("projects.demo")} ↗`, project.demo, true));
    }

    const body = createElement("div", "dialog-body");
    body.append(
        createElement("p", "dialog-category", localize(project.category)),
        title,
        createElement("p", "dialog-description", localize(project.description)),
        tags,
        links
    );
    dialogContent.replaceChildren(visual, body);
}

function openProject(project, card) {
    if (projectDialog.open) return;
    dialogOpener = card;
    fillProjectDialog(project);
    root.classList.add("dialog-open");
    projectDialog.showModal();
    projectDialog.scrollTop = 0;
    if (!reducedMotion.matches) {
        projectDialog.animate(
            [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 220, easing: "ease-out" }
        );
    }
    dialogCloseButton.focus({ preventScroll: true });
}

function closeProject() {
    if (!projectDialog.open) return;
    projectDialog.close();
    root.classList.remove("dialog-open");
    dialogOpener?.focus({ preventScroll: true });
    dialogOpener = null;
}


// ---------- Language and theme ----------

function applyLanguage() {
    root.lang = language === "frCA" ? "fr-CA" : "en";

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = translate(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel));
    });
    document.querySelectorAll(".language-option").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });

    renderAbout();
    renderTimeline("#education-list", portfolioContent.education);
    renderTimeline("#experience-list", portfolioContent.experience);
    renderTimeline("#volunteering-list", portfolioContent.volunteering);
    renderSkills();
    renderFilters();
    renderProjects();
    updateThemeButtons();
    updateMenuLabel();
    updateScrollEffects();
}

function setLanguage(newLanguage) {
    if (!LANGUAGES.includes(newLanguage) || newLanguage === language) return;
    language = newLanguage;
    saveSetting(STORAGE_KEYS.language, language);
    applyLanguage();
}

function toggleTheme() {
    const switchTheme = () => {
        root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
        saveSetting(STORAGE_KEYS.theme, root.dataset.theme);
        updateThemeButtons();
    };

    // Fades the page from one theme to the other (length set in css/style.css).
    // Browsers without view transitions, and visitors with reduced motion on, get an instant switch.
    if (document.startViewTransition && !reducedMotion.matches) {
        document.startViewTransition(switchTheme);
    } else {
        switchTheme();
    }
}

function updateThemeButtons() {
    const isDark = root.dataset.theme === "dark";
    const label = translate(isDark ? "theme.light" : "theme.dark");

    document.querySelectorAll(".theme-toggle").forEach((button) => {
        button.setAttribute("aria-label", label);
        button.title = label;
        button.querySelector(".theme-icon").textContent = isDark ? "☼" : "☾";
    });
}

// The French labels in index.html show before this script runs. Warn when one
// no longer matches js/translations.js, so the two copies don't drift apart.
function checkHtmlLabels() {
    const check = (key, htmlText) => {
        const expected = translate(key, DEFAULT_LANGUAGE);
        if (htmlText !== expected) {
            console.warn(`index.html has "${htmlText}" for ${key}, but js/translations.js has "${expected}".`);
        }
    };
    document.querySelectorAll("[data-i18n]").forEach((element) => check(element.dataset.i18n, element.textContent));
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        check(element.dataset.i18nAriaLabel, element.getAttribute("aria-label"));
    });
}


// ---------- Phone menu ----------

function setMenuOpen(isOpen) {
    mobileNav.hidden = !isOpen;
    menuButton.setAttribute("aria-expanded", String(isOpen));
    updateMenuLabel();
}

function updateMenuLabel() {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.querySelector(".visually-hidden").textContent = translate(isOpen ? "menu.close" : "menu.open");
}


// ---------- Scroll effects ----------

// Sections fade in the first time they scroll into view.
function setUpReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });

    root.classList.add("motion-ready");
    revealElements.forEach((element) => observer.observe(element));
}

// Highlights the nav link of the section that has passed 42% of the window height.
function updateActiveLink() {
    const visibleSections = sections.filter((section) => !section.hidden);
    const marker = window.scrollY + window.innerHeight * 0.42;
    let active = "hero";

    visibleSections.forEach((section) => {
        if (section.getBoundingClientRect().top + window.scrollY <= marker) {
            active = section.dataset.section;
        }
    });

    // At the bottom of the page the last section is active, even if it's too short to reach the marker.
    if (window.scrollY + window.innerHeight >= root.scrollHeight - 4) {
        active = visibleSections.at(-1)?.dataset.section || "hero";
    }

    sectionLinks.forEach((link) => {
        const isActive = link.dataset.sectionLink === active;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}

// The line at the top of the page. The browser's own scrollbar is still there.
function updateProgressBar() {
    const distance = root.scrollHeight - window.innerHeight;
    const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
}

// Runs at most once per frame, however often it's called.
function updateScrollEffects() {
    if (scrollUpdateQueued) return;
    scrollUpdateQueued = true;
    requestAnimationFrame(() => {
        updateActiveLink();
        updateProgressBar();
        scrollUpdateQueued = false;
    });
}


// ---------- Cursor glow ----------
// Only with a mouse, and not when the visitor has reduced motion turned on.

function setUpCursorGlow() {
    if (!window.matchMedia("(pointer: fine)").matches || reducedMotion.matches) return;

    let frame = null;
    let pointerX = 0;
    let pointerY = 0;

    window.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch" || reducedMotion.matches) {
            root.classList.remove("cursor-glow-active");
            return;
        }
        pointerX = event.clientX;
        pointerY = event.clientY;
        root.classList.add("cursor-glow-active");

        if (frame) return;
        frame = requestAnimationFrame(() => {
            root.style.setProperty("--cursor-x", `${pointerX}px`);
            root.style.setProperty("--cursor-y", `${pointerY}px`);
            frame = null;
        });
    }, { passive: true });

    const hideGlow = () => root.classList.remove("cursor-glow-active");
    document.addEventListener("mouseleave", hideGlow);
    window.addEventListener("blur", hideGlow);
}


// ---------- Events and start-up ----------

function setUpEvents() {
    document.querySelectorAll(".language-option").forEach((button) => {
        button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
    document.querySelectorAll(".theme-toggle").forEach((button) => {
        button.addEventListener("click", toggleTheme);
    });

    menuButton.addEventListener("click", () => setMenuOpen(mobileNav.hidden));
    mobileNav.addEventListener("click", (event) => {
        if (event.target.matches("a")) setMenuOpen(false);
    });
    // Close the menu on a click anywhere outside the header, or with Escape.
    document.addEventListener("click", (event) => {
        if (!mobileNav.hidden && !event.target.closest(".mobile-header")) setMenuOpen(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !mobileNav.hidden && !projectDialog.open) {
            setMenuOpen(false);
            menuButton.focus();
        }
    });

    dialogCloseButton.addEventListener("click", closeProject);
    projectDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeProject();
    });
    // A click on the dark area around the window closes it.
    projectDialog.addEventListener("click", (event) => {
        if (event.target === projectDialog) closeProject();
    });

    window.addEventListener("scroll", updateScrollEffects, { passive: true });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) setMenuOpen(false);
        updateScrollEffects();
    }, { passive: true });
    phoneLayout.addEventListener("change", showFilteredProjects);
    new ResizeObserver(updateScrollEffects).observe(document.body);
}

function startSite() {
    checkHtmlLabels();

    const emailLink = document.querySelector("#contact-email");
    emailLink.href = `mailto:${portfolioContent.email}`;
    emailLink.textContent = portfolioContent.email;
    document.querySelector("#current-year").textContent = new Date().getFullYear();
    renderSocialLinks();

    applyLanguage();
    setUpEvents();
    setUpReveal();
    setUpCursorGlow();
    updateScrollEffects();
}

startSite();
