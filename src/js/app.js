const ctx = document.getElementById('salesChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        datasets: [{
            label: 'المبيعات',
            data: [1200, 1800, 1400, 2200, 1900, 2700, 2400],
            borderColor: '#12B5C8',
            backgroundColor: 'rgba(18,181,200,0.15)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#12B5C8'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});