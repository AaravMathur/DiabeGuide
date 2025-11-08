document.addEventListener('DOMContentLoaded', () => {
    const sugarChartCanvas = document.getElementById('sugar-chart');
    if (sugarChartCanvas) {
        const ctx = sugarChartCanvas.getContext('2d');
        const sugarChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sugar Level (mg/dL)',
                    data: [],
                    borderColor: '#0056b3',
                    tension: 0.1
                }]
            }
        });

        async function updateChart() {
            const response = await fetch('/api/tracker');
            const data = await response.json();
            const labels = [];
            const values = [];
            for (const entries of Object.values(data)) {
                entries.forEach(entry => {
                    labels.push(entry.note); // Using note as label for simplicity
                    values.push(entry.sugar_level);
                });
            }
            sugarChart.data.labels = labels;
            sugarChart.data.datasets[0].data = values;
            sugarChart.update();
        }

        updateChart();
    }

    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const response = await fetch('/api/download');
            const data = await response.json();
            const a = document.createElement('a');
            const file = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            a.href = URL.createObjectURL(file);
            a.download = 'diabeguide_data.json';
            a.click();
        });
    }
});
