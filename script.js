// Dati per il grafico della media generale (doughnut chart)
const generalAverageData = {
    labels: ['Media Generale', 'Resto'],
    datasets: [{
        label: 'Media Generale',
        data: [7.5, 2.5], // 7.5 is the average, 2.5 to complete the circle to 10
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(211, 211, 211, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(211, 211, 211, 1)'],
        borderWidth: 1
    }]
};

// Configurazione del grafico della media generale (doughnut chart)
const generalAverageConfig = {
    type: 'doughnut',
    data: generalAverageData,
    options: {
        cutout: '70%', // Adjusted to make the circle smaller
        plugins: {
            legend: {
                display: false
            }
        }
    }
};

// Dati per il grafico delle medie delle materie
const subjectAveragesData = {
    labels: ['Matematica', 'Italiano', 'Scienze', 'Storia', 'Geografia'], // Sostituisci con le materie reali
    datasets: [{
        label: 'Average for each subject',
        data: [8, 7, 6.5, 7.5, 8], // Sostituisci con le medie reali
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
    }]
};

// Configurazione del grafico delle medie delle materie
const subjectAveragesConfig = {
    type: 'bar',
    data: subjectAveragesData,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};

// Inizializzazione dei grafici
const generalAverageChart = new Chart(
    document.getElementById('generalAverageChart'),
    generalAverageConfig
);

const subjectAveragesChart1 = new Chart(
    document.getElementById('subjectAveragesChart1'),
    subjectAveragesConfig
);

const Subj = {};
totalGrades = 0;
totalMarksCount = 0;

function loadMarksFromFile(file) {
    const reader = new FileReader();
    const subjListContainer = document.getElementById('subjectList');
    reader.onload = function(event) {
        const marksContainer = document.createElement('li');
        const subjectName = file.name.split('.')[0];
        marksContainer.innerHTML = `
            <div class="subject-container">
                <span class="subject-name">${subjectName}</span>
                <canvas id="${subjectName}Chart" width="30" height="30" style="width: 30px; height: 30px;"></canvas>
            </div>`;
        const marks = event.target.result.split('\n');
        if (Subj[subjectName] == undefined) {
            Subj[subjectName] = [];
        }
        for (const mark of marks) {
            if (mark != '') {
                const markParts = mark.split(';');
                const grade = parseFloat(markParts[0]);
                const date = markParts[1];
                const descr = markParts[2];
                Subj[subjectName].push({ grade, date, descr });
                totalGrades += grade;
                totalMarksCount++;
            }
        }
        marksContainer.setAttribute('data-subject', subjectName);
        marksContainer.addEventListener('click', event => {
            const subject = event.target.closest('li').getAttribute('data-subject');
            const marks = Subj[subject];
            const markslist = event.target.closest('li');
            if (markslist.classList.contains('expanded')) {
                markslist.innerHTML = `
                    <div class="subject-container">
                        <span class="subject-name">${subject}</span>
                        <canvas id="${subject}Chart" width="30" height="30" style="width: 30px; height: 30px;"></canvas>
                    </div>`;
                markslist.classList.remove('expanded');
                createSubjectChart(subject);
            } else {
                markslist.innerHTML = `<span class="subject-name">${subject}</span><br>\n`;
                for (const mark of marks) {
                    markslist.innerHTML += `${mark.grade} - ${mark.date} - ${mark.descr}\n`;
                }
                markslist.classList.add('expanded');
            }
        });
        subjListContainer.appendChild(marksContainer);
        createSubjectChart(subjectName);
        updateGeneralChart();
        updateSubjectAveragesChart();
    };
    reader.readAsText(file);
}

function updateGeneralChart() {
    const overallAverage = totalGrades / totalMarksCount;

    let backgroundColor;
    if (overallAverage >= 6) {
        backgroundColor = 'rgba(75, 192, 192, 0.2)'; // Green
    } else if (overallAverage >= 5) {
        backgroundColor = 'rgba(255, 206, 86, 0.2)'; // Yellow
    } else {
        backgroundColor = 'rgba(255, 99, 132, 0.2)'; // Red
    }

    generalAverageChart.data.datasets[0].data = [overallAverage, 10 - overallAverage];
    generalAverageChart.data.datasets[0].backgroundColor = [backgroundColor, 'rgba(211, 211, 211, 0.2)'];
    generalAverageChart.data.datasets[0].borderColor = [backgroundColor.replace('0.2', '1'), 'rgba(211, 211, 211, 1)'];
    generalAverageChart.update();
}
function updateSubjectAveragesChart() {
    const subjectNames = Object.keys(Subj);
    const subjectAverages = subjectNames.map(subjectName => {
        const marks = Subj[subjectName];
        const totalMarks = marks.length;
        const average = marks.reduce((sum, mark) => sum + parseFloat(mark.grade), 0) / totalMarks;
        return average;
    });

    const backgroundColors = subjectAverages.map(average => {
        if (average >= 6) {
            return 'rgba(75, 192, 192, 0.2)'; // Green
        } else if (average >= 5) {
            return 'rgba(255, 206, 86, 0.2)'; // Yellow
        } else {
            return 'rgba(255, 99, 132, 0.2)'; // Red
        }
    });

    const borderColors = backgroundColors.map(color => color.replace('0.2', '1'));

    subjectAveragesChart1.data.labels = subjectNames;
    subjectAveragesChart1.data.datasets[0].data = subjectAverages;
    subjectAveragesChart1.data.datasets[0].backgroundColor = backgroundColors;
    subjectAveragesChart1.data.datasets[0].borderColor = borderColors;
    subjectAveragesChart1.update();
}

function createSubjectChart(subjectName) {
    const marks = Subj[subjectName];
    const totalMarks = marks.length;
    const average = marks.reduce((sum, mark) => sum + parseFloat(mark.grade), 0) / totalMarks;

    let backgroundColor;
    if (average >= 6) {
        backgroundColor = 'rgba(75, 192, 192, 0.2)'; // Green
    } else if (average >= 5) {
        backgroundColor = 'rgba(255, 206, 86, 0.2)'; // Yellow
    } else {
        backgroundColor = 'rgba(255, 99, 132, 0.2)'; // Red
    }

    const data = {
        labels: ['Average', 'Remaining'],
        datasets: [{
            data: [average, 10 - average],
            backgroundColor: [backgroundColor, 'rgba(211, 211, 211, 0.2)'],
            borderColor: [backgroundColor.replace('0.2', '1'), 'rgba(211, 211, 211, 1)'],
            borderWidth: 1
        }]
    };
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            cutout: '85%',
            plugins: {
                legend: {
                    display: false
                }
            },
            responsive: false,
            maintainAspectRatio: false
        }
    };
    new Chart(document.getElementById(`${subjectName}Chart`), config);
}

document.querySelectorAll('#subjectList li').forEach(item => {
    item.addEventListener('click', event => {
        const subject = event.target.getAttribute('data-subject');
        document.getElementById('directoryInput').click();
    });
});

document.getElementById('loadDirectoryButton').addEventListener('click', () => {
    document.getElementById('directoryInput').click();
});

document.getElementById('directoryInput').addEventListener('change', event => {
    const files = event.target.files;
    for (const file of files) {
        loadMarksFromFile(file);
    }
    
    document.getElementById('loadDirectoryButton').style.display = 'none';
});