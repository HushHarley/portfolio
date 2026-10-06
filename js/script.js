// =====================================================
// PERSONAL PORTFOLIO CONTENT
// Edit this section to update the website.
// Personal content is preserved from the original. Set isConcept to true to label a project as a sample concept.
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
            en: "I’m a junior developer from Montréal, trained in web development and cybersecurity at CyberCap. I like to create, whether that’s setting up a Linux server or building a game that runs in the browser. I’m bilingual (English and French) and looking for my first role in tech.",
            frCA: "Je suis développeur junior à Montréal, formé en développement Web et en cybersécurité à CyberCap. J’aime créer, que ce soit en configurant un serveur Linux ou en développant un jeu qui roule dans le navigateur. Je suis bilingue (français et anglais) et je cherche mon premier emploi en technologie."
        }
    ],

    cvUrl: "assets/CvScreenCAP.png",

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
            dates: { en: "Apr 2026 — Oct 2026", frCA: "Avr. 2026 — Oct. 2026" },
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
            dates: { en: "Oct 2025 — Nov 2025", frCA: "Oct. 2025 — Nov. 2025" },
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
        }
    ],

    // Volunteering. One short row per organization.
    volunteering: [
        {
            organization: "Council for Black Aging Community of Montreal (CBAC)",
            location: "Montréal, QC",
            dates: { en: "Dec 2025 — Feb 2026", frCA: "Déc. 2025 — Févr. 2026" },
            description: {
                en: "Spent time socializing with seniors and prepared meals for members of the organization.",
                frCA: "Socialisation et préparation de repas pour les personnes âgées membres de l’organisme."
            }
        },
        {
            organization: "Lasalle Community Comprehensive High School",
            location: "Montréal, QC",
            dates: { en: "June 2024", frCA: "Juin 2024" },
            description: {
                en: "Collected cans for recycling to raise money for the school.",
                frCA: "Recyclage de cannettes afin d’amasser des fonds pour l’école."
            }
        }
    ],

    // Skill groups. No percentages are used.
    skills: [
        {
            name: { en: "Web Development", frCA: "Développement Web" },
            items: ["HTML", "CSS", "JavaScript", { en: "APIs (fetch)", frCA: "API (fetch)" }]
        },
        {
            name: { en: "Server Management", frCA: "Gestion de serveurs" },
            items: [{ en: "Virtualization (Proxmox)", frCA: "Virtualisation (Proxmox)" }, "SSH", { en: "Networking (IP, DNS)", frCA: "Réseaux (IP, DNS)" }]
        },
        {
            name: { en: "Systems & Security", frCA: "Systèmes et sécurité" },
            items: ["Windows", "Linux (Ubuntu)", "Bash"]
        },
        {
            name: { en: "Other Tools", frCA: "Autres outils" },
            items: ["GitHub", "MySQL", { en: "Microsoft Office", frCA: "Suite Microsoft" }]
        }
    ],

    // Add a filter here, then use its id in a project's categories array.
    projectFilters: [
        { id: "all", label: { en: "All", frCA: "Tous" } },
        { id: "html-css", label: { en: "HTML / CSS", frCA: "HTML / CSS" } },
        { id: "javascript", label: { en: "JavaScript", frCA: "JavaScript" } },
        { id: "api", label: { en: "APIs", frCA: "API" } },
        { id: "ai", label: { en: "AI-assisted", frCA: "Assisté par IA" } }
    ],

    // Each demo is a copy of the project stored in the projects/ folder,
    // so it is published on GitHub Pages together with the portfolio.
    // Images are 1200 × 675 screenshots stored in assets/images/.
    projects: [
        {
            id: "afterdark-arcade",
            isConcept: false,
            title: {
                en: "Afterdark Arcade",
                frCA: "Afterdark Arcade"
            },
            summary: {
                en: "A casino-style arcade with Blackjack, Three Card Poker and a Rocket crash game, all played with fictional credits.",
                frCA: "Une arcade de style casino avec le blackjack, le poker à trois cartes et un jeu de fusée, le tout avec des crédits fictifs."
            },
            description: {
                en: "A casino-style arcade I vibe-coded with AI tools in my AI course. It has three games that share one play balance: Blackjack, which pays 3 to 2; Three Card Poker, where the dealer needs a queen-high hand to qualify; and Rocket Run, a crash game where you cash out before the rocket flies away. Each table includes its own rules panel, and the balance can be reset at any time. It is a play-money simulation: the credits have no real-world value.",
                frCA: "Une arcade de style casino que j’ai créée par « vibe coding » avec des outils d’IA dans mon cours d’IA. Elle propose trois jeux qui partagent un même solde : le blackjack, qui paie 3 pour 2; le poker à trois cartes, où le croupier doit avoir au moins une dame haute pour se qualifier; et Rocket Run, un jeu où il faut encaisser ses gains avant que la fusée s’envole. Chaque table a son propre panneau de règles, et le solde peut être réinitialisé en tout temps. Il s’agit d’une simulation avec de l’argent fictif : les crédits n’ont aucune valeur réelle."
            },
            technologies: ["JavaScript", "HTML", "CSS"],
            categories: ["javascript", "ai"],
            categoryLabel: { en: "Casino-style games", frCA: "Jeux de type casino" },
            github: "https://github.com/HushHarley/IA01/tree/main/small%20AI%20tests/test%202%20AFTERDARK%20ARCADE",
            demo: "projects/afterdark-arcade/index.html",
            image: "assets/images/project-afterdark-arcade.webp",
            alt: {
                en: "Afterdark Arcade blackjack table with face-down cards and a 1,000-credit play balance",
                frCA: "Table de blackjack d’Afterdark Arcade avec des cartes face cachée et un solde fictif de 1 000 crédits"
            }
        },
        {
            id: "crystal-labyrinth",
            isConcept: false,
            title: {
                en: "Crystal Labyrinth",
                frCA: "Crystal Labyrinth"
            },
            summary: {
                en: "A top-down crystal-cave adventure: collect shards, avoid enemies and charge the exit before you get caught.",
                frCA: "Une aventure en vue de dessus dans une caverne de cristal : récoltez des éclats, évitez les ennemis et activez la sortie avant de vous faire attraper."
            },
            description: {
                en: "A browser game built with vanilla JavaScript and HTML5 Canvas, with no libraries. Every run generates a new cave network with loops, shortcuts and hidden Focus Chambers. Enemies use line-of-sight AI to wander, chase and search for you, and they coordinate flanking attacks in packs. Shards are your objective, your laser ammunition and your light. Collect 10, then return to the exit to escape. Includes four difficulty levels, three unlockable levels, synthesized sound effects and a reduced-motion option. Built in my AI course as an experiment in AI-assisted development. Best played on a computer: move with WASD or the arrow keys, fire or interact with Space, and pause with Esc.",
                frCA: "Un jeu Web conçu en JavaScript pur et en HTML5 Canvas, sans aucune bibliothèque. Chaque partie génère un nouveau réseau de cavernes avec des boucles, des raccourcis et des chambres secrètes. Les ennemis utilisent une IA basée sur la ligne de vue pour errer, poursuivre et chercher le joueur, et ils se coordonnent en meute pour le prendre à revers. Les éclats servent à la fois d’objectif, de munitions pour le laser et de source de lumière. Récoltez-en 10, puis retournez à la sortie pour vous échapper. Le jeu comprend quatre niveaux de difficulté, trois niveaux à débloquer, des effets sonores synthétisés et une option pour réduire les animations. Réalisé dans mon cours d’IA comme expérience de développement assisté par IA. Idéal sur ordinateur : déplacez-vous avec WASD ou les flèches, tirez ou interagissez avec Espace et mettez le jeu en pause avec Échap."
            },
            technologies: ["JavaScript", "HTML5 Canvas", "Web Audio API", "CSS"],
            categories: ["javascript", "ai"],
            categoryLabel: { en: "Browser game", frCA: "Jeu Web" },
            github: "https://github.com/HushHarley/IA01/tree/main/small%20AI%20tests/test%203",
            demo: "projects/crystal-labyrinth/index.html",
            image: "assets/images/project-crystal-labyrinth.webp",
            alt: {
                en: "Crystal Labyrinth main menu with difficulty and level selection over a glowing crystal cavern",
                frCA: "Menu principal de Crystal Labyrinth avec le choix de la difficulté et du niveau devant une caverne de cristaux lumineux"
            }
        },
        {
            id: "random-joke",
            isConcept: false,
            title: {
                en: "Random Joke Generator",
                frCA: "Générateur de blagues"
            },
            summary: {
                en: "Press HAHA, get a joke: a small page that fetches random jokes from a public API.",
                frCA: "Appuyez sur HAHA pour une blague : une petite page qui récupère des blagues au hasard à partir d’une API publique."
            },
            description: {
                en: "A small project for practising asynchronous JavaScript. Each press of the HAHA button sends a request to JokeAPI with fetch and async/await, with filters that exclude offensive content. The page handles both one-line and two-part jokes, showing the setup and the punchline on separate cards. An independent project from my DEVWEB01 web development course.",
                frCA: "Un petit projet pour pratiquer le JavaScript asynchrone. Chaque clic sur le bouton HAHA envoie une requête à JokeAPI avec fetch et async/await, avec des filtres qui excluent le contenu offensant. La page prend en charge les blagues sur une ligne et les blagues en deux parties, en affichant la question et la chute sur des cartes distinctes. Projet autonome réalisé dans mon cours de développement Web DEVWEB01."
            },
            technologies: ["JavaScript", "Fetch API", "JokeAPI", "HTML", "CSS"],
            categories: ["javascript", "api"],
            categoryLabel: { en: "API project", frCA: "Projet API" },
            github: "https://github.com/HushHarley/Projets-Autonomes-DEVWEB01/tree/main/random%20joke%20api%20website%20(~P3)",
            demo: "projects/random-joke/index.html",
            image: "assets/images/project-random-joke.webp",
            alt: {
                en: "Random joke page with a laughing emoji, the HAHA button and a two-part joke",
                frCA: "Page de blagues avec un émoji qui rit, le bouton HAHA et une blague en deux parties"
            }
        },
        {
            id: "harryhub",
            isConcept: false,
            title: {
                en: "HarryHub",
                frCA: "HarryHub"
            },
            summary: {
                en: "A French-language Harry Potter fan site, with characters and books loaded from a public API.",
                frCA: "Un site de fans de Harry Potter en français, avec des personnages et des livres chargés à partir d’une API publique."
            },
            description: {
                en: "A multi-page fan site about the world of Harry Potter, written in French. The Characters and Books pages fetch their data from a public Harry Potter API and build each card with JavaScript. The site also has a collapsible menu, a Hogwarts Legacy soundtrack playing in the background with a mute button, and a newsletter form with client-side validation. An independent project from my DEVWEB01 web development course.",
                frCA: "Un site de fans de plusieurs pages sur l’univers de Harry Potter. Les pages Personnages et Livres récupèrent leurs données à partir d’une API publique sur Harry Potter et génèrent chaque carte en JavaScript. Le site comprend aussi un menu repliable, la trame sonore de Hogwarts Legacy en arrière-plan avec un bouton pour couper le son, ainsi qu’un formulaire d’abonnement validé côté client. Projet autonome réalisé dans mon cours de développement Web DEVWEB01."
            },
            technologies: ["JavaScript", { en: "REST API", frCA: "API REST" }, "HTML", "CSS"],
            categories: ["html-css", "javascript", "api"],
            categoryLabel: { en: "Fan site", frCA: "Site de fans" },
            github: "https://github.com/HushHarley/Projets-Autonomes-DEVWEB01/tree/main/HarryHub",
            demo: "projects/harryhub/index.html",
            image: "assets/images/project-harryhub.webp",
            alt: {
                en: "HarryHub home page showing Hogwarts castle above a misty valley",
                frCA: "Page d’accueil de HarryHub montrant le château de Poudlard au-dessus d’une vallée brumeuse"
            }
        },
        {
            id: "atelier-boreal",
            isConcept: false,
            title: {
                en: "Atelier Boréal Médias",
                frCA: "Atelier Boréal Médias"
            },
            summary: {
                en: "A showcase website for a fictional Montréal digital studio, built from a wireframe and a content brief.",
                frCA: "Un site vitrine pour un studio numérique montréalais fictif, réalisé à partir d’une maquette et d’un contenu fournis."
            },
            description: {
                en: "My final project for the DEVWEB01 course at CyberCap. Starting from a supplied wireframe and content brief, I built a French-language showcase site for a fictional digital studio. It includes a hero banner, three service cards laid out with CSS Grid, an About section built with Flexbox, a two-by-two team grid and a separate contact page with a form.",
                frCA: "Mon projet synthèse du cours DEVWEB01 à CyberCap. À partir d’une maquette et d’un contenu fournis, j’ai réalisé le site vitrine d’un studio numérique fictif. Il comprend une bannière d’accueil, trois cartes de services disposées avec CSS Grid, une section À propos en Flexbox, une grille d’équipe de deux par deux et une page de contact distincte avec un formulaire."
            },
            technologies: ["HTML", "CSS Grid", "Flexbox"],
            categories: ["html-css"],
            categoryLabel: { en: "Showcase website", frCA: "Site vitrine" },
            github: "https://github.com/HushHarley/portfolio/tree/main/projects/atelier-boreal",
            demo: "projects/atelier-boreal/index.html",
            image: "assets/images/project-atelier-boreal.webp",
            alt: {
                en: "Atelier Boréal Médias home page with a forest landscape banner and the heading Créer. Produire. Connecter.",
                frCA: "Page d’accueil d’Atelier Boréal Médias avec une bannière de paysage forestier et le titre Créer. Produire. Connecter."
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
            volunteering: "Volunteering",
            skills: "Skills",
            projects: "Projects",
            contact: "Contact"
        },
        hero: {
            explore: "Explore my work",
            connect: "Let’s connect",
            scroll: "A little about me",
            scrollHint: "SCROLL TO EXPLORE ↓"
        },
        sections: {
            about: "About me",
            education: "Education",
            experience: "Experience",
            volunteering: "Volunteering",
            skills: "Skills",
            projects: "Selected projects"
        },
        about: {
            cv: "View résumé",
            email: "Email me"
        },
        projects: {
            intro: "Things I’ve built, from hand-coded websites to AI-assisted games. Click the project and its demo button to have a go.",
            concept: "Concept preview",
            filterLabel: "Filter projects",
            openLabel: "Open project details for",
            github: "View GitHub",
            demo: "Try the demo",
            close: "Close project details",
            results: "projects shown",
            chooseFilter: "Tap a filter to explore projects.",
            collapseHint: "Tap the selected filter again to hide them."
        },
        contact: {
            title: "Let’s build something awesome!",
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
            volunteering: "Bénévolat",
            skills: "Compétences",
            projects: "Projets",
            contact: "Contact"
        },
        hero: {
            explore: "Découvrir mes projets",
            connect: "Échangeons",
            scroll: "Un peu plus sur moi",
            scrollHint: "FAITES DÉFILER POUR DÉCOUVRIR ↓"
        },
        sections: {
            about: "À propos de moi",
            education: "Formation",
            experience: "Expérience",
            volunteering: "Bénévolat",
            skills: "Compétences",
            projects: "Projets sélectionnés"
        },
        about: {
            cv: "Voir mon CV",
            email: "M’écrire"
        },
        projects: {
            intro: "Des projets que j’ai réalisés, des sites codés à la main aux jeux créés avec l’aide de l’IA. Cliquez sur un projet, puis sur son bouton de démo pour l’essayer.",
            concept: "Aperçu de concept",
            filterLabel: "Filtrer les projets",
            openLabel: "Ouvrir les détails du projet",
            github: "Voir sur GitHub",
            demo: "Essayer la démo",
            close: "Fermer les détails du projet",
            results: "projets affichés",
            chooseFilter: "Touchez un filtre pour découvrir les projets.",
            collapseHint: "Touchez à nouveau le filtre sélectionné pour les masquer."
        },
        contact: {
            title: "Créons quelque chose de génial!",
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

function createExternalLink(label, url, className = "button", newTab = /^https?:/.test(url)) {
    const link = createElement("a", className, label);
    link.href = url;

    if (newTab) {
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
        createExternalLink(translate("about.cv") + " ↗", portfolioContent.cvUrl, "button", true),
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
        const title = createElement("h3", "", localize({ education: item.program, experience: item.position, volunteering: item.organization }[type]));
        const place = createElement("p", "timeline-place", localize({ education: item.institution, experience: item.organization, volunteering: item.location }[type]));
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
        // Demos open in a new tab so visitors keep their place in the portfolio.
        actions.append(createExternalLink(translate("projects.demo") + " ↗", project.demo, "button button-secondary", true));
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
    renderTimeline("#volunteering-list", portfolioContent.volunteering, "volunteering");
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
