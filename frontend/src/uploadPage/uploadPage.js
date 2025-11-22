// src/uploadPage/uploadPage.js
console.log('uploadPage.js loaded');

function renderUploadPage() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="upload-container">
      <div id="drop-zone" class="upload-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        
        <h2>Carica il tuo file CSV</h2>
        <p>Trascina il file qui</p>
        <p class="or-text">oppure</p>
        <button id="browse-btn" class="browse-button">Scegli file</button>
        <input type="file" id="file-input" accept=".csv,text/csv" style="display:none">
        
        <div id="file-name" class="file-name"></div>
        <div id="upload-status" class="upload-status"></div>
      </div>
    </div>
  `;

  // === EVENT LISTENERS ===
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const fileNameDisplay = document.getElementById('file-name');
  const status = document.getElementById('upload-status');

  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => e.target.files.length && handleFiles(e.target.files));

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => 
    dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); })
  );

  ['dragenter', 'dragover'].forEach(ev => 
    dropZone.addEventListener(ev, () => dropZone.classList.add('highlight'))
  );

  ['dragleave', 'drop'].forEach(ev => 
    dropZone.addEventListener(ev, () => dropZone.classList.remove('highlight'))
  );

  dropZone.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length) handleFiles(files);
  });

  function handleFiles(files) {
    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.csv')) {
      status.innerHTML = '<p style="color:red">Errore: solo file .csv</p>';
      return;
    }
    fileNameDisplay.textContent = `File selezionato: ${file.name}`;
    status.innerHTML = `<p style="color:green">File pronto: ${file.name}</p>`;
    console.log('File pronto:', file);
  }
}

window.renderUploadPage = renderUploadPage;
renderUploadPage();