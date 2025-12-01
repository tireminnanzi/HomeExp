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
  console.log('HTML content updated for page:', page);

  // Remove existing page scripts and styles
  const existingScripts = document.querySelectorAll('script[data-page]');
  existingScripts.forEach(script => {
    console.log('Removing existing script:', script.src);
    script.remove();
  });
  const existingStyles = document.querySelectorAll('link[data-page]');
  existingStyles.forEach(style => {
    console.log('Removing existing style:', style.href);
    style.remove();
  });

  // Load page-specific scripts and styles with debug
  if (page === 'upload') {
    console.log('Loading upload page script');
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'src/uploadPage/uploadPage.css'; // Assuming a CSS file exists
    style.dataset.page = 'upload';
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.src = 'src/uploadPage/uploadPage.js';
    script.type = 'module';
    script.dataset.page = 'upload';
    document.body.appendChild(script);
  } else if (page === 'categorize') {
    console.log('Loading categorize page styles and scripts');
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'src/categorizationPage/StyleExpCategorization.css';
    style.dataset.page = 'categorize';
    document.head.appendChild(style);
    console.log('Added StyleExpCategorization.css link:', style.href);

    const expenseScript = document.createElement('script');
    expenseScript.src = 'src/categorizationPage/expenseManager.js';
    expenseScript.type = 'module';
    expenseScript.dataset.page = 'categorize';
    document.body.appendChild(expenseScript);

    expenseScript.onload = () => {
      console.log('expenseManager.js loaded, loading categoriesManager.js');
      const categoriesScript = document.createElement('script');
      categoriesScript.src = 'src/categorizationPage/categoriesManager.js';
      categoriesScript.type = 'module';
      categoriesScript.dataset.page = 'categorize';
      document.body.appendChild(categoriesScript);

      categoriesScript.onload = () => {
        console.log('categoriesManager.js loaded, loading rulesManager.js');
        const rulesScript = document.createElement('script');
        rulesScript.src = 'src/categorizationPage/rulesManager.js';
        rulesScript.type = 'module';
        rulesScript.dataset.page = 'categorize';
        document.body.appendChild(rulesScript);

        rulesScript.onload = () => {
          console.log('rulesManager.js loaded, loading categorizationPage.js');
          const pageScript = document.createElement('script');
          pageScript.src = 'src/categorizationPage/categorizationPage.js';
          pageScript.type = 'module';
          pageScript.dataset.page = 'categorize';
          document.body.appendChild(pageScript);
        };
      };
    };
  } else if (page === 'visualize') {
    console.log('Loading visualize page script');
    const script = document.createElement('script');
    script.src = 'src/visualizationPage/visualizationPage.js';
    script.type = 'module';
    script.dataset.page = 'visualize';
    document.body.appendChild(script);
  }
}

// Load default page
console.log('Initializing with default page: categorize');
loadPage('categorize');