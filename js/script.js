/* =========================
   PROJECT DATA
========================= */

const projects = [

    {
        title: "DHCP Server Configuration",

        type: "Networking",

        description:
            "Configured and tested a DHCP server on Ubuntu, including subnet configuration, IP ranges and lease settings.",

        technologies: [
            "Ubuntu",
            "DHCP",
            "Networking"
        ],

        github:
            "https://github.com/YOUR_USERNAME/dhcp-project",

        pdf:
            "assets/projects/dhcp-report.pdf"
    },


    {
        title: "Python OOP Project",

        type: "Programming",

        description:
            "A Python application created while learning object-oriented programming concepts.",

        technologies: [
            "Python",
            "OOP"
        ],

        github:
            "https://github.com/YOUR_USERNAME/python-oop-project",

        pdf:
            "assets/projects/python-oop-report.pdf"
    }

];


/* =========================
   ACHIEVEMENT DATA
========================= */

const achievements = [

    {
        title: "Example Certificate",

        type: "Certificate",

        description:
            "Replace this with your actual certificate or achievement.",

        date: "2026",

        pdf:
            "assets/certificates/certificate-01.pdf"
    },


    {
        title: "Example Achievement",

        type: "Achievement",

        description:
            "Replace this with another achievement.",

        date: "2026",

        pdf:
            "assets/certificates/certificate-02.pdf"
    }

];


/* =========================
   GENERATE PROJECT CARDS
========================= */

const projectContainer =
    document.getElementById("project-container");


projects.forEach(project => {

    const card = document.createElement("article");

    card.className = "project-card";

    card.innerHTML = `

        <span class="card-type">
            ${project.type}
        </span>

        <h3>
            ${project.title}
        </h3>

        <p>
            ${project.description}
        </p>

        <div class="tags">

            ${project.technologies.map(technology => `
                <span class="tag">
                    ${technology}
                </span>
            `).join("")}

        </div>

        <div class="card-buttons">

            <a
                href="${project.github}"
                target="_blank"
                class="card-button"
            >
                GitHub →
            </a>

            <a
                href="${project.pdf}"
                target="_blank"
                class="card-button"
            >
                PDF →
            </a>

        </div>
    `;

    projectContainer.appendChild(card);

});


/* =========================
   GENERATE ACHIEVEMENT CARDS
========================= */

const achievementContainer =
    document.getElementById("achievement-container");


achievements.forEach(achievement => {

    const card = document.createElement("article");

    card.className = "achievement-card";

    card.innerHTML = `

        <span class="card-type">
            ${achievement.type}
        </span>

        <h3>
            ${achievement.title}
        </h3>

        <p>
            ${achievement.description}
        </p>

        <p>
            ${achievement.date}
        </p>

        <div class="card-buttons">

            <a
                href="${achievement.pdf}"
                target="_blank"
                class="card-button"
            >
                View PDF →
            </a>

        </div>
    `;

    achievementContainer.appendChild(card);

});