// =====================================================
// INTERFACE TEXT
// Navigation, headings, buttons and screen-reader labels, in English and French.
// Like in js/content.js, a plain string is used when both languages are the same.
//
// In index.html, data-i18n="nav.about" fills that element with nav.about below,
// and data-i18n-aria-label does the same for its aria-label.
// Those elements also have the English text written in index.html, which shows
// before the script runs and when JavaScript is off. When you change an English
// label here, change it there too (the browser console warns if they differ).
// =====================================================

const translations = {
    skipToContent: { en: "Skip to content", frCA: "Aller au contenu" },
    languageLabel: { en: "Choose language", frCA: "Choisir la langue" },

    menu: {
        open: { en: "Open menu", frCA: "Ouvrir le menu" },
        close: { en: "Close menu", frCA: "Fermer le menu" }
    },

    accessibility: {
        primaryNavigation: { en: "Primary navigation", frCA: "Navigation principale" },
        portfolioSections: { en: "Portfolio sections", frCA: "Sections du portfolio" },
        mobileNavigation: { en: "Mobile navigation", frCA: "Navigation mobile" },
        home: { en: "Harley — home", frCA: "Harley — accueil" }
    },

    nav: {
        about: { en: "About", frCA: "À propos" },
        education: { en: "Education", frCA: "Formation" },
        experience: { en: "Experience", frCA: "Expérience" },
        volunteering: { en: "Volunteering", frCA: "Bénévolat" },
        skills: { en: "Skills", frCA: "Compétences" },
        projects: { en: "Projects", frCA: "Projets" },
        contact: "Contact"
    },

    hero: {
        subtitle: { en: "Web Development · Cybersecurity · Programming · AI", frCA: "Développement Web · Cybersécurité · Programmation · IA" },
        explore: { en: "Explore my work", frCA: "Découvrir mes projets" },
        connect: { en: "Let’s connect", frCA: "Échangeons" },
        scroll: { en: "A little about me", frCA: "Un peu plus sur moi" },
        scrollHint: { en: "SCROLL TO EXPLORE ↓", frCA: "FAITES DÉFILER POUR DÉCOUVRIR ↓" }
    },

    sections: {
        about: { en: "About me", frCA: "À propos de moi" },
        education: { en: "Education", frCA: "Formation" },
        experience: { en: "Experience", frCA: "Expérience" },
        volunteering: { en: "Volunteering", frCA: "Bénévolat" },
        skills: { en: "Skills", frCA: "Compétences" },
        projects: { en: "Selected projects", frCA: "Projets sélectionnés" }
    },

    about: {
        cv: { en: "View résumé", frCA: "Voir mon CV" },
        email: { en: "Email me", frCA: "M’écrire" }
    },

    projects: {
        intro: {
            en: "Things I’ve built, from hand-coded websites to AI-assisted games. Click the project and its demo button to have a go.",
            frCA: "Des projets que j’ai réalisés, des sites codés à la main aux jeux créés avec l’aide de l’IA. Cliquez sur un projet, puis sur son bouton de démo pour l’essayer."
        },
        filterLabel: { en: "Filter projects", frCA: "Filtrer les projets" },
        // Screen-reader label of each card, followed by the project title.
        openLabel: { en: "Open project details for", frCA: "Ouvrir les détails du projet" },
        github: { en: "View GitHub", frCA: "Voir sur GitHub" },
        demo: { en: "Try the demo", frCA: "Essayer la démo" },
        close: { en: "Close project details", frCA: "Fermer les détails du projet" },
        // The line under the filters: "05 projects shown".
        results: { en: "projects shown", frCA: "projets affichés" },
        // Phones only: shown before a filter is picked, then after the count.
        chooseFilter: { en: "Tap a filter to explore projects.", frCA: "Touchez un filtre pour découvrir les projets." },
        collapseHint: { en: "Tap the selected filter again to hide them.", frCA: "Touchez à nouveau le filtre sélectionné pour les masquer." }
    },

    contact: {
        title: { en: "Let’s build something awesome!", frCA: "Créons quelque chose de génial!" },
        body: { en: "Do you need a website or want to work together? Get in touch.", frCA: "Besoin d’un site Web ou envie de collaborer? Écrivez-moi." },
        backToTop: { en: "Back to top ↑", frCA: "Retour en haut ↑" }
    },

    // Tooltip and screen-reader label of the theme button.
    theme: {
        light: { en: "Switch to light mode", frCA: "Passer au thème clair" },
        dark: { en: "Switch to dark mode", frCA: "Passer au thème sombre" }
    }
};
