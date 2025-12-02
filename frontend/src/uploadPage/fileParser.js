// frontend/src/uploadPage/fileParser.js
console.log('fileParser.js caricato – VERSIONE DEFINITIVA (importi con segno negativo)');

async function parseAndUploadCommerzbankCSV(file) {
  const statusEl = document.getElementById('upload-status');
  const progressBar = document.getElementById('upload-progress');
  if (!statusEl) {
    console.error('#upload-status non trovato');
    return;
  }

  statusEl.innerHTML = `<p style="color:#60a5fa">Lettura del file in corso...</p>`;
  if (progressBar) progressBar.style.width = '0%';

  if (typeof window.createExpense !== 'function') {
    statusEl.innerHTML = `<p style="color:#ef4444">Errore: backend non pronto</p>`;
    return;
  }

  try {
    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) throw new Error('Nessuna transazione trovata');

    let added = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const clean = lines[i].split(';').map(f => f.replace(/^"|"$/g, '').trim());
      if (clean.length < 5) continue;

      const rawDate = clean[0];
      const description = (clean[3] || 'Sconosciuto').substring(0, 150);
      const rawAmount = clean[4];

      const [day, month, year] = rawDate.split('.');
      if (!day || !month || !year) continue;

      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const amountStr = rawAmount.replace(/\./g, '').replace(',', '.');
      const amount = parseFloat(amountStr);

      if (isNaN(amount)) continue;

      // OGGETTO ESATTO COME PRIMA (senza originalAmount, con amount negativo)
      const expense = {
        date,
        description: description.trim(),
        amount: amount,  // ← con segno negativo se uscita, positivo se entrata
        category1: null,
        category2: null,
        category3: null
      };

      console.log(`Spesa ${i}: ${date} | ${description} | ${amount > 0 ? '+' : ''}${amount.toFixed(2)} €`);

      const result = await window.createExpense(expense);

      if (result.success) {
        console.log(`Aggiunta → ID: ${result.data.id}`);
        added++;
      } else if (result.message?.includes('duplicato') || result.message?.includes('Duplicate')) {
        console.log(`Duplicato ignorato`);
        skipped++;
      }

      // Aggiornamento UI
      statusEl.innerHTML = `
        <p style="color:#94a3b8;">
          Elaborate: <strong>${i}</strong> / ${lines.length - 1} → 
          Aggiunte: <strong style="color:#34d399">${added}</strong> | 
          Duplicate: <strong style="color:#fbbf24">${skipped}</strong>
        </p>
      `;

      if (progressBar) {
        progressBar.style.width = `${((i) / (lines.length - 1)) * 100}%`;
      }
    }

    statusEl.innerHTML = `
      <div style="background:#1e293b;padding:2rem;border-radius:1rem;border:3px solid #34d399;text-align:center;">
        <h2 style="color:#34d399;margin:0;">Upload completato!</h2>
        <p style="color:#e2e8f0;margin:1rem 0;">
          Nuove: <strong style="color:#34d399">${added}</strong> | 
          Già presenti: <strong style="color:#fbbf24">${skipped}</strong>
        </p>
      </div>
    `;

    setTimeout(() => window.loadPage('categorize'), 3000);

  } catch (err) {
    statusEl.innerHTML = `<p style="color:#ef4444">Errore: ${err.message}</p>`;
  }
}

window.parseAndUploadCommerzbankCSV = parseAndUploadCommerzbankCSV;
console.log('fileParser.js → PRONTO (importi con segno negativo)');