function loadPage(page) {
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
    <main class="main-container">
      ${page === 'upload' ? `
        <h2>Upload</h2>
        <div id="upload-space" ondrop="dropHandler(event)" ondragover="dragOverHandler(event)" class="upload-space">
          Drop files here (CSV, PDF AMAZON, PDF ING)
        </div>
        <button id="delete-data" class="delete-button" onclick="window.deleteAllExpenses()">Delete All Data</button>
      ` : page === 'categorize' ? `
        <div class="grid-container">
          <div class="expense-column">
            <h2 class="column-title">Expenses</h2>
            <ul id="expense-list" class="expense-list"></ul>
          </div>
          <div class="category-column">
            <h2 class="column-title">Categories</h2>
            <div id="category-buttons" class="category-buttons"></div>
          </div>
        </div>
      ` : `
        <h2>Visualize</h2>
        <p>Visualization page placeholder</p>
      `}
    </main>
  `;
  // Remove existing page scripts
  const existingScripts = document.querySelectorAll('script[data-page]');
  existingScripts.forEach(script => script.remove());

  // Load page-specific script
  if (page === 'upload') {
    const script = document.createElement('script');
    script.src = 'src/uploadPage/uploadPage.js';
    script.dataset.page = 'upload';
    document.body.appendChild(script);
  } else if (page === 'categorize') {
    const script = document.createElement('script');
    script.src = 'src/categorizationPage/categorizationPage.js';
    script.dataset.page = 'categorize';
    document.body.appendChild(script);
  } else if (page === 'visualize') {
    const script = document.createElement('script');
    script.src = 'src/visualizationPage/visualizationPage.js';
    script.dataset.page = 'visualize';
    document.body.appendChild(script);
  }
}

// Load default page
loadPage('categorize');