async function fetchData() {
	const response = await fetch('http://localhost:4000/get-scrape-data');
	const data = await response.json();
	return data;
}

const colors = [
    '#2C3E50', '#8E44AD', '#2980B9', '#27AE60', '#E74C3C',
    '#16A085', '#34495E', '#7F8C8D', '#2C3E50', '#8E44AD'
];

function updateChart(chart, data) {
	const datasets = [];
	const allTimes = new Set();
	
	let colorIndex = 0;

	const keys = Object.keys(data);
	if(keys == []){
		return
	}
	const firstLink = keys[0];
	const times = data[firstLink].datePrice.map(entry => entry.horario);

	for (const link in data) {
		const linkData = data[link];
		const gameName = linkData.gameName;
		const prices = linkData.datePrice.map(entry => entry.preco);
	
		datasets.push({
			label: gameName,
			data: prices,
			backgroundColor: colors[colorIndex],
			borderColor: colors[colorIndex],
			borderWidth: 1,
			fill: false
		});
		colorIndex++;
	}
  
	// Converte o conjunto de horários em um array e ordena
	const labels = times;
  
	chart.data.labels = labels;
	chart.data.datasets = datasets;
	chart.update();
}
  
window.onload = async () => {
	const ctx = document.getElementById('myChart').getContext('2d');
	const myChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		scales: {
			y: {
				beginAtZero: true
			}
		}
	}
	});

	updateChart(myChart, await fetchData());

	const socket = new WebSocket(`ws://localhost:4000`);

	// Receber mensagem do servidor WebSocket
	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		updateChart(myChart, data);
	};
};
  