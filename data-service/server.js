const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const nodemailer = require('nodemailer');
const { resolve } = require('path');

const localGameStore = {
    "https://store.steampowered.com/app/367520/Hollow_Knight/": "Hollow Knight",
    "https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/": "The Witcher 3: Wild Hunt",
    "https://store.steampowered.com/app/504230/Celeste/": "Celeste",
    "https://store.steampowered.com/app/268910/Cuphead/": "CupHead",
    "https://store.steampowered.com/app/674940/Stick_Fight_The_Game/": "Stick Fight - The Game",
    "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/": "Red Dead Redemption 2",
    "https://store.steampowered.com/app/960090/Bloons_TD_6/": "Bloons TD 6",
    "https://store.steampowered.com/app/255710/Cities_Skylines/": "Cities: Skylines"
};
/*
localGameStore = {
	gameLink1: gameName1,
	gameLink2: gameName2,
	...
}
*/

let localNotificationStore = [];
/*
localNotificationStore = [
	0: {
        "jogo": jogos[linkJogo],
        "link": linkJogo,
        "preco": preco,
        "metodoNotificacao": metodoNotificacao,
        "enderecoNotificacao": enderecoNotificacao
    },
	1: {
        "jogo": nomeJogo,
        "link": linkJogo,
        "preco": preco,
        "metodoNotificacao": metodoNotificacao,
        "enderecoNotificacao": enderecoNotificacao
    }
	...
]
*/
let localScrapeDataStore = {};
/*
localScrapeDataStore structure {
	gameLink1: {
		gameName: "",
		dataPreco: [
			{"horario": '%d-%m-%Y_%H:%M:%S', "preco": valor}
			{"horario": '%d-%m-%Y_%H:%M:%S', "preco": valor}
			{"horario": '%d-%m-%Y_%H:%M:%S', "preco": valor}
		]
	}
	gameLink2: {
		gameName: "",
		dataPreco: [
			{"horario": '%d-%m-%Y_%H:%M:%S', "preco": valor}
			{"horario": '%d-%m-%Y_%H:%M:%S', "preco": valor}
			{"horario": '%d-%m-%Y_%H:%M:%S', "preco": valor}
		]
	}
	...
}
*/
let precosAntigos = {};

let transporter = nodemailer.createTransport({
    service: 'hotmail', // ou outro serviço de email como Outlook, Yahoo, etc.
	host: 'smtp-mail.outlook.com',
	secure: false,
	port: 587,
    auth: {
        user: 'notificador-steam181@hotmail.com',
        pass: 'senhaboa123'
    },
	tls: {
		ciphers: "SSLv3",
		rejectUnauthorized: false
	},
});

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(cors()); // habilita CORS para todas as rotas

// Criar o servidor HTTP
const server = http.createServer(app);

// Criar o servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
	console.log('New client connected');
	ws.on('close', () => console.log('Client disconnected'));
});

// Função para enviar dados para todos os clientes WebSocket
function broadcastData() {
	const data = JSON.stringify(localScrapeDataStore);
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
}

async function sendEmail(emailAddress, jogo, preco, link){
    let mailOptions = {
        from: 'notificador-steam181@hotmail.com', // Endereço de email do remetente
        to: emailAddress, // Endereço de email do destinatário
        subject: `Notificador de Jogos`,
        text: `O jogo ${jogo} está com o preço de R$${preco.toFixed(2)}\nLink para o jogo: ${link}`,
        // Você também pode usar 'html' para enviar conteúdo em HTML:
        // html: '<h1>Conteúdo do Email</h1>'
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Erro ao enviar email:', error);
        } else {
            console.log('Email enviado:', info.response);
        }
    });
}

app.post('/notify', async (req, res) => {
	const data = req.body;

	console.log('Received notification data: ', data);

	localNotificationStore.push(data);
	localGameStore[data["link"]] = data["jogo"];

	res.send('Data recieved successfully');
});

// Endpoint para receber dados de scraping
app.post('/scrape-data', async (req, res) => {
	const data = req.body;
	console.log('Received scraping data: ', data);

	for(const notificacao of localNotificationStore){
		const link = notificacao['link'];
		if(!precosAntigos[link]){
			precosAntigos[link] = 0;
		}
        if(data[link]['preco'] < notificacao['preco']  && data[link]['preco'] < precosAntigos[link]){
			console.log('O preco abaixou');
            if(notificacao['metodoNotificacao'] == 'email'){
				try{
                	await sendEmail(notificacao['enderecoNotificacao'], notificacao['jogo'], data[link]['preco'], link);
				}
				catch (error) {
					console.error('Falha ao enviar email', error);
				}
				await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
	// preenche o preço antigo com o preço atual
    for (const link in data) {
        precosAntigos[link] = data[link]['preco'];
    }

	// Armazenar dados no formato especificado acima
	for (const link in data) {
		const gameName = localGameStore[link];
		const datePrice = data[link]
		if (!localScrapeDataStore[link]) {
			localScrapeDataStore[link] = {
				gameName: gameName,
				datePrice: []
			}
		}
		localScrapeDataStore[link].datePrice.push(datePrice);
	}

	// Enviar os dados atualizados para todos os clientes WebSocket
	broadcastData();

	res.send('Data received successfully');
});

// Endpoint para fornecer os dados armazenados
app.get('/get-scrape-data', (req, res) => {
	res.json(localScrapeDataStore);
});

app.get('/get-links', (req, res) => {
	res.json(localGameStore);
});

server.listen(port, () => {
	console.log(`WebSocket running on port ${port}`);
});