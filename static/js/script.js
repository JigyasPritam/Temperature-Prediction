document.addEventListener('DOMContentLoaded', function() {
    // Initialize date pickers with today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datepicker').value = today;
    document.getElementById('forecast-datepicker').value = today;
    
    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active tab pane
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
            
            // Load data for specific tabs
            if (tabId === 'metrics-tab') {
                loadMetricsData();
            } else if (tabId === 'forecast-tab') {
                // Clear previous forecast if any
                document.getElementById('forecast-result').classList.add('hidden');
            }
        });
    });
    
    // Prediction Button
    document.getElementById('predict-btn').addEventListener('click', function() {
        const selectedDate = document.getElementById('datepicker').value;
        
        if (!selectedDate) {
            alert('Please select a date');
            return;
        }
        
        // Show loading state
        this.textContent = 'Predicting...';
        this.disabled = true;
        
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: selectedDate }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display results
            document.getElementById('result-date').textContent = formatDate(selectedDate);
            document.getElementById('max-temp').textContent = data.max_temp;
            document.getElementById('min-temp').textContent = data.min_temp;
            document.getElementById('prediction-result').classList.remove('hidden');
        })
        .catch(error => {
            alert('Error: ' + error.message);
        })
        .finally(() => {
            // Reset button
            this.textContent = 'Predict Temperature';
            this.disabled = false;
        });
    });
    
    // Static metrics data
const metricsData = {
    "xgboost": {
        "max_temp": {
            "mse_test": 5.3093,
            "r2_test": 0.6653,
            "mse_train": 4.8636,
            "r2_train": 0.6875
        },
        "min_temp": {
            "mse_test": 2.8202,
            "r2_test": 0.9178,
            "mse_train": 2.3336,
            "r2_train": 0.9300
        }
    },
    "linear_regression": {
        "max_temp": {
            "mse_test": 12.8987,
            "r2_test": 0.1868,
            "mse_train": 12.4703,
            "r2_train": 0.1988
        },
        "min_temp": {
            "mse_test": 27.1496,
            "r2_test": 0.2083,
            "mse_train": 25.9521,
            "r2_train": 0.2211
        }
    },
    "random_forest": {
        "max_temp": {
            "mse_test": 5.1069,
            "r2_test": 0.6780,
            "mse_train": 0.7277,
            "r2_train": 0.9535
        },
        "min_temp": {
            "mse_test": 2.8271,
            "r2_test": 0.9176,
            "mse_train": 0.3982,
            "r2_train": 0.9880
        }
    }
};

// Function to load metrics data (now uses static data)
function loadMetricsData() {
    // Get the currently selected model
    const selectedModel = document.getElementById('model-select').value;
    
    // Use the static data directly
    updateMetricsDisplay(metricsData);
}

// Initialize metrics display when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMetricsData();
});

// Update metrics when model is changed
document.getElementById('model-select').addEventListener('change', function() {
    loadMetricsData();
});

function updateMetricsDisplay(data) {
    const selectedModel = document.getElementById('model-select').value;
    const modelData = data[selectedModel];
    
    // Max temperature metrics
    document.getElementById('max-test-mse').textContent = modelData.max_temp.mse_test.toFixed(4);
    document.getElementById('max-test-r2').textContent = modelData.max_temp.r2_test.toFixed(4);
    document.getElementById('max-train-mse').textContent = modelData.max_temp.mse_train.toFixed(4);
    document.getElementById('max-train-r2').textContent = modelData.max_temp.r2_train.toFixed(4);
    
    // Min temperature metrics
    document.getElementById('min-test-mse').textContent = modelData.min_temp.mse_test.toFixed(4);
    document.getElementById('min-test-r2').textContent = modelData.min_temp.r2_test.toFixed(4);
    document.getElementById('min-train-mse').textContent = modelData.min_temp.mse_train.toFixed(4);
    document.getElementById('min-train-r2').textContent = modelData.min_temp.r2_train.toFixed(4);
    
    // Update chart
    updateMetricsChart(modelData);
}

let metricsChart = null;

function updateMetricsChart(modelData) {
    const ctx = document.getElementById('metrics-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (metricsChart) {
        metricsChart.destroy();
    }
    
    // Create new chart
    metricsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['MSE (Test)', 'MSE (Train)', 'R² (Test)', 'R² (Train)'],
            datasets: [
                {
                    label: 'Max Temperature',
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1,
                    data: [
                        modelData.max_temp.mse_test,
                        modelData.max_temp.mse_train,
                        modelData.max_temp.r2_test,
                        modelData.max_temp.r2_train
                    ]
                },
                {
                    label: 'Min Temperature',
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1,
                    data: [
                        modelData.min_temp.mse_test,
                        modelData.min_temp.mse_train,
                        modelData.min_temp.r2_test,
                        modelData.min_temp.r2_train
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            title: {
                display: true,
                text: 'Model Performance Metrics Comparison'
            }
        }
    });
}
    // Forecast Button
    document.getElementById('forecast-btn').addEventListener('click', function() {
        const selectedDate = document.getElementById('forecast-datepicker').value;
        
        if (!selectedDate) {
            alert('Please select a starting date');
            return;
        }
        
        // Show loading state
        this.textContent = 'Generating...';
        this.disabled = true;
        
        fetch('/forecast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: selectedDate }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display forecast results
            displayForecast(data);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        })
        .finally(() => {
            // Reset button
            this.textContent = 'Generate Forecast';
            this.disabled = false;
        });
    });
    
    let forecastChart = null;
    
    function displayForecast(forecastData) {
        document.getElementById('forecast-result').classList.remove('hidden');
        
        // Clear previous forecast cards
        const forecastCardsContainer = document.getElementById('forecast-cards');
        forecastCardsContainer.innerHTML = '';
        
        // Create forecast cards and collect data for chart
        const dates = [];
        const maxTemps = [];
        const minTemps = [];
        
        forecastData.forEach(day => {
            dates.push(day.day);
            maxTemps.push(day.max_temp);
            minTemps.push(day.min_temp);
            
            // Create forecast card
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="forecast-date">${formatDate(day.date)}</div>
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-temps">
                    <div class="forecast-temp">
                        <div class="forecast-temp-label">Max</div>
                        <div class="forecast-temp-value max">${day.max_temp}°C</div>
                    </div>
                    <div class="forecast-temp">
                        <div class="forecast-temp-label">Min</div>
                        <div class="forecast-temp-value min">${day.min_temp}°C</div>
                    </div>
                </div>
            `;
            forecastCardsContainer.appendChild(card);
        });
        
        // Update forecast chart
        updateForecastChart(dates, maxTemps, minTemps);
    }
    
    function updateForecastChart(dates, maxTemps, minTemps) {
        const ctx = document.getElementById('forecast-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (forecastChart) {
            forecastChart.destroy();
        }
        
        // Create new chart
        forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Max Temperature (°C)',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                        tension: 0.3,
                        fill: true,
                        data: maxTemps
                    },
                    {
                        label: 'Min Temperature (°C)',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                        tension: 0.3,
                        fill: true,
                        data: minTemps
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: '7-Day Temperature Forecast'
                    }
                }
            }
        });
    }
    
    // Helper function to format date as DD MMM YYYY
    function formatDate(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Initialize metrics on first load
    loadMetricsData();
});