// frontend/src/visualizationPage/visualizationPage.js
console.log('visualizationPage.js → avviato (usa window.expensesList)');

let chartInstance = null;

window.renderVisualizationPage = function () {
  console.log('renderVisualizationPage → inizio');

  // Usa le spese già caricate da categorizationPage.js
  const expenses = window.expensesList || [];

  if (!expenses || expenses.length === 0) {
    document.getElementById('main-content').innerHTML = `
      <div style="text-align:center; padding:80px; color:#666; font-size:1.4rem;">
        Nessuna spesa caricata.<br><br>
        Vai su <strong>Categorize</strong> e carica un file CSV.
      </div>`;
    return;
  }

  // === Calcolo totale per mese ===
  const monthlyTotals = {};
  expenses.forEach(exp => {
    if (!exp.date) return;
    const date = new Date(exp.date);
    if (isNaN(date)) return;
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyTotals[yearMonth] = (monthlyTotals[yearMonth] || 0) + Number(exp.amount || 0);
  });

  const sortedMonths = Object.keys(monthlyTotals).sort();
  const labels = sortedMonths.map(key => {
    const [year, month] = key.split('-');
    return new Date(year, month - 1).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
  });

  const data = sortedMonths.map(key => monthlyTotals[key]);

  // === Canvas ===
  const canvas = document.getElementById('monthly-histogram');
  if (!canvas) {
    console.error('Canvas #monthly-histogram non trovato');
    return;
  }

  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Spesa Totale',
        data: data,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `€${ctx.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#e2e8f0' },
          ticks: {
            callback: value => `€${value.toLocaleString('it-IT')}`,
            color: '#475569'
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#475569', font: { size: 13 } }
        }
      },
      animation: {
        duration: 1400,
        easing: 'easeOutQuart'
      }
    }
  });

  console.log(`Grafico creato: ${data.length} mesi, totale €${data.reduce((a,b)=>a+b,0).toFixed(2)}`);
};

// Carica Chart.js solo se non c'è
if (typeof Chart === 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = () => window.renderVisualizationPage();
  script.onerror = () => console.error('Chart.js non caricato');
  document.head.appendChild(script);
} else {
  window.renderVisualizationPage();
}