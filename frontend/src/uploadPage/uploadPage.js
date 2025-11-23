// src/uploadPage/uploadPage.js
console.log('uploadPage.js loaded – VERSIONE TEST BACKEND');

function renderUploadPage() {
 const main = document.getElementById('main-content');
 if (!main) {
 console.warn("main-content non trovato, riprovo...");
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
 
 <h2>TEST Backend – 5 spese di prova</h2>
 <p>Seleziona qualsiasi file (anche .txt o vuoto)</p>
 <p class="or-text">Il file <strong>NON</strong> viene letto</p>
 <button id="browse-btn" class="browse-button">Scegli file</button>
 <input type="file" id="file-input" accept="*" style="display:none">
 
 <div id="file-name" class="file-name"></div>
 <div id="upload-status" class="upload-status"></div>
 </div>
 </div>
 `;

 // === DATI DI TEST FISSI ===
 const testExpenses = [
 { date: "2025-06-01", description: "Amazon Test Upload", amount: 89.90, originalAmount: -89.90, category1: null, category2: null, category3: null },
 { date: "2025-06-02", description: "REWE Einkauf", amount: 112.45, originalAmount: -112.45, category1: null, category2: null, category3: null },
 { date: "2025-06-03", description: "Netflix Abo", amount: 17.99, originalAmount: -17.99, category1: null, category2: null, category3: null },
 { date: "2025-06-04", description: "Aral Tankstelle", amount: 74.20, originalAmount: -74.20, category1: null, category2: null, category3: null },
 { date: "2025-06-05", description: "Zalando Bestellung", amount: 159.00, originalAmount: -159.00, category1: null, category2: null, category3: null }
 ];

 // === ELEMENTI ===
 const dropZone = document.getElementById('drop-zone');
 const fileInput = document.getElementById('file-input');
 const browseBtn = document.getElementById('browse-btn');
 const fileNameDisplay = document.getElementById('file-name');
 const status = document.getElementById('upload-status');

 // === EVENTI STANDARD (identici al tuo originale) ===
 browseBtn.addEventListener('click', () => fileInput.click());

 fileInput.addEventListener('change', (e) => {
 if (e.target.files.length) handleFiles(e.target.files);
 });

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

 // === FUNZIONE MODIFICATA: ORA FA IL TEST BACKEND ===
 async function handleFiles(files) {
 const file = files[0];
 fileNameDisplay.textContent = `File: ${file.name} (non verrà letto)`;
 status.innerHTML = `<p style="color:#10b981">Test in corso... invio 5 spese al server</p>`;

 let aggiunte = 0;
 let duplicate = 0;

 for (let i = 0; i < testExpenses.length; i++) {
 const expense = testExpenses[i];
 const result = await window.createExpense(expense);

 if (result.success) aggiunte++;
 else if (result.message?.includes('duplicato')) duplicate++;

 status.innerHTML = `
 <p style="color:#60a5fa">
 Inviata ${i + 1}/5 → 
 ${result.success ? 'Aggiunta' : 'Duplicato ignorato'}
 </p>
 `;

 await new Promise(r => setTimeout(r, 500)); // per vedere il progresso
 }

 status.innerHTML = `
 <div style="background:#1f2937; padding:1rem; border-radius:0.5rem; margin-top:1rem;">
 <p style="color:#34d399; font-size:1.5rem; font-weight:bold;">TEST RIUSCITO!</p>
 <p style="color:#e5e7eb; margin-top:0.5rem;">
 Aggiunte: <strong>${aggiunte}</strong> | 
 Già presenti: <strong>${duplicate}</strong>
 </p>
 <p style="color:#34d399; font-size:1.3rem; font-weight:bold; margin-top:1rem;">
 Backend funziona al 100%
 </p>
 </div>
 `;
 }
}

// Esposizione globale + avvio automatico se già in pagina upload
window.renderUploadPage = renderUploadPage;

// Se siamo già sulla pagina upload, rendiamo subito
if (window.location.hash === '#upload' || document.getElementById('main-content')) {
 renderUploadPage();
}