// src/visualizationPage/visualizationPage.js
console.log('visualizationPage.js loaded');

function renderVisualizationPage() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div style="
      padding: 60px 20px;
      text-align: center;
      font-size: 32px;
      color: #1f2937;
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: bold;
    ">
      Visualization Page<br>
      <span style="font-size: 18px; margin-top: 20px; display: block; opacity: 0.9;">
        Qui vedrai grafici, statistiche e analisi delle tue spese
      </span>
    </div>
  `;
}

// Espone globalmente
window.renderVisualizationPage = renderVisualizationPage;

// Avvia subito (e anche dopo ogni reload)
renderVisualizationPage();