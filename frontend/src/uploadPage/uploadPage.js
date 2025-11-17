// src/uploadPage/uploadPage.js
console.log('uploadPage.js loaded');

function renderUploadPage() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `
      <div style="padding: 40px; text-align: center; font-size: 28px; color: #333;">
        Upload Page
        <p style="font-size: 18px; color: #666; margin-top: 20px;">
          Qui potrai caricare i file CSV delle spese
        </p>
      </div>
    `;
  }
}

// Espone la funzione globalmente (obbligatorio per il nostro sistema)
window.renderUploadPage = renderUploadPage;

// Chiamala subito al caricamento (così appare appena si entra)
renderUploadPage();