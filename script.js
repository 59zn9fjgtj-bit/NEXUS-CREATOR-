
"use strict";

const STORAGE_KEY = "nexus_creator_v2";

let projects = [];

function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    projects = Array.isArray(parsed)
      ? parsed.filter(p =>
          p &&
          typeof p.name === "string" &&
          typeof p.type === "string" &&
          typeof p.desc === "string"
        )
      : [];
  } catch (error) {
    projects = [];
    alert("Impossible de lire les anciennes données.");
  }

  render();
}

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    alert("Sauvegarde impossible. Vérifie l'espace disponible.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function navigate(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (!target) return;

  target.classList.add("active");

  document.querySelectorAll("nav button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === id
    );
  });
}

function addProject() {
  const name = document.getElementById("projectName").value.trim();
  const type = document.getElementById("projectType").value;
  const desc = document.getElementById("projectDesc").value.trim();

  if (!name) {
    alert("Entre un nom pour ta création.");
    return;
  }

  projects.unshift({
    id: Date.now() + "-" + Math.random().toString(36).slice(2),
    name,
    type,
    desc,
    createdAt: new Date().toISOString()
  });

  if (saveProjects()) {
    document.getElementById("projectName").value = "";
    document.getElementById("projectDesc").value = "";
  }
}

function removeProject(id) {
  if (!confirm("Supprimer cette création ?")) return;

  const previous = projects;
  projects = projects.filter(project => project.id !== id);

  if (!saveProjects()) {
    projects = previous;
    render();
  }
}

function render() {
  document.getElementById("count").textContent = projects.length;

  const container = document.getElementById("projects");

  if (!projects.length) {
    container.innerHTML =
      '<p class="muted">Aucune création pour le moment.</p>';
    return;
  }

  container.innerHTML = projects.map(project => `
    <article class="project">
      <h3>${escapeHTML(project.name)}</h3>
      <span class="muted">${escapeHTML(project.type)}</span>
      <p>${escapeHTML(project.desc)}</p>
      <button class="danger"
        onclick="removeProject(${JSON.stringify(project.id)})">
        Supprimer
      </button>
    </article>
  `).join("");
}

function makeMessage() {
  const client = document.getElementById("client").value.trim();
  const service = document.getElementById("service").value;
  const details = document.getElementById("details").value.trim();

  document.getElementById("result").value =
`Bonjour${client ? " " + client : ""},

Merci pour ton intérêt !

Prestation : ${service}

Détails :
${details || "À préciser ensemble."}

Je te propose de discuter de tes besoins et des conditions
avant de confirmer la prestation.

Bonne journée !`;
}

async function copyMessage() {
  const result = document.getElementById("result");
  const text = result.value;

  if (!text.trim()) {
    alert("Génère d'abord un message.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    alert("Message copié !");
  } catch (error) {
    result.focus();
    result.select();
    alert("Copie manuelle : sélectionne le texte puis Copier.");
  }
}

function exportData() {
  try {
    const blob = new Blob(
      [JSON.stringify(projects, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "nexus-creator-backup.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert("Impossible d'exporter les données.");
  }
}

function clearProjects() {
  if (!confirm("Effacer définitivement toutes tes créations ?")) {
    return;
  }

  const previous = projects;
  projects = [];

  if (!saveProjects()) {
    projects = previous;
    render();
  }
}

loadProjects();
