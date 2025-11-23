// src/fileParser.js
console.log('fileParser.js caricato');

// Parsing specifico per CSV Commerzbank (testato su file reali)
async function parseAndUploadCommerzbankCSV(file) {
  const statusElement = document.getElementById('upload-status');
  if (!statusElement) return;

  statusElement.innerHTML = `<p style="color:#60a5fa">Lettura del file in corso...</p>`;

  try {
    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error('File vuoto o non valido');

    let processed = 0;
    let added = 0;
    let skipped = 0;

    // Salta la riga di intestazione
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const fields = line.split(';');

      // Commerzbank usa virgolette, togliamole
      const clean = fields.map(f => f.replace(/^"|"$/g, '').trim());

      if (clean.length < 7) continue;

      const rawDate = clean[0];           // "15.03.2025"
      const description = clean[4] || clean[1] || 'Sconosciuto';
      const rawAmount = clean[6] || clean[5] || '';

      if (!rawDate || !rawAmount) continue;

      // Data: DD.MM.YYYY → YYYY-MM-DD
      const [day, month, year] = rawDate.split('.');
      if (!day || !month || !year) continue;
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Importo: "1.234,56" o "-567,89" → numero
      const amountStr = rawAmount.replace(/\./g, '').replace(',', '.');
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;

      const expense = {
        date,
        description: description.substring(0, 100),
        amount: Math.abs(amount),           // sempre positivo per il confronto
        originalAmount: amount,             // conserva il segno reale
        category1: null,
        category2: null,
        category3: null
      };

      const result = await window.createExpense(expense);

      if (result.success) added++;
      else if (result.message?.includes('duplicato')) skipped++;

      processed++;
      statusElement.innerHTML = `
        <p style="color:#60a5fa">
          Elaborate: ${processed}/${lines.length - 1} → 
          Aggiunte: ${added} | Duplicate: ${skipped}
        </p>
      `;
    }

    statusElement.innerHTML = `
      <div style="background:#1f2937;padding:1.5rem;border-radius:0.75rem;margin-top:1rem;">
        <p style="color:#34d399;font-size:1.8rem;font-weight:bold;">Caricamento completato!</p>
        <p style="color:#e5e7eb;margin-top:0.75rem;">
          Nuove transazioni: <strong>${added}</strong> | 
          Già presenti: <strong>${skipped}</strong>
        </p>
        <p style="color:#34d399;font-size:1.5rem;font-weight:bold;margin-top:1rem;">
          Tutto pronto per la categorizzazione →
        </p>
      </div>
    `;

    // Vai automaticamente alla pagina di categorizzazione
    setTimeout(() => {
      window.location.hash = '#categorize';
      if (window.renderCategorizationPage) window.renderCategorizationPage();
    }, 2500);

  } catch (err) {
    console.error(err);
    statusElement.innerHTML = `<p style="color:#ef4444">Errore: ${err.message}</p>`;
  }
}

// Esposizione globale
window.parseAndUploadCommerzbankCSV = parseAndUploadCommerzbankCSV;