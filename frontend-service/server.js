const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('grafico'));
app.use(express.static('formulario'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'grafico', 'grafico.html'));
});

app.get('/notify', (req, res) => {
	res.sendFile(path.join(__dirname, 'formulario', 'form.html'))
});

app.listen(port, () => {
	console.log(`Frontend service is running on http://localhost:${port}`);
});
