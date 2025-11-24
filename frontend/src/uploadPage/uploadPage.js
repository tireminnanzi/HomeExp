// frontend/src/uploadPage/uploadPage.js
console.log('uploadPage.js caricato');

function renderUploadPage() {
  const main = document.getElementById('main-content');
  if (!main) return setTimeout(renderUploadPage, 100);

  main.innerHTML = `
    <div class="upload-container">
      <div id="drop-zone" class="upload-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        
        <h2>Carica il tuo documento qui</h2>
        <p>Trascina il file o clicca per selezionare</p>
        
        <button id="browse-btn" class="browse-button">Scegli file</button>
        <input type="file" id="file-input" accept=".csv,.pdf" style="display:none">
        
        <div id="file-name" class="file-name"></div>
        
        <div id="upload-status" class="upload-status"></div>
        <div class="progress-container" style="margin-top:1rem;">
          <div id="upload-progress" class="progress-bar"></div>
        </div>
      </div>

      <!-- PULSANTE ROSSO CANCELLA TUTTO -->
      <button id="delete-all-btn" class="delete-all-btn">
        Cancella tutti i dati
      </button>
    </div>

    <style>
      .delete-all-btn {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #ef4444;
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: bold;
        font-size: 1rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        z-index: 1000;
        transition: all 0.2s;
      }
      .delete-all-btn:hover {
        background: #dc2626;
        transform: scale(1.05);
      }
      .progress-container {
        width: 100%;
        height: 12px;
        background: #374151;
        border-radius: 6px;
        overflow: hidden;
      }
      .progress-bar {
        height: 100%;
        width: 0%;
        background: #34d399;
        transition: width 0.3s ease;
      }
    </style>
  `;

  // Eventi drag & drop + input
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const fileNameDisplay = document.getElementById('file-name');

  browseBtn.onclick = () => fileInput.click();
  fileInput.onchange = e => e.target.files[0] && handleFile(e.target.files[0]);

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }));
  ['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.add('highlight')));
  ['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('highlight')));
  dropZone.ondrop = e => handleFile(e.dataTransfer.files[0]);

  function handleFile(file) {
    if (!file) return;
    fileNameDisplay.textContent = `File: ${file.name}`;
    window.parseAndUploadCommerzbankCSV(file);
  }

  // PULSANTE CANCELLA TUTTO
  document.getElementById('delete-all-btn').onclick = async () => {
    if (!confirm('Sei sicuro di voler cancellare TUTTE le spese?')) return;

    const statusEl = document.getElementById('upload-status');
    statusEl.innerHTML = `<p style="color:#ef4444">Cancellazione in corso...</p>`;

    const result = await window.deleteAllExpenses();
    if (result.success) {
      statusEl.innerHTML = `<p style="color:#34d399">Tutte le spese sono state cancellate!</p>`;
      setTimeout(() => location.reload(), 2000);
    } else {
      statusEl.innerHTML = `<p style="color:#ef4444">Errore: ${result.message}</p>`;
    }
  };
}

window.renderUploadPage = renderUploadPage;
if (document.getElementById('main-content')) renderUploadPage();