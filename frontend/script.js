// frontend/script.js
console.log('script.js loaded and starting');

function loadPage(page) {
  console.log('loadPage called for page:', page);
  const root = document.getElementById('root');
  root.innerHTML = `
    <header class="header">
      <div class="header-container">
        <h1 class="header-title">ExpensesHome</h1>
        <nav class="nav">
          <button class="nav-button ${page === 'upload' ? 'nav-button-active' : ''}" onclick="loadPage('upload')">Upload</button>
          <button class="nav-button ${page === 'categorize' ? 'nav-button-active' : ''}" onclick="loadPage('categorize')">Categorize</button>
          <button class="nav-button ${page === 'visualize' ? 'nav-button-active' : ''}" onclick="loadPage('visualize')">Visualize</button>
        </nav>
      </div>
    </header>
    <main class="main-container ${page === 'categorize' ? 'main-container-categorize' : ''}" id="main-content"></main>
  `;

  // Rimuovi script e stili delle pagine precedenti
  document.querySelectorAll('script[data-page]').forEach(s => s.remove());
  document.querySelectorAll('link[data-page]').forEach(l => l.remove());

  // ==================== UPLOAD PAGE ====================
   if (page === 'upload') {
    console.log('Caricamento pagina Upload');

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'src/uploadPage/uploadPage.css';
    style.dataset.page = 'upload';
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.src = 'src/uploadPage/uploadPage.js';
    script.type = 'module';
    script.dataset.page = 'upload';
    document.body.appendChild(script);

    // QUESTO È IL TRUCCHETTO CHE MANCAVA (come in Categorize)
    script.onload = () => {
      if (typeof window.renderUploadPage === 'function') {
        console.log('uploadPage.js caricato → avvio renderUploadPage');
        window.renderUploadPage();
      } else {
        console.error('renderUploadPage non trovata!');
      }
    };

  // ==================== CATEGORIZE PAGE ====================
  } else if (page === 'categorize') {
    console.log('Caricamento pagina Categorize');

    // CSS
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'src/categorizationPage/StyleExpCategorization.css';
    style.dataset.page = 'categorize';
    document.head.appendChild(style);

    // 1. expenseManager
    const expenseScript = document.createElement('script');
    expenseScript.src = 'src/categorizationPage/expenseManager.js';
    expenseScript.type = 'module';
    expenseScript.dataset.page = 'categorize';
    document.body.appendChild(expenseScript);

    expenseScript.onload = () => {
      // 2. categoriesManager
      const categoriesScript = document.createElement('script');
      categoriesScript.src = 'src/categorizationPage/categoriesManager.js';
      categoriesScript.type = 'module';
      categoriesScript.dataset.page = 'categorize';
      document.body.appendChild(categoriesScript);

      categoriesScript.onload = () => {
        // 3. rulesManager
        const rulesScript = document.createElement('script');
        rulesScript.src = 'src/categorizationPage/rulesManager.js';
        rulesScript.type = 'module';
        rulesScript.dataset.page = 'categorize';
        document.body.appendChild(rulesScript);

        rulesScript.onload = () => {
          // 4. categorizationPage.js → poi avvia
          const pageScript = document.createElement('script');
          pageScript.src = 'src/categorizationPage/categorizationPage.js';
          pageScript.type = 'module';
          pageScript.dataset.page = 'categorize';
          document.body.appendChild(pageScript);

          pageScript.onload = () => {
            if (window.initializeCategorization) {
              window.initializeCategorization();
            }
          };
        };
      };
    };

  // ==================== VISUALIZE PAGE ====================
  } else if (page === 'visualize') {
    console.log('→ Caricamento pagina Visualize');

    const script = document.createElement('script');
    script.src = 'src/visualizationPage/visualizationPage.js';
    script.type = 'module';
    script.dataset.page = 'visualize';
    document.body.appendChild(script);

    // ← STESSO TRUCCO DI UPLOAD E CATEGORIZE
    script.onload = () => {
      console.log('visualizationPage.js caricato → avvio render');
      if (typeof window.renderVisualizationPage === 'function') {
        window.renderVisualizationPage();
      } else {
        console.error('window.renderVisualizationPage non trovata!');
      }
    };
  }
}

// Avvio iniziale
loadPage('categorize');

// Rendi loadPage visibile ai pulsanti onclick
window.loadPage = loadPage;