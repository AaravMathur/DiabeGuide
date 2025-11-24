document.addEventListener('DOMContentLoaded', () => {
    const logBtn = document.getElementById('log-btn');
    const trackerLog = document.getElementById('tracker-log');

    async function updateTrackerLog() {
        if (!trackerLog) return;
        const response = await fetch('/api/tracker');
        const data = await response.json();
        trackerLog.innerHTML = '';
        for (const [monthYear, entries] of Object.entries(data)) {
            const monthDiv = document.createElement('div');
            monthDiv.innerHTML = `<h3>${monthYear}</h3>`;
            entries.forEach(entry => {
                monthDiv.innerHTML += `<p><b>Sugar:</b> ${entry.sugar_level} mg/dL - <b>Note:</b> ${entry.note}</p>`;
            });
            trackerLog.appendChild(monthDiv);
        }
    }

    if (logBtn) {
        logBtn.addEventListener('click', async () => {
            const sugarInput = document.getElementById('sugar-input');
            const noteInput = document.getElementById('note-input');
            const monthYearInput = document.getElementById('month-year-input');
            const [year, month] = monthYearInput.value.split('-');

            const response = await fetch('/api/tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sugar_level: sugarInput.value, 
                    note: noteInput.value, 
                    month, 
                    year 
                })
            });
            const result = await response.json();
            if (result.success) {
                updateTrackerLog();
            }
        });
    }

    if (trackerLog) {
        updateTrackerLog();
    }

    const clearBtn = document.getElementById('clear-data-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            const response = await fetch('/api/tracker/clear', {
                method: 'POST',
            });
            const result = await response.json();
            if (result.success) {
                updateTrackerLog();
            }
        });
    }
});
