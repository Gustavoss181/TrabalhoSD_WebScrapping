const campoSelect = document.getElementById('seletorJogo');
let jogos = {};

fetch('http://localhost:4000/get-links')
.then(response => {
    if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.status);
    }
    return response.json(); // Parseia o JSON da resposta
})
.then(data => {
    jogos = data; // Aqui você tem os dados recebidos
    for(const key in jogos){
        const nome = jogos[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = nome;
        campoSelect.appendChild(option);
    }
})
.catch(error => {
    console.error('Erro ao buscar os dados:', error);
});

// Verificar qual dos radio inputs foram selecionados
function getSelectedNotificationMethod() {
    const radios = document.getElementsByName('notification');
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].id; // Retorna o id do radio selecionado (sms, email ou telegram)
        }
    }
    return null; // Nenhum radio selecionado
}

function updateMessage(elemento, type, mensagem){
    if(type == "warning"){
        elemento.textContent = mensagem;
        elemento.style.color = "red";
        elemento.style.backgroundColor = "lightcoral";
    }
    else if(type == "ok"){
        message.textContent = mensagem;
        message.style.color = "green";
        message.style.backgroundColor = "lightgreen";
    }
    else{
        elemento.textContent = "";
    }
}

// evento do clique do botão de definir notificação com o envio dos dados informados pelo usuário via POST
document.getElementById('precoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const seletorJogo = document.getElementById('seletorJogo');
    const precoInput = document.getElementById('precoInput');
    const metodoNotificacao = getSelectedNotificationMethod();
    const message = document.getElementById('message');

    const linkJogo = seletorJogo.value;
    const preco = parseFloat(precoInput.value);

    
    if (linkJogo === "") {
        updateMessage(message, "warning", "Por favor selecione um jogo.");
        return;
    }
    
    if (isNaN(preco) || preco <= 0) {
        updateMessage(message, "warning", "Por favor, entre com um preço válido");
        return;
    }
    
    if (!metodoNotificacao) {
        updateMessage(message, "warning", "Por favor selecione um metodo de notificação.");
        return;
    }

    const tipoNotificacaoInput = document.getElementById(metodoNotificacao + 'Input');
    const enderecoNotificacao = tipoNotificacaoInput.value;

    if(metodoNotificacao != "email"){
        updateMessage(message, "warning", "Apenas o módulo de email está disponível no momento");
        return;
    }

    if (enderecoNotificacao == ""){
        updateMessage(message, "warning", "Por favor, preencha o campo com a entrada correta");
        return;
    }

    const notificationData = {
        "jogo": jogos[linkJogo],
        "link": linkJogo,
        "preco": preco,
        "metodoNotificacao": metodoNotificacao,
        "enderecoNotificacao": enderecoNotificacao
    }

    fetch('http://localhost:4000/notify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
    })
    .then(response => {
        if (response.ok) {
            updateMessage(message, "ok", `Notificação definida para o jogo ${jogos[linkJogo]} quando o preço estiver abaixo de R$${preco.toFixed(2)} para o ${metodoNotificacao} ${enderecoNotificacao}.`);
        } else {
            updateMessage(message, "warning", "Falha ao definir a notificação");
        }
    })
    .catch(error => {
        updateMessage(message, "warning", "Erro ao definir a notificação");
        console.error(error);
    });
});

// definir qual campo mostrar dependendo de qual opção de notificação foi selecionada
function showField(notificationType) {
    document.getElementById('smsField').classList.add('hidden');
    document.getElementById('smsInput').removeAttribute('required');
    document.getElementById('emailField').classList.add('hidden');
    document.getElementById('emailInput').removeAttribute('required');
    document.getElementById('telegramField').classList.add('hidden');
    document.getElementById('telegramInput').removeAttribute('required');

    if (notificationType === 'sms') {
        document.getElementById('smsField').classList.remove('hidden');
        document.getElementById('smsInput').setAttribute('required', 'required');
    } else if (notificationType === 'email') {
        document.getElementById('emailField').classList.remove('hidden');
        document.getElementById('emailInput').setAttribute('required', 'required');
    } else if (notificationType === 'telegram') {
        document.getElementById('telegramField').classList.remove('hidden');
        document.getElementById('telegramInput').setAttribute('required', 'required');
    }
}