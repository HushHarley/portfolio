// =====================================================
// PERSONAL PORTFOLIO CONTENT
// Edit this section to update the website.
// Personal content is preserved from the original. Projects marked isConcept are sample concepts.
// Use { en: "...", frCA: "..." } for content that needs translation.
// =====================================================

const portfolioContent = {
    name: "Harley",

    subtitle: {
        en: "Web Development · Cybersecurity · Programming · AI",
        frCA: "Développement Web · Cybersécurité · Programmation · IA"
    },

    about: [
        {
            en: "I’m a curious builder interested in the places where thoughtful design, secure systems, and useful technology meet.",
            frCA: "Je suis une personne curieuse qui aime créer à la rencontre du design réfléchi, des systèmes sécurisés et des technologies utiles."
        },
        {
            en: "My interests include web development, cybersecurity, programming, and artificial intelligence. I enjoy learning how things work, then turning that understanding into clear and dependable digital experiences.",
            frCA: "Mes champs d’intérêt comprennent le développement Web, la cybersécurité, la programmation et l’intelligence artificielle. J’aime comprendre le fonctionnement des choses, puis transformer ces connaissances en expériences numériques claires et fiables."
        }
    ],

    cvUrl: "assets/Harley-Rankin-CV.docx",

    // Contact details from the original portfolio.
    email: "hrank63@gmail.com",
    socialLinks: [
        { name: "GitHub", url: "https://github.com/HushHarley" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/harley-rankin-aa9944412/" },
       //{ name: "CodePen", url: "https://codepen.io/your-username" }
    ],

    // Dates are preserved from the current portfolio; edit here when needed.
    education: [
        {
            institution: {
                en: "CyberCap, Montréal, QC",
                frCA: "CyberCap, Montréal, QC"
            },
            program: {
                en: "Practical training in web development, cybersecurity and AI",
                frCA: "Formation pratique en développement Web, cybersécurité et IA"
            },
            dates: "2024 — 2027",
            description: {
                en: "Front-end websites and interactive interfaces. Installation and configuration of Linux servers and Proxmox virtual environments. Network configuration with IP, DNS and NAT.",
                frCA: "Conception front-end de sites Web et intégration d’interfaces interactives. Installation et configuration de serveurs sous Linux ainsi que d’environnements virtualisés (Proxmox). Configuration de réseaux (IP, DNS, NAT)."
            }
        },
        {
            institution: {
                en: "Lasalle Community Comprehensive High School, Montréal, QC",
                frCA: "Lasalle Community Comprehensive High School, Montréal, QC"
            },
            program: {
                en: "High school diploma (DES)",
                frCA: "Diplôme d’études secondaires (DES)"
            },
            dates: { en: "June 2024", frCA: "Juin 2024" },
            description: {
                en: "Honour roll recognition for an overall average of 80%, and an excellence scholarship from the Caisse Desjardins de l’éducation.",
                frCA: "Inscription au tableau d’honneur pour une moyenne générale de 80 % et obtention d’une bourse d’excellence de la Caisse Desjardins de l’éducation."
            }
        }
    ],

    // Experience. Responsibilities are optional.
    experience: [
        {
            position: {
                en: "Part Time Crew Member",
                frCA: "Équipier à temps partiel"
            },
            organization: {
                en: "McDonalds, Montréal, QC",
                frCA: "McDonalds, Montréal, QC"
            },
            dates: { en: "Sept 2026 — Oct 2026", frCA: "Sept. 2026 — Oct. 2026" },
            description: {
                en: "Customer service, teamwork and prioritization in a fast-paced environment.",
                frCA: "Service à la clientèle, travail d’équipe et gestion des priorités dans un environnement dynamique."
            },
            responsibilities: [
                {
                    en: "Welcomed customers and responded to their needs in a busy environment.",
                    frCA: "Accueillir les clients et répondre à leurs besoins dans un environnement dynamique."
                },
                {
                    en: "Worked with the team to follow procedures and quality standards.",
                    frCA: "Collaborer avec l’équipe pour respecter les procédures et les normes de qualité."
                },
                {
                    en: "Prioritized in-store, mobile and delivery orders simultaneously.",
                    frCA: "Gérer simultanément les commandes sur place, mobiles et de livraison en établissant des priorités."
                },
                {
                    en: "Checked order accuracy and quickly resolved unexpected issues.",
                    frCA: "Vérifier l’exactitude des commandes et résoudre rapidement les imprévus."
                }
            ]
        },
        {
            position: {
                en: "Volunteer",
                frCA: "Bénévole"
            },
            organization: {
                en: "Council for Black Aging Community of Montreal (CBAC)",
                frCA: "Council for Black Aging Community of Montreal (CBAC)"
            },
            dates: { en: "Dec 2025 — Feb 2026", frCA: "Déc. 2025 — Févr. 2026" },
            description: {
                en: "Social activities and meal preparation for senior members of the organization.",
                frCA: "Activités sociales et préparation de repas pour les personnes âgées membres de l’organisme."
            },
            responsibilities: [
                {
                    en: "Spent time socializing with seniors.",
                    frCA: "Passer du temps à échanger avec les personnes âgées."
                },
                {
                    en: "Prepared meals for seniors.",
                    frCA: "Préparer des repas pour les personnes âgées."
                }
            ]
        }
    ],

    // Skill groups. No percentages are used.
    skills: [
        {
            name: { en: "Web Development", frCA: "Développement Web" },
            items: ["HTML", "CSS", "JavaScript", { en: "Responsive Design", frCA: "Conception adaptative" }, { en: "Accessibility", frCA: "Accessibilité" }]
        },
        {
            name: { en: "Programming", frCA: "Programmation" },
            items: ["Python", "Java", "Git", { en: "REST APIs", frCA: "API REST" }, { en: "Problem Solving", frCA: "Résolution de problèmes" }]
        },
        {
            name: { en: "Cybersecurity", frCA: "Cybersécurité" },
            items: [{ en: "Network Fundamentals", frCA: "Notions de base en réseautique" }, "Linux", "OWASP", { en: "Threat Analysis", frCA: "Analyse des menaces" }, { en: "Secure Coding", frCA: "Programmation sécurisée" }]
        },
        {
            name: { en: "Artificial Intelligence", frCA: "Intelligence artificielle" },
            items: [{ en: "Prompt Design", frCA: "Conception de requêtes" }, { en: "AI APIs", frCA: "API d’IA" }, { en: "Machine Learning Basics", frCA: "Notions de base en apprentissage automatique" }, { en: "Responsible AI", frCA: "IA responsable" }]
        }
    ],

    // Add a filter here, then use its id in a project's categories array.
    projectFilters: [
        { id: "all", label: { en: "All", frCA: "Tous" } },
        { id: "html-css", label: { en: "HTML / CSS", frCA: "HTML / CSS" } },
        { id: "javascript", label: { en: "JavaScript", frCA: "JavaScript" } },
        { id: "react", label: { en: "React", frCA: "React" } },
        { id: "other", label: { en: "Other", frCA: "Autres" } }
    ],

    // Existing sample concepts. Set isConcept to false for a real published project.
    // Replace image paths with your own local images when ready.
    projects: [
        {
            id: "calm-commerce",
            isConcept: true,
            title: {
                en: "Calm Commerce",
                frCA: "Commerce calme"
            },
            summary: {
                en: "A refined storefront concept focused on clear browsing and a frictionless checkout flow.",
                frCA: "Un concept de boutique épuré axé sur une navigation claire et un processus de paiement fluide."
            },
            description: {
                en: "An interface concept for a calm shopping experience, from browsing products to checkout. The preview explores clear product hierarchy, generous spacing and a restrained blue palette. This is a sample concept, not a published store.",
                frCA: "Un concept d’interface pour une expérience d’achat sereine, de la découverte des produits au paiement. L’aperçu explore une hiérarchie claire des produits, des espaces généreux et une palette de bleus discrète. Il s’agit d’un exemple de concept, pas d’une boutique en ligne."
            },
            technologies: ["HTML", "CSS", "JavaScript"],
            categories: ["html-css", "javascript"],
            categoryLabel: { en: "Web experience", frCA: "Expérience Web" },
            github: "https://github.com/your-username/calm-commerce",
            demo: "https://example.com",
            image: "assets/images/project-commerce.svg",
            alt: {
                en: "Abstract placeholder preview for the Calm Commerce project",
                frCA: "Aperçu fictif abstrait du projet Commerce calme"
            }
        },
        {
            id: "secure-notes",
            isConcept: true,
            title: {
                en: "Secure Notes",
                frCA: "Notes sécurisées"
            },
            summary: {
                en: "A privacy-minded notes interface with a simple workflow and thoughtful security cues.",
                frCA: "Une interface de prise de notes axée sur la confidentialité, avec un parcours simple et des repères de sécurité bien pensés."
            },
            description: {
                en: "A notes interface concept centered on a simple workflow and clear privacy cues. The preview pairs a compact navigation panel with a focused writing area. It illustrates an interface direction, not a deployed or security-audited product.",
                frCA: "Un concept d’interface de prise de notes axé sur un parcours simple et des repères de confidentialité clairs. L’aperçu combine un panneau de navigation compact et un espace consacré à la rédaction. Il illustre une orientation pour l’interface, pas un produit déployé ou ayant fait l’objet d’un audit de sécurité."
            },
            technologies: ["JavaScript", "Web Crypto API", "CSS"],
            categories: ["javascript", "other"],
            categoryLabel: { en: "Security concept", frCA: "Concept de sécurité" },
            github: "https://github.com/your-username/secure-notes",
            demo: "",
            image: "assets/images/project-security.svg",
            alt: {
                en: "Abstract placeholder preview for the Secure Notes project",
                frCA: "Aperçu fictif abstrait du projet Notes sécurisées"
            }
        },
        {
            id: "signal-dashboard",
            isConcept: true,
            title: {
                en: "Signal Dashboard",
                frCA: "Tableau Signal"
            },
            summary: {
                en: "A responsive data dashboard that turns dense information into a calm, readable interface.",
                frCA: "Un tableau de bord adaptatif qui présente des informations denses dans une interface épurée et lisible."
            },
            description: {
                en: "A dashboard concept exploring how dense information can become a calm, readable interface. Summary panels and a prominent chart establish a clear reading order. The illustration uses sample data and is not connected to a live analytics service.",
                frCA: "Un concept de tableau de bord explorant comment présenter des informations denses dans une interface épurée et lisible. Des panneaux de synthèse et un graphique bien en vue établissent un ordre de lecture clair. L’illustration utilise des données fictives et n’est pas reliée à un service d’analyse en temps réel."
            },
            technologies: ["React", "JavaScript", "API"],
            categories: ["react", "javascript"],
            categoryLabel: { en: "Dashboard", frCA: "Tableau de bord" },
            github: "https://github.com/your-username/signal-dashboard",
            demo: "https://example.com",
            image: "assets/images/project-dashboard.svg",
            alt: {
                en: "Abstract placeholder preview for the Signal Dashboard project",
                frCA: "Aperçu fictif abstrait du projet Tableau Signal"
            }
        },
        {
            id: "ai-study-guide",
            isConcept: true,
            title: {
                en: "AI Study Guide",
                frCA: "Guide d’étude IA"
            },
            summary: {
                en: "An AI-assisted study concept built around useful prompts, clear sources, and learner control.",
                frCA: "Un concept d’étude assistée par IA axé sur des requêtes utiles, des sources claires et le contrôle de l’apprenant."
            },
            description: {
                en: "An AI-assisted study interface concept built around useful prompts, clear sources and learner control. The preview explores a focused space for questions and learning material. It is a sample interface, not a connected AI service.",
                frCA: "Un concept d’interface d’étude assistée par IA, axé sur des requêtes utiles, des sources claires et le contrôle de l’apprenant. L’aperçu explore un espace consacré aux questions et au contenu pédagogique. C’est une interface d’exemple, pas un service d’IA connecté."
            },
            technologies: ["JavaScript", { en: "AI API", frCA: "API d’IA" }, "HTML", "CSS"],
            categories: ["javascript", "html-css", "other"],
            categoryLabel: { en: "AI experiment", frCA: "Expérience en IA" },
            github: "https://github.com/your-username/ai-study-guide",
            demo: "",
            image: "assets/images/project-ai.svg",
            alt: {
                en: "Abstract placeholder preview for the AI Study Guide project",
                frCA: "Aperçu fictif abstrait du projet Guide d’étude IA"
            }
        }
    ]
};

// =====================================================
// TRANSLATIONS
// Edit these labels to change interface text or add a language.
// Content-specific translations are stored beside the content above.
// =====================================================

const translations = {
    en: {
        skipToContent: "Skip to content",
        languageLabel: "Choose language",
        menuLabel: "Open menu",
        closeMenuLabel: "Close menu",
        accessibility: {
            primaryNavigation: "Primary navigation",
            portfolioSections: "Portfolio sections",
            mobileNavigation: "Mobile navigation",
            home: "Harley — home"
        },
        metaDescription: "Harley's personal portfolio — web development, cybersecurity, programming, and AI.",
        nav: {
            about: "About",
            education: "Education",
            experience: "Experience",
            skills: "Skills",
            projects: "Projects",
            contact: "Contact"
        },
        hero: {
            eyebrow: "portfolio",
            explore: "Explore my work",
            statement: "Curiosity, made tangible.",
            topline: "Learning. Building. Evolving.",
            connect: "Let’s connect",
            scroll: "A little about me",
            scrollHint: "SCROLL TO EXPLORE ↓"
        },
        sections: {
            about: "About me",
            education: "Education",
            experience: "Experience",
            skills: "Skills",
            projects: "Selected projects"
        },
        about: {
            cv: "View résumé",
            email: "Email me"
        },
        projects: {
            intro: "A collection of interface concepts. Explore the ideas, tools and details behind each one.",
            concept: "Concept preview",
            filterLabel: "Filter projects",
            openLabel: "Open project details for",
            github: "View GitHub",
            demo: "View live demo",
            close: "Close project details",
            results: "projects shown",
            chooseFilter: "Tap a filter to explore projects.",
            collapseHint: "Tap the selected filter again to hide them."
        },
        contact: {
            title: "Let’s build something thoughtful.",
            body: "Do you need a website or want to work together? Get in touch.",
            backToTop: "Back to top ↑"
        },
        theme: {
            light: "Switch to light mode",
            dark: "Switch to dark mode"
        }
    },

    frCA: {
        skipToContent: "Aller au contenu",
        languageLabel: "Choisir la langue",
        menuLabel: "Ouvrir le menu",
        closeMenuLabel: "Fermer le menu",
        accessibility: {
            primaryNavigation: "Navigation principale",
            portfolioSections: "Sections du portfolio",
            mobileNavigation: "Navigation mobile",
            home: "Harley — accueil"
        },
        metaDescription: "Le portfolio personnel de Harley — développement Web, cybersécurité, programmation et IA.",
        nav: {
            about: "À propos",
            education: "Formation",
            experience: "Expérience",
            skills: "Compétences",
            projects: "Projets",
            contact: "Contact"
        },
        hero: {
            eyebrow: "Portfolio",
            explore: "Découvrir mes projets",
            statement: "La curiosité prend forme.",
            topline: "Apprendre. Créer. Évoluer.",
            connect: "Échangeons",
            scroll: "Un peu plus sur moi",
            scrollHint: "FAITES DÉFILER POUR DÉCOUVRIR ↓"
        },
        sections: {
            about: "À propos de moi",
            education: "Formation",
            experience: "Expérience",
            skills: "Compétences",
            projects: "Projets sélectionnés"
        },
        about: {
            cv: "Voir mon CV",
            email: "M’écrire"
        },
        projects: {
            intro: "Une collection de concepts d’interfaces. Découvrez les idées, les outils et les détails de chaque concept.",
            concept: "Aperçu de concept",
            filterLabel: "Filtrer les projets",
            openLabel: "Ouvrir les détails du projet",
            github: "Voir sur GitHub",
            demo: "Voir la démo",
            close: "Fermer les détails du projet",
            results: "projets affichés",
            chooseFilter: "Touchez un filtre pour découvrir les projets.",
            collapseHint: "Touchez à nouveau le filtre sélectionné pour les masquer."
        },
        contact: {
            title: "Créons quelque chose de réfléchi.",
            body: "Besoin d’un site Web ou envie de collaborer? Écrivez-moi.",
            backToTop: "Retour en haut ↑"
        },
        theme: {
            light: "Passer au thème clair",
            dark: "Passer au thème sombre"
        }
    }
};

// =====================================================
// SITE LOGIC
// The sections below read from the content configuration above.
// You should rarely need to edit this part.
// =====================================================

const root = document.documentElement;
const projectDialog = document.querySelector("#project-dialog");
const dialogContent = document.querySelector("#dialog-content");
const closeDialogButton = document.querySelector(".dialog-close");
const mobileMenuButton = document.querySelector(".menu-toggle");
const mobileNavigation = document.querySelector("#mobile-navigation");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileProjects = window.matchMedia("(max-width: 760px)");

let currentLanguage = getStoredValue("portfolio-language", "en");
let currentFilter = "all";
// Mobile starts collapsed; desktop and mobile keep independent selections.
let mobileProjectFilter = null;
let currentProjectOpener = null;
let scrollTicking = false;

if (!translations[currentLanguage]) {
    currentLanguage = "en";
}

function getStoredValue(key, fallback) {
    try {
        return localStorage.getItem(key.replace('portfolio-', 'astra-')) || fallback;
    } catch (error) {
        return fallback;
    }
}

function storeValue(key, value) {
    try {
        localStorage.setItem(key.replace('portfolio-', 'astra-'), value);
    } catch (error) {
        // The site still works if storage is unavailable (for example, strict privacy mode).
    }
}

function localize(value) {
    if (typeof value === "string") {
        return value;
    }

    return value?.[currentLanguage] || value?.en || "";
}

function translate(path) {
    return path.split(".").reduce((value, key) => value?.[key], translations[currentLanguage]) || path;
}

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function createExternalLink(label, url, className = "button") {
    const link = createElement("a", className, label);
    link.href = url;

    if (/^https?:/.test(url)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    }

    return link;
}

function renderAbout() {
    const container = document.querySelector("#about-content");
    container.replaceChildren();

    portfolioContent.about.forEach((paragraph) => {
        container.append(createElement("p", "", localize(paragraph)));
    });

    const buttonRow = createElement("div", "button-row");
    buttonRow.append(
        createExternalLink(translate("about.cv") + " ↗", portfolioContent.cvUrl),
        createExternalLink(translate("about.email") + " ↗", `mailto:${portfolioContent.email}`, "button button-secondary")
    );
    container.append(buttonRow);
}

function renderTimeline(containerId, items, type) {
    const container = document.querySelector(containerId);
    container.replaceChildren();

    items.forEach((item) => {
        const article = createElement("article", "timeline-item");
        const date = createElement("p", "timeline-date", localize(item.dates));
        const details = createElement("div", "timeline-details");
        const title = createElement("h3", "", localize(type === "education" ? item.program : item.position));
        const place = createElement("p", "timeline-place", localize(type === "education" ? item.institution : item.organization));
        const description = createElement("p", "timeline-description", localize(item.description));

        details.append(title, place, description);

        if (item.responsibilities?.length) {
            const list = createElement("ul", "responsibilities");
            item.responsibilities.forEach((responsibility) => {
                list.append(createElement("li", "", localize(responsibility)));
            });
            details.append(list);
        }

        article.append(date, details);
        container.append(article);
    });
}

function renderSkills() {
    const container = document.querySelector("#skills-list");
    container.replaceChildren();

    portfolioContent.skills.forEach((group) => {
        const article = createElement("article", "skill-group");
        const title = createElement("h3", "", localize(group.name));
        const tags = createElement("div", "skill-tags");

        group.items.forEach((skill) => {
            tags.append(createElement("span", "skill-tag", localize(skill)));
        });

        article.append(title, tags);
        container.append(article);
    });
}

function renderProjectFilters() {
    const container = document.querySelector("#project-filters");
    container.replaceChildren();
    container.setAttribute("aria-label", translate("projects.filterLabel"));

    portfolioContent.projectFilters.forEach((filter) => {
        const count = portfolioContent.projects.filter(project => filter.id === 'all' || project.categories.includes(filter.id)).length;
        const button = createElement("button", "filter-button", `${localize(filter.label)} · ${count}`);
        const isActive = filter.id === (mobileProjects.matches ? mobileProjectFilter : currentFilter);
        button.type = "button";
        button.dataset.filter = filter.id;
        button.setAttribute("aria-controls", "projects-grid");
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
        button.addEventListener("click", () => applyProjectFilter(filter.id));
        container.append(button);
    });
}

function createProjectCard(project) {
    const card = createElement("button", "project-card");
    card.type = "button";
    card.dataset.categories = project.categories.join(" ");
    card.dataset.projectId = project.id;
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `${translate("projects.openLabel")} ${localize(project.title)}`);

    const imageWrap = createElement("span", "project-image-wrap");
    const image = createElement("img", "project-image");
    image.src = project.image;
    image.alt = localize(project.alt);
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 1200;
    image.height = 675;
    const category = createElement("span", "project-category", project.isConcept ? translate('projects.concept') : localize(project.categoryLabel));
    imageWrap.append(image, category);

    const body = createElement("span", "project-card-body");
    const title = createElement("span", "project-title", localize(project.title));
    const summary = createElement("span", "project-summary", localize(project.summary));
    const footer = createElement("span", "card-footer");
    const technologies = createElement("span", "project-tech");
    project.technologies.slice(0, 3).forEach((technology) => {
        technologies.append(createElement("span", "tech-tag", localize(technology)));
    });
    const arrow = createElement("span", "card-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    footer.append(technologies, arrow);
    body.append(title, summary, footer);
    card.append(imageWrap, body);

    card.addEventListener("click", () => openProjectDialog(project, card));

    return card;
}

function renderProjects() {
    const container = document.querySelector("#projects-grid");
    container.replaceChildren();
    portfolioContent.projects.forEach((project) => container.append(createProjectCard(project)));
    applyProjectFilter(currentFilter, false);
}

function applyProjectFilter(filterId, fromInteraction = true) {
    if (fromInteraction) {
        if (mobileProjects.matches) {
            mobileProjectFilter = mobileProjectFilter === filterId ? null : filterId;
        } else {
            currentFilter = filterId;
        }
    }
    const activeFilter = mobileProjects.matches ? mobileProjectFilter : currentFilter;
    const cards = document.querySelectorAll(".project-card");
    let visibleCount = 0;

    cards.forEach((card) => {
        const matches = activeFilter !== null &&
            (activeFilter === "all" || card.dataset.categories.split(" ").includes(activeFilter));
        card.hidden = !matches;
        if (matches) visibleCount += 1;
    });

    document.querySelectorAll(".filter-button").forEach((button) => {
        const isActive = button.dataset.filter === activeFilter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    const grid = document.querySelector("#projects-grid");
    grid.hidden = activeFilter === null;
    grid.setAttribute("aria-label", translate("sections.projects"));
    document.querySelector('#filter-status').textContent = activeFilter === null
        ? translate("projects.chooseFilter")
        : `${String(visibleCount).padStart(2, '0')} ${translate("projects.results")}${mobileProjects.matches ? ' · ' + translate("projects.collapseHint") : ''}`;
    updateOnScroll();
}

function buildDialogContent(project) {
    dialogContent.replaceChildren();

    const visual = createElement("div", "dialog-visual");
    const image = createElement("img");
    image.src = project.image;
    image.alt = localize(project.alt);
    visual.append(image);

    const body = createElement("div", "dialog-body");
    const category = createElement("p", "section-number", localize(project.categoryLabel));
    const title = createElement("h2", "", localize(project.title));
    title.id = "dialog-title";
    const description = createElement("p", "dialog-description", localize(project.description));
    const technologies = createElement("div", "project-tech");
    project.technologies.forEach((technology) => {
        technologies.append(createElement("span", "tech-tag", localize(technology)));
    });

    const actions = createElement("div", "dialog-actions");
    if (project.github && !project.github.includes('your-username')) {
        actions.append(createExternalLink(translate("projects.github") + " ↗", project.github));
    }
    if (project.demo && !project.demo.includes('example.com')) {
        actions.append(createExternalLink(translate("projects.demo") + " ↗", project.demo, "button button-secondary"));
    }

    body.append(category, title, description, technologies, actions);
    if (project.isConcept) {
        category.textContent = `${translate('projects.concept')} / ${localize(project.categoryLabel)}`;
    }
    dialogContent.append(visual, body);
}

function openProjectDialog(project, opener) {
    if (projectDialog.open) return;
    currentProjectOpener = opener;
    buildDialogContent(project);
    closeDialogButton.setAttribute("aria-label", translate("projects.close"));
    root.classList.add("dialog-open");
    projectDialog.showModal();
    projectDialog.scrollTop = 0;
    if (!prefersReducedMotion.matches) {
        projectDialog.animate(
            [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 220, easing: "ease-out" }
        );
    }
    closeDialogButton.focus({ preventScroll: true });
}

function closeProjectDialog() {
    if (!projectDialog.open) return;
    projectDialog.close();
    root.classList.remove("dialog-open");
    currentProjectOpener?.focus({ preventScroll: true });
    currentProjectOpener = null;
}

function renderSocialLinks() {
    const container = document.querySelector("#social-links");
    container.replaceChildren();

    portfolioContent.socialLinks.forEach((social) => {
        container.append(createExternalLink(`${social.name} ↗`, social.url, "social-link"));
    });
}

function applyTranslations() {
    root.lang = currentLanguage === "frCA" ? "fr-CA" : "en";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = translate(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel));
    });
    document.querySelector('meta[name="description"]').content = translate("metaDescription");

    document.querySelector("#hero-name").textContent = portfolioContent.name;
    document.querySelector(".hero-subtitle").textContent = localize(portfolioContent.subtitle);
    document.querySelector("#footer-name").textContent = portfolioContent.name;
    document.querySelectorAll(".language-select").forEach((select) => {
        select.value = currentLanguage;
        select.setAttribute("aria-label", translate("languageLabel"));
    });

    renderAbout();
    renderTimeline("#education-list", portfolioContent.education, "education");
    renderTimeline("#experience-list", portfolioContent.experience, "experience");
    renderSkills();
    renderProjectFilters();
    renderProjects();
    renderSocialLinks();
    updateThemeControls();
    updateMenuLabel();
    updateOnScroll();
}

function setLanguage(language) {
    if (!translations[language]) return;
    currentLanguage = language;
    storeValue("portfolio-language", language);
    applyTranslations();
}

function setTheme(theme) {
    root.dataset.theme = theme;
    storeValue("portfolio-theme", theme);
    updateThemeControls();
}

function updateThemeControls() {
    const isDark = root.dataset.theme === "dark";
    const label = isDark ? translate("theme.light") : translate("theme.dark");

    document.querySelectorAll(".theme-toggle").forEach((button) => {
        button.setAttribute("aria-label", label);
        button.title = label;
        button.querySelector(".theme-icon").textContent = isDark ? "☼" : "☾";
    });
}

function toggleMobileMenu(forceOpen) {
    const shouldOpen = forceOpen ?? mobileNavigation.hidden;
    mobileNavigation.hidden = !shouldOpen;
    mobileMenuButton.setAttribute("aria-expanded", String(shouldOpen));
    updateMenuLabel();
}

function updateMenuLabel() {
    const isOpen = mobileMenuButton.getAttribute("aria-expanded") === "true";
    mobileMenuButton.querySelector(".visually-hidden").textContent = translate(isOpen ? "closeMenuLabel" : "menuLabel");
}

function initializeSectionReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0, rootMargin: "0px 0px -32px 0px" }
    );

    root.classList.add('motion-ready');
    revealElements.forEach((element) => observer.observe(element));
}

function updateActiveSection() {
    const sections = [...document.querySelectorAll("[data-section]")].filter(section => !section.hidden);
    const marker = window.scrollY + window.innerHeight * 0.42;
    let activeSection = "hero";

    sections.forEach((section) => {
        if (section.getBoundingClientRect().top + window.scrollY <= marker) {
            activeSection = section.dataset.section;
        }
    });

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        activeSection = sections.at(-1)?.dataset.section || 'hero';
    }

    document.body.dataset.activeSection = activeSection;
    document.querySelectorAll("[data-section-link]").forEach((link) => {
        const isActive = link.dataset.sectionLink === activeSection;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}

// Keep the browser's native scrollbar. This line only communicates progress.
function updateCustomScrollbar() {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    document.querySelector(".scrollbar-progress").style.transform = `scaleX(${progress})`;
}

function updateOnScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        updateActiveSection();
        updateCustomScrollbar();
        scrollTicking = false;
    });
}

function initializeCursorGlow() {
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer || prefersReducedMotion.matches) return;

    let pointerFrame = null;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    window.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch" || prefersReducedMotion.matches) {
            root.classList.remove("cursor-glow-active");
            return;
        }
        pointerX = event.clientX;
        pointerY = event.clientY;
        root.classList.add("cursor-glow-active");

        if (pointerFrame) return;
        pointerFrame = requestAnimationFrame(() => {
            root.style.setProperty("--cursor-x", `${pointerX}px`);
            root.style.setProperty("--cursor-y", `${pointerY}px`);
            pointerFrame = null;
        });
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
        root.classList.remove("cursor-glow-active");
    });

    window.addEventListener("blur", () => {
        root.classList.remove("cursor-glow-active");
    });
}

function initializeEvents() {
    document.querySelectorAll(".language-select").forEach((select) => {
        select.addEventListener("change", (event) => setLanguage(event.target.value));
    });

    document.querySelectorAll(".theme-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            setTheme(root.dataset.theme === "dark" ? "light" : "dark");
        });
    });

    mobileMenuButton.addEventListener("click", () => toggleMobileMenu());

    mobileNavigation.addEventListener("click", (event) => {
        if (event.target.matches("a")) toggleMobileMenu(false);
    });

    document.addEventListener("click", (event) => {
        if (!mobileNavigation.hidden && !event.target.closest(".mobile-header")) {
            toggleMobileMenu(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !mobileNavigation.hidden && !projectDialog.open) {
            toggleMobileMenu(false);
            mobileMenuButton.focus();
        }
    });

    closeDialogButton.addEventListener("click", closeProjectDialog);
    projectDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeProjectDialog();
    });
    projectDialog.addEventListener("click", (event) => {
        if (event.target === projectDialog) closeProjectDialog();
    });

    window.addEventListener("scroll", updateOnScroll, { passive: true });
    mobileProjects.addEventListener("change", () => applyProjectFilter(currentFilter, false));
    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) toggleMobileMenu(false);
        updateOnScroll();
    }, { passive: true });
}

function initializeSite() {
    const storedTheme = getStoredValue("portfolio-theme", "dark");
    root.dataset.theme = storedTheme === "light" ? "light" : "dark";
    document.querySelector("#contact-email").href = `mailto:${portfolioContent.email}`;
    document.querySelector("#contact-email").textContent = portfolioContent.email;
    document.querySelector("#current-year").textContent = new Date().getFullYear();

    applyTranslations();
    initializeEvents();
    initializeSectionReveal();
    new ResizeObserver(updateOnScroll).observe(document.body);
    initializeCursorGlow();
    updateOnScroll();
}

initializeSite();
