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

  // Pulizia script e stili precedenti
  document.querySelectorAll('script[data-page]').forEach(s => s.remove());
  document.querySelectorAll('link[data-page]').forEach(l => l.remove());

  // ==================== UPLOAD ====================
  if (page === 'upload') {
    console.log('Caricamento pagina Upload');

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'src/uploadPage/uploadPage.css';
    style.dataset.page = 'upload';
    document.head.appendChild(style);

    const parserScript = document.createElement('script');
    parserScript.src = 'src/uploadPage/fileParser.js';
    parserScript.type = 'module';
    parserScript.dataset.page = 'upload';
    document.body.appendChild(parserScript);

    parserScript.onload = () => {
      console.log('fileParser.js caricato con successo');
      const script = document.createElement('script');
      script.src = 'src/uploadPage/uploadPage.js';
      script.type = 'module';
      script.dataset.page = 'upload';
      document.body.appendChild(script);

      script.onload = () => {
        console.log('uploadPage.js caricato → avvio renderUploadPage');
        if (typeof window.renderUploadPage === 'function') {
          window.renderUploadPage();
        }
      };
    };

    parserScript.onerror = () => console.error('Impossibile caricare fileParser.js');

  // ==================== CATEGORIZE ====================
  } else if (page === 'categorize') {
    console.log('Caricamento pagina Categorize');

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'src/categorizationPage/StyleExpCategorization.css';
    style.dataset.page = 'categorize';
    document.head.appendChild(style);

    fetch('src/categorizationPage/categorization.html')
      .then(r => r.text())
      .then(html => {
        document.getElementById('main-content').innerHTML = html;
        console.log('categorization.html → CARICATO CORRETTAMENTE');

        const scripts = [
          'src/categorizationPage/expenseManager.js',
          'src/categorizationPage/categoriesManager.js',
          'src/categorizationPage/rulesManager.js',
          'src/categorizationPage/categorizationPage.js'
        ];

        let i = 0;
        function loadNext() {
          if (i >= scripts.length) {
            console.log('Tutti i moduli caricati → avvio initializeCategorization');
            if (window.initializeCategorization) window.initializeCategorization();
            return;
          }
          const s = document.createElement('script');
          s.src = scripts[i++];
          s.type = 'module';
          s.dataset.page = 'categorize';
          s.onload = loadNext;
          s.onerror = () => console.error('Errore caricamento:', s.src);
          document.body.appendChild(s);
        }
        loadNext();
      })
      .catch(err => {
        console.error('Errore caricamento categorization.html:', err);
        document.getElementById('main-content').innerHTML = '<p style="color:red">Errore caricamento HTML</p>';
      });

  // ==================== VISUALIZE ====================
  } else if (page === 'visualize') {
    console.log('Caricamento pagina Visualize');

    fetch('src/visualizationPage/visualization.html')
      .then(r => r.text())
      .then(html => {
        document.getElementById('main-content').innerHTML = html;

        const script = document.createElement('script');
        script.src = 'src/visualizationPage/visualizationPage.js';
        script.type = 'module';
        script.dataset.page = 'visualize';
        document.body.appendChild(script);
      })
      .catch(err => {
        console.error('Errore caricamento visualization.html:', err);
      });
  }
}

// Avvio automatico
loadPage('categorize');
window.loadPage = loadPage;