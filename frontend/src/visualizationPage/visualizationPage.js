// src/visualizationPage/visualizationPage.js
console.log('visualizationPage.js loaded');

function renderVisualizationPage() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `
      <div style="padding: 40px; text-align: center; font-size: 28px; color: #333;">
        Visualization Page
        <p style="font-size: 18px; color: #666; margin-top: 20px;">
          Qui vedrai grafici e statistiche delle tue spese
        </p>
      </div>
    `;
  }
}

// Espone la funzione globalmente
window.renderVisualizationPage = renderVisualizationPage;

// Chiamala subito
renderVisualizationPage();