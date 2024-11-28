# Notificador de Jogos da Steam

O projeto consiste em fazer o Web Scrapping de algumas páginas de jogos da Steam e notificar um usuário que cadastrou seu email para avisar quando um jogo ficou abaixo de um preço desejado. Também é possível o usuário acompanhar o preço dos jogos pelo gráfico.

## Instruções de Uso
1. Faça o Docker Compose na raiz do projeto (onde se encontra o arquivo "docker-compose.yml"):
   ```bash
   docker compose up --build

2. Espere o Docker terminar de criar

3. Acesse a URL http://localhost:3000 no seu browser

O scrapping é feito a cada 15 segundos para fins didáticos, mas esse tempo pode ser alterado no arquivo `scraper_parser.py` no diretório `/scraper-service`.

Os preços não variam muito então caso queira testar o envio do email basta rodar o arquivo `simular_dados.py` com as dependências "requests" e "pytz".