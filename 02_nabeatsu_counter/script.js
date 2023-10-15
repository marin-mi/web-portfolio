let count = 0;
let ahoCount = 0;
let notAhoCount = 0;

function isAhoNumber(number) {
    // 数字が3の倍数、もしくは数字に3が含まれる場合、trueを返す
    return number % 3 === 0 || number.toString().includes('3');
}

function incrementCounter() {
    count++;
    document.getElementById('counter').innerText = count;

    // アホの条件をチェックし、ナベアツさんの表情を変更
    if (isAhoNumber(count)) {
        document.getElementById('nabeatsuFace').src = "img/aho_face.jpg";
        ahoCount++;
    } else {
        document.getElementById('nabeatsuFace').src = "img/normal_face.jpg";
        notAhoCount++;
    }
    updateChart();
}

// グラフの初期化
const ctx = document.getElementById('ahoChart').getContext('2d');
const ahoChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['アホ', 'アホじゃない'],
        datasets: [{
            data: [ahoCount, notAhoCount],
            backgroundColor: ['red', 'green'],
        }]
    },
    options: {
        responsive: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map(function(label, i) {
                                const total = data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                                const value = data.datasets[0].data[i];
                                const percentage = total !== 0 ? (value / total * 100).toFixed(2) + '%' : '0%';
                                return {
                                    text: label + ": " + percentage,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    index: i
                                };
                            });
                        } else {
                            return [];
                        }
                    }
                }
            }
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    const total = data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                    const value = data.datasets[0].data[tooltipItem.index];
                    const percentage = total !== 0 ? (value / total * 100).toFixed(2) + '%' : '0%';
                    return data.labels[tooltipItem.index] + ": " + value + " (" + percentage + ")";
                }
            }
        }
    }
});

function updateChart() {
    ahoChart.data.datasets[0].data = [ahoCount, notAhoCount];
    ahoChart.update();
}
