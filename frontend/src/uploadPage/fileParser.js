// frontend/src/uploadPage/fileParser.js
console.log('fileParser.js caricato – versione finale con log e scrittura sicura');

async function parseAndUploadCommerzbankCSV(file) {
  const statusEl = document.getElementById('upload-status');
  if (!statusEl) {
    console.error('Errore: #upload-status non trovato');
    return;
  }

  statusEl.innerHTML = `<p style="color:#60a5fa">Lettura del file ${file.name} in corso...</p>`;

  // Controllo che createExpense esista
  if (typeof window.createExpense !== 'function') {
    console.error('FATAL: window.createExpense non è definito! backendCommunications.js non è stato caricato?');
    statusEl.innerHTML = `<p style="color:#ef4444">Errore: comunicazione con il server non pronta</p>`;
    return;
  }

  try {
    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) throw new Error('File vuoto o senza dati');

    let added = 0;
    let skipped = 0;

    statusEl.innerHTML += `<p style="color:#94a3b8">Trovate ${lines.length - 1} righe – inizio elaborazione...</p>`;

    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split(';');
      const clean = fields.map(f => f.replace(/^"|"$/g, '').trim());

      if (clean.length < 7) continue;

      const rawDate = clean[0];
      const description = (clean[4] || clean[1] || 'Sconosciuto').substring(0, 100);
      const rawAmount = clean[6] || clean[5] || '0';

      if (!rawDate || !rawAmount) continue;

      const [day, month, year] = rawDate.split('.');
      if (!day || !month || !year) continue;

      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const amountStr = rawAmount.replace(/\./g, '').replace(',', '.');
      const amount = parseFloat(amountStr);

      if (isNaN(amount)) continue;

      const expense = {
        date,
        description,
        amount: Math.abs(amount),
        originalAmount: amount,
        category1: null,
        category2: null,
        category3: null
      };

      // LOG CHIARE COME NEL TEST CHE FUNZIONAVA
      console.log(`Spesa estratta [${i}]: ${date} | ${description} | ${amount.toFixed(2)} €`);

      const result = await window.createExpense(expense);

      if (result.success) {
        console.log(`SCRITTA NEL DB con ID: ${result.data?.id || 'OK'}`);
        added++;
      } else if (result.message?.includes('duplicato')) {
        console.log(`DUPLICATO ignorato`);
        skipped++;
      } else {
        console.error(`ERRORE invio:`, result);
      }

      statusEl.innerHTML = `
        <p style="color:#60a5fa">
          Elaborate: ${i}/${lines.length - 1} → 
          Aggiunte: ${added} | Duplicate: ${skipped}
        </p>
      `;
    }

    statusEl.innerHTML = `
      <div style="background:#1f2937;padding:1.5rem;border-radius:0.75rem;margin-top:1rem;">
        <p style="color:#34d399;font-size:1.8rem;font-weight:bold;">Upload completato!</p>
        <p style="color:#e5e7eb;margin-top:0.75rem;">
          Nuove transazioni: <strong>${added}</strong> | 
          Già presenti: <strong>${skipped}</strong>
        </p>
        <p style="color:#34d399;font-size:1.5rem;font-weight:bold;margin-top:1rem;">
          Totale righe elaborate: ${lines.length - 1}
        </p>
      </div>
    `;

    console.log(`FINITO: ${added} aggiunte, ${skipped} duplicate`);
    setTimeout(() => window.loadPage('categorize'), 2500);

  } catch (err) {
    console.error('Errore fatale:', err);
    statusEl.innerHTML = `<p style="color:#ef4444">Errore: ${err.message}</p>`;
  }
}

window.parseAndUploadCommerzbankCSV = parseAndUploadCommerzbankCSV;
console.log('fileParser.js → funzione esposta e pronta');