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
                en: "A casino-style arcade I vibe-coded with AI tools in my AI course. It has three games that share one play balance: Blackjack, which pays 3 to 2; Three Card Poker, where the dealer needs a queen-high hand to qualify; and Rocket Run, a crash game where you cash out before the rocket flies away. Each table includes its own rules panel, and the balance can be reset at any time. It is a play-money simulation: the credits have no real-world value.",
                frCA: "Une arcade de style casino que j’ai créée par « vibe coding » avec des outils d’IA dans mon cours d’IA. Elle propose trois jeux qui partagent un même solde : le blackjack, qui paie 3 pour 2; le poker à trois cartes, où le croupier doit avoir au moins une dame haute pour se qualifier; et Rocket Run, un jeu où il faut encaisser ses gains avant que la fusée s’envole. Chaque table a son propre panneau de règles, et le solde peut être réinitialisé en tout temps. Il s’agit d’une simulation avec de l’argent fictif : les crédits n’ont aucune valeur réelle."
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
                en: "A browser game built with vanilla JavaScript and HTML5 Canvas, with no libraries. Every run generates a new cave network with loops, shortcuts and hidden Focus Chambers. Enemies use line-of-sight AI to wander, chase and search for you, and they coordinate flanking attacks in packs. Shards are your objective, your laser ammunition and your light. Collect 10, then return to the exit to escape. Includes four difficulty levels, three unlockable levels, synthesized sound effects and a reduced-motion option. Built in my AI course as an experiment in AI-assisted development. Best played on a computer: move with WASD or the arrow keys, fire or interact with Space, and pause with Esc.",
                frCA: "Un jeu Web conçu en JavaScript pur et en HTML5 Canvas, sans aucune bibliothèque. Chaque partie génère un nouveau réseau de cavernes avec des boucles, des raccourcis et des chambres secrètes. Les ennemis utilisent une IA basée sur la ligne de vue pour errer, poursuivre et chercher le joueur, et ils se coordonnent en meute pour le prendre à revers. Les éclats servent à la fois d’objectif, de munitions pour le laser et de source de lumière. Récoltez-en 10, puis retournez à la sortie pour vous échapper. Le jeu comprend quatre niveaux de difficulté, trois niveaux à débloquer, des effets sonores synthétisés et une option pour réduire les animations. Réalisé dans mon cours d’IA comme expérience de développement assisté par IA. Idéal sur ordinateur : déplacez-vous avec WASD ou les flèches, tirez ou interagissez avec Espace et mettez le jeu en pause avec Échap."
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
                en: "A small project for practising asynchronous JavaScript. Each press of the HAHA button sends a request to JokeAPI with fetch and async/await, with filters that exclude offensive content. The page handles both one-line and two-part jokes, showing the setup and the punchline on separate cards. An independent project from my DEVWEB01 web development course.",
                frCA: "Un petit projet pour pratiquer le JavaScript asynchrone. Chaque clic sur le bouton HAHA envoie une requête à JokeAPI avec fetch et async/await, avec des filtres qui excluent le contenu offensant. La page prend en charge les blagues sur une ligne et les blagues en deux parties, en affichant la question et la chute sur des cartes distinctes. Projet autonome réalisé dans mon cours de développement Web DEVWEB01."
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
                en: "A multi-page fan site about the world of Harry Potter, written in French. The Characters and Books pages fetch their data from a public Harry Potter API and build each card with JavaScript. The site also has a collapsible menu, a Hogwarts Legacy soundtrack playing in the background with a mute button, and a newsletter form with client-side validation. An independent project from my DEVWEB01 web development course.",
                frCA: "Un site de fans de plusieurs pages sur l’univers de Harry Potter. Les pages Personnages et Livres récupèrent leurs données à partir d’une API publique sur Harry Potter et génèrent chaque carte en JavaScript. Le site comprend aussi un menu repliable, la trame sonore de Hogwarts Legacy en arrière-plan avec un bouton pour couper le son, ainsi qu’un formulaire d’abonnement validé côté client. Projet autonome réalisé dans mon cours de développement Web DEVWEB01."
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
                en: "My final project for the DEVWEB01 course at CyberCap. Starting from a supplied wireframe and content brief, I built a French-language showcase site for a fictional digital studio. It includes a hero banner, three service cards laid out with CSS Grid, an About section built with Flexbox, a two-by-two team grid and a separate contact page with a form.",
                frCA: "Mon projet synthèse du cours DEVWEB01 à CyberCap. À partir d’une maquette et d’un contenu fournis, j’ai réalisé le site vitrine d’un studio numérique fictif. Il comprend une bannière d’accueil, trois cartes de services disposées avec CSS Grid, une section À propos en Flexbox, une grille d’équipe de deux par deux et une page de contact distincte avec un formulaire."
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
