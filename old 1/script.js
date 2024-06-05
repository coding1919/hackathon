const userInput = document.getElementById("user-input");
const submitBtn = document.getElementById("submit-btn");
const outputArea = document.getElementById("output-area");
const graphArea = document.getElementById("graph-area");

submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const userInputValue = userInput.value.trim().toLowerCase();
    if (userInputValue) {
        const condition = processUserInput(userInputValue);
        if (condition) {
            const careRecommendations = await provideCareRecommendations(condition);
            if (careRecommendations) {
                outputArea.innerHTML = `
                    <h2>If you have ${condition}.</h2>
                    <h3>Description</h3>
                    <p>${careRecommendations.description}</p>
                    <h3>Care Recommendations</h3>
                    <ul>
                        ${careRecommendations.solutions.map((recommendation, index) => `<li>${recommendation}</li>`).join('')}
                    </ul>
                `;
                graphArea.style.display = 'block'; // Show the graph area
                const graphData = generateGraphData(careRecommendations.solutions);
                drawGraph(graphData);
            } else {
                outputArea.textContent = `No information found for "${condition}".`;
                graphArea.style.display = 'none'; // Hide the graph area
            }
        } else {
            outputArea.textContent = "I didn't understand. Please try again.";
            graphArea.style.display = 'none'; // Hide the graph area
        }
    }
});

function processUserInput(userInputValue) {
    const keywordsToConditions = {
        "diabetes": "Diabetes",
        "high blood pressure": "Hypertension",
        "hypertension": "Hypertension",
        "heart disease": "Heart Disease",
        "cardiovascular": "Heart Disease"
    };
    
    for (const [keyword, condition] of Object.entries(keywordsToConditions)) {
        if (userInputValue.includes(keyword)) {
            return condition;
        }
    }
    return null;
}

async function provideCareRecommendations(condition) {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const disease = data.chronic_diseases.find(disease => disease.name.toLowerCase() === condition.toLowerCase());
        if (disease) {
            return {
                description: disease.description,
                solutions: disease.solutions
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error loading JSON file:', error);
        return null;
    }
}

function generateGraphData(solutions) {
    return solutions.map((solution, index) => {
        return {
            label: solution,
            value: index + 1
        };
    });
}

function drawGraph(graphData) {
    const ctx = graphArea.getContext("2d");
    if (!ctx) {
        console.error("Failed to get graph context");
        return;
    }
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: graphData.map((item) => item.label),
            datasets: [{
                label: "Solutions",
                data: graphData.map((item) => item.value),
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)"
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Load chronic disease data from data.json
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const diseaseNames = data.chronic_diseases.map(disease => disease.name);
        const solutions = data.chronic_diseases.map(disease => disease.solutions);

        const ctx = document.getElementById('diseaseChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: diseaseNames,
                datasets: [
                    {
                        label: 'Solutions',
                        data: solutions.map(solutionList => solutionList.length),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Chronic Disease Solutions'
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });
