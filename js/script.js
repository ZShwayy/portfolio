"use strict";
// Site-wide theme switch, remembered across page visits.
const themeButton = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  if (themeButton) themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}
let savedTheme = 'light';
try { savedTheme = localStorage.getItem('portfolio-theme') || 'light'; } catch (_) {}
applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
themeButton?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('portfolio-theme', next); } catch (_) {}
});
document.getElementById('year').textContent = new Date().getFullYear();

// Projects are NOT hardcoded in the HTML: fetch JSON, convert to objects and render cards.
const projectsContainer = document.getElementById('projects-container');
if (projectsContainer) {
  const filters = document.getElementById('filter-buttons');
  const count = document.getElementById('project-count');
  const error = document.getElementById('projects-error');
  let allProjects = [];
  let selectedCategory = 'All';
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function renderProjects() {
    projectsContainer.replaceChildren();
    const matching = selectedCategory === 'All' ? allProjects : allProjects.filter(p => p.category === selectedCategory);
    count.textContent = `${matching.length} project${matching.length === 1 ? '' : 's'} shown`;
    matching.forEach((project, index) => {
      const column = element('div','col-md-6 col-xl-4');
      const card = element('article','project-card');
      const top = element('div','project-number');
      top.append(element('span','project-category',project.category),element('span','', '↗'));
      card.append(top,element('h2','',project.title),element('p','',project.description));
      const tags = element('div','tag-cloud mt-auto');
      (project.technologies || []).forEach(tech => tags.append(element('span','',tech)));
      card.append(tags); column.append(card); projectsContainer.append(column);
    });
  }
  function renderFilters() {
    const categories = ['All', ...new Set(allProjects.map(p => p.category))];
    filters.replaceChildren();
    categories.forEach(category => {
      const button = element('button',`btn filter-btn ${category === selectedCategory ? 'active' : ''}`,category === 'All' ? 'All projects' : category);
      button.type = 'button'; button.dataset.filter = category;
      button.setAttribute('aria-pressed',String(category === selectedCategory));
      button.addEventListener('click', () => { selectedCategory = category; renderFilters(); renderProjects(); });
      filters.append(button);
    });
  }
  fetch('data/projects.json')
    .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then(data => { if (!Array.isArray(data)) throw new Error('Expected an array of projects'); allProjects = data; renderFilters(); renderProjects(); })
    .catch(err => { console.error('Project loading failed:',err); projectsContainer.replaceChildren(); count.textContent = 'Projects unavailable'; error.classList.remove('d-none'); });
}
