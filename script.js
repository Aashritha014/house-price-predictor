// Example multi-feature dataset with prices in INR
const houses = [
    {size:500, bedrooms:2, bathrooms:1, price:12000000},
    {size:700, bedrooms:3, bathrooms:1, price:15000000},
    {size:1000, bedrooms:3, bathrooms:2, price:18000000},
    {size:1200, bedrooms:4, bathrooms:2, price:21000000},
    {size:1500, bedrooms:4, bathrooms:3, price:25000000},
    {size:1800, bedrooms:5, bathrooms:3, price:28000000},
    {size:2000, bedrooms:5, bathrooms:4, price:32000000}
];

// Prepare feature matrices for normal equation
function computeTheta(X, y) {
    // X: array of arrays, y: array
    // theta = (X^T X)^-1 X^T y
    const math = window.math; // math.js is used
    const XT = math.transpose(X);
    const XTX = math.multiply(XT, X);
    const XTX_inv = math.inv(XTX);
    const XTy = math.multiply(XT, y);
    return math.multiply(XTX_inv, XTy);
}

// Prepare data
const X = houses.map(h => [1, h.size, h.bedrooms, h.bathrooms]);
const y = houses.map(h => h.price);
let theta;

// Load math.js dynamically
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.12.0/math.js";
script.onload = () => {
    theta = computeTheta(X, y);
    initChart();
};
document.head.appendChild(script);

// Chart.js setup
let priceChart;
function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Existing Houses',
                    data: houses.map(h => ({x:h.size, y:h.price})),
                    backgroundColor: 'blue'
                },
                {
                    label: 'Regression Line',
                    type:'line',
                    data: X.map(row => ({
                        x: row[1], 
                        y: theta[0] + theta[1]*row[1] + theta[2]*row[2] + theta[3]*row[3]
                    })),
                    borderColor:'red',
                    borderWidth:2,
                    fill:false
                },
                {
                    label: 'Predicted House',
                    data: [],
                    backgroundColor: 'green'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `₹${context.raw.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { display:true, text:'Size (sqft)' } 
                },
                y: { 
                    title: { display:true, text:'Price (₹)' },
                    ticks: {
                        callback: function(value) {
                            return `₹${value.toLocaleString('en-IN')}`;
                        }
                    }
                }
            }
        }
    });
}

// Predict function
function predict() {
    if(!theta) return;
    const size = parseFloat(document.getElementById('size').value);
    const bedrooms = parseInt(document.getElementById('bedrooms').value);
    const bathrooms = parseInt(document.getElementById('bathrooms').value);
    if(isNaN(size) || isNaN(bedrooms) || isNaN(bathrooms)) return;

    const predicted = theta[0] + theta[1]*size + theta[2]*bedrooms + theta[3]*bathrooms;
    document.getElementById('predicted-price').innerText = `₹${predicted.toLocaleString('en-IN')}`;

    // Update chart
    priceChart.data.datasets[2].data = [{x:size, y:predicted}];
    priceChart.update();
}

// Event listeners to update prediction as user types
document.getElementById('size').addEventListener('input', predict);
document.getElementById('bedrooms').addEventListener('input', predict);
document.getElementById('bathrooms').addEventListener('input', predict);
