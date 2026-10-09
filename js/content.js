// =====================================================
// PORTFOLIO CONTENT
// Everything the page lists about you: the About text, education, experience,
// volunteering, skills, projects and contact links.
//
// Text is either a plain string, when it's the same in both languages:
//     place: "CyberCap, Montréal, QC"
// or an English / French pair:
//     dates: { en: "June 2024", frCA: "Juin 2024" }
//
// Headings, buttons, menu labels and other interface text are in js/translations.js.
// =====================================================

const portfolioContent = {
    // The footer link in index.html has the same address, for visitors without JavaScript.
    email: "hrank63@gmail.com",
    cvUrl: "assets/CvScreenCAP.png",

    socialLinks: [
        { name: "GitHub", url: "https://github.com/HushHarley" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/harley-rankin-aa9944412/" }
    ],

    // One entry per paragraph. The first paragraph is shown in a larger size.
    about: [
        {
            en: "I’m a junior developer from Montréal, trained in web development and cybersecurity at CyberCap. I like to create, whether that’s setting up a Linux server or building a game that runs in the browser. I’m bilingual (English and French) and looking for my first role in tech.",
            frCA: "Je suis développeur junior à Montréal, formé en développement Web et en cybersécurité à CyberCap. J’aime créer, que ce soit en configurant un serveur Linux ou en développant un jeu qui roule dans le navigateur. Je suis bilingue (français et anglais) et je cherche mon premier emploi en technologie."
        }
    ],

    // Education, experience and volunteering all use the same fields.
    // points is an optional bullet list. Entries show in the order written here.
    education: [
        {
            title: {
                en: "Practical training in web development, cybersecurity and AI",
                frCA: "Formation pratique en développement Web, cybersécurité et IA"
            },
            place: "CyberCap, Montréal, QC",
            dates: { en: "Apr 2026 — Oct 2026", frCA: "Avr. 2026 — Oct. 2026" },
            description: {
                en: "Front-end websites and interactive interfaces. Installation and configuration of Linux servers and Proxmox virtual environments. Network configuration with IP, DNS and NAT.",
                frCA: "Conception front-end de sites Web et intégration d’interfaces interactives. Installation et configuration de serveurs sous Linux ainsi que d’environnements virtualisés (Proxmox). Configuration de réseaux (IP, DNS, NAT)."
            }
        },
        {
            title: {
                en: "High school diploma (DES)",
                frCA: "Diplôme d’études secondaires (DES)"
            },
            place: "Lasalle Community Comprehensive High School, Montréal, QC",
            dates: { en: "June 2024", frCA: "Juin 2024" },
            description: {
                en: "Honour roll recognition for an overall average of 80%, and an excellence scholarship from the Caisse Desjardins de l’éducation.",
                frCA: "Inscription au tableau d’honneur pour une moyenne générale de 80 % et obtention d’une bourse d’excellence de la Caisse Desjardins de l’éducation."
            }
        }
    ],

    experience: [
        {
            title: {
                en: "Part Time Crew Member",
                frCA: "Équipier à temps partiel"
            },
            place: "McDonalds, Montréal, QC",
            dates: { en: "Oct 2025 — Nov 2025", frCA: "Oct. 2025 — Nov. 2025" },
            description: {
                en: "Customer service, teamwork and prioritization in a fast-paced environment.",
                frCA: "Service à la clientèle, travail d’équipe et gestion des priorités dans un environnement dynamique."
            },
            points: [
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

    volunteering: [
        {
            title: "Council for Black Aging Community of Montreal (CBAC)",
            place: "Montréal, QC",
            dates: { en: "Dec 2025 — Feb 2026", frCA: "Déc. 2025 — Févr. 2026" },
            description: {
                en: "Spent time socializing with seniors and prepared meals for members of the organization.",
                frCA: "Socialisation et préparation de repas pour les personnes âgées membres de l’organisme."
            }
        },
        {
            title: "Lasalle Community Comprehensive High School",
            place: "Montréal, QC",
            dates: { en: "June 2024", frCA: "Juin 2024" },
            description: {
                en: "Collected cans for recycling to raise money for the school.",
                frCA: "Recyclage de cannettes afin d’amasser des fonds pour l’école."
            }
        }
    ],

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

    // The filter buttons above the projects. A project appears under a filter when
    // the filter's id is in that project's filters list. "all" shows every project.
    filters: [
        { id: "all", label: { en: "All", frCA: "Tous" } },
        { id: "html-css", label: "HTML / CSS" },
        { id: "javascript", label: "JavaScript" },
        { id: "api", label: { en: "APIs", frCA: "API" } },
        { id: "ai", label: { en: "AI-assisted", frCA: "Assisté par IA" } }
    ],

    // Projects show in this order.
    // - category: the label on the screenshot
    // - summary: the text on the card; description: the text in the details window
    // - tech: the card shows the first three, the details window shows them all
    // - image: a 1200 × 675 screenshot in assets/images/
    // - demo: a copy of the project in the projects/ folder, so it's published with
    //   the portfolio. Delete github or demo to hide that button.
    projects: [
        {
            title: "Afterdark Arcade",
            category: { en: "Casino-style games", frCA: "Jeux de type casino" },
            summary: {
                en: "A casino-style arcade with Blackjack, Three Card Poker and a Rocket crash game, all played with fictional credits.",
                frCA: "Une arcade de style casino avec le blackjack, le poker à trois cartes et un jeu de fusée, le tout avec des crédits fictifs."
            },
            description: {
                en: "A casino-style arcade I vibe-coded with AI tools in my AI course. Blackjack, Three Card Poker and Rocket Run, a crash game, share one play balance that can be reset at any time. Each table has its own rules panel. The credits are fictional and have no real value.",
                frCA: "Une arcade de style casino que j’ai créée par « vibe coding » avec des outils d’IA dans mon cours d’IA. Le blackjack, le poker à trois cartes et Rocket Run, un jeu de fusée, partagent un même solde qu’on peut réinitialiser en tout temps. Chaque table a son panneau de règles. Les crédits sont fictifs et n’ont aucune valeur réelle."
            },
            tech: ["JavaScript", "HTML", "CSS"],
            filters: ["javascript", "ai"],
            image: "assets/images/project-afterdark-arcade.webp",
            alt: {
                en: "Afterdark Arcade blackjack table with face-down cards and a 1,000-credit play balance",
                frCA: "Table de blackjack d’Afterdark Arcade avec des cartes face cachée et un solde fictif de 1 000 crédits"
            },
            github: "https://github.com/HushHarley/IA01/tree/main/small%20AI%20tests/test%202%20AFTERDARK%20ARCADE",
            demo: "projects/afterdark-arcade/index.html"
        },
        {
            title: "Crystal Labyrinth",
            category: { en: "Browser game", frCA: "Jeu Web" },
            summary: {
                en: "A top-down crystal-cave adventure: collect shards, avoid enemies and charge the exit before you get caught.",
                frCA: "Une aventure en vue de dessus dans une caverne de cristal : récoltez des éclats, évitez les ennemis et activez la sortie avant de vous faire attraper."
            },
            description: {
                en: "A browser game in vanilla JavaScript and HTML5 Canvas, built in my AI course as an experiment in AI-assisted development. Every run generates a new cave network, and enemies hunt you in packs using line-of-sight AI. Collect 10 shards, which are also your ammo and your light, then reach the exit. Best played on a computer.",
                frCA: "Un jeu Web en JavaScript pur et en HTML5 Canvas, réalisé dans mon cours d’IA comme expérience de développement assisté par IA. Chaque partie génère un nouveau réseau de cavernes, et les ennemis chassent en meute grâce à une IA basée sur la ligne de vue. Récoltez 10 éclats, qui servent aussi de munitions et de lumière, puis rejoignez la sortie. Idéal sur ordinateur."
            },
            tech: ["JavaScript", "HTML5 Canvas", "Web Audio API", "CSS"],
            filters: ["javascript", "ai"],
            image: "assets/images/project-crystal-labyrinth.webp",
            alt: {
                en: "Crystal Labyrinth main menu with difficulty and level selection over a glowing crystal cavern",
                frCA: "Menu principal de Crystal Labyrinth avec le choix de la difficulté et du niveau devant une caverne de cristaux lumineux"
            },
            github: "https://github.com/HushHarley/IA01/tree/main/small%20AI%20tests/test%203",
            demo: "projects/crystal-labyrinth/index.html"
        },
        {
            title: { en: "Random Joke Generator", frCA: "Générateur de blagues" },
            category: { en: "API project", frCA: "Projet API" },
            summary: {
                en: "Press HAHA, get a joke: a small page that fetches random jokes from a public API.",
                frCA: "Appuyez sur HAHA pour une blague : une petite page qui récupère des blagues au hasard à partir d’une API publique."
            },
            description: {
                en: "A small project for practising asynchronous JavaScript, from my DEVWEB01 web development course. The HAHA button fetches a joke from JokeAPI with async/await, filtering out offensive content. Two-part jokes show the setup and the punchline on separate cards.",
                frCA: "Un petit projet pour pratiquer le JavaScript asynchrone, réalisé dans mon cours de développement Web DEVWEB01. Le bouton HAHA récupère une blague de JokeAPI avec async/await en filtrant le contenu offensant. Les blagues en deux parties affichent la question et la chute sur des cartes distinctes."
            },
            tech: ["JavaScript", "Fetch API", "JokeAPI", "HTML", "CSS"],
            filters: ["javascript", "api"],
            image: "assets/images/project-random-joke.webp",
            alt: {
                en: "Random joke page with a laughing emoji, the HAHA button and a two-part joke",
                frCA: "Page de blagues avec un émoji qui rit, le bouton HAHA et une blague en deux parties"
            },
            github: "https://github.com/HushHarley/Projets-Autonomes-DEVWEB01/tree/main/random%20joke%20api%20website%20(~P3)",
            demo: "projects/random-joke/index.html"
        },
        {
            title: "HarryHub",
            category: { en: "Fan site", frCA: "Site de fans" },
            summary: {
                en: "A French-language Harry Potter fan site, with characters and books loaded from a public API.",
                frCA: "Un site de fans de Harry Potter en français, avec des personnages et des livres chargés à partir d’une API publique."
            },
            description: {
                en: "A multi-page Harry Potter fan site in French, from my DEVWEB01 web development course. The Characters and Books pages build their cards with JavaScript from a public API. It also has a collapsible menu, background music with a mute button and a newsletter form with client-side validation.",
                frCA: "Un site de fans de Harry Potter de plusieurs pages, réalisé dans mon cours de développement Web DEVWEB01. Les pages Personnages et Livres génèrent leurs cartes en JavaScript à partir d’une API publique. Le site a aussi un menu repliable, une musique de fond qu’on peut couper et un formulaire d’abonnement validé côté client."
            },
            tech: ["JavaScript", { en: "REST API", frCA: "API REST" }, "HTML", "CSS"],
            filters: ["html-css", "javascript", "api"],
            image: "assets/images/project-harryhub.webp",
            alt: {
                en: "HarryHub home page showing Hogwarts castle above a misty valley",
                frCA: "Page d’accueil de HarryHub montrant le château de Poudlard au-dessus d’une vallée brumeuse"
            },
            github: "https://github.com/HushHarley/Projets-Autonomes-DEVWEB01/tree/main/HarryHub",
            demo: "projects/harryhub/index.html"
        },
        {
            title: "Atelier Boréal Médias",
            category: { en: "Showcase website", frCA: "Site vitrine" },
            summary: {
                en: "A showcase website for a fictional Montréal digital studio, built from a wireframe and a content brief.",
                frCA: "Un site vitrine pour un studio numérique montréalais fictif, réalisé à partir d’une maquette et d’un contenu fournis."
            },
            description: {
                en: "My final project for the DEVWEB01 course at CyberCap: a French-language showcase site for a fictional digital studio, built from a supplied wireframe and content brief. The layouts use CSS Grid and Flexbox, and there's a separate contact page with a form.",
                frCA: "Mon projet synthèse du cours DEVWEB01 à CyberCap : le site vitrine d’un studio numérique fictif, réalisé à partir d’une maquette et d’un contenu fournis. Les mises en page utilisent CSS Grid et Flexbox, avec une page de contact distincte et son formulaire."
            },
            tech: ["HTML", "CSS Grid", "Flexbox"],
            filters: ["html-css"],
            image: "assets/images/project-atelier-boreal.webp",
            alt: {
                en: "Atelier Boréal Médias home page with a forest landscape banner and the heading Créer. Produire. Connecter.",
                frCA: "Page d’accueil d’Atelier Boréal Médias avec une bannière de paysage forestier et le titre Créer. Produire. Connecter."
            },
            github: "https://github.com/HushHarley/portfolio/tree/main/projects/atelier-boreal",
            demo: "projects/atelier-boreal/index.html"
        }
    ]
};
