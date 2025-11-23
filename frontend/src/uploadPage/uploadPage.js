// src/uploadPage/uploadPage.js
console.log('uploadPage.js loaded – versione finale pulita');

function renderUploadPage() {
  const main = document.getElementById('main-content');
  if (!main) {
    console.warn("main-content non trovato");
    setTimeout(renderUploadPage, 100);
    return;
  }

  main.innerHTML = `
    <div class="upload-container">
      <div id="drop-zone" class="upload-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        
        <h2>Carica il tuo estratto conto Commerzbank</h2>
        <p>Trascina il file CSV qui</p>
        <p class="or-text">oppure</p>
        <button id="browse-btn" class="browse-button">Scegli file</button>
        <input type="file" id="file-input" accept=".csv,text/csv" style="display:none">
        
        <div id="file-name" class="file-name"></div>
        <div id="upload-status" class="upload-status"></div>
      </div>
    </div>
  `;

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const fileNameDisplay = document.getElementById('file-name');
  const status = document.getElementById('upload-status');

  browseBtn.onclick = () => fileInput.click();

  fileInput.onchange = (e) => e.target.files.length && handleFile(e.target.files[0]);

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev =>
    dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); })
  );

  ['dragenter', 'dragover'].forEach(ev =>
    dropZone.addEventListener(ev, () => dropZone.classList.add('highlight'))
  );

  ['dragleave', 'drop'].forEach(ev =>
    dropZone.addEventListener(ev, () => dropZone.classList.remove('highlight'))
  );

  dropZone.ondrop = (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      status.innerHTML = '<p style="color:#ef4444">Errore: carica un file .csv</p>';
      return;
    }

    fileNameDisplay.textContent = `File: ${file.name}`;
    status.innerHTML = `<p style="color:#10b981">File valido. Caricamento in corso...</p>`;

    // DELEGA TUTTO A fileParser.js
    window.parseAndUploadCommerzbankCSV(file);
  }
}

window.renderUploadPage = renderUploadPage;

// Auto-render se già sulla pagina
if (document.getElementById('main-content')) renderUploadPage();