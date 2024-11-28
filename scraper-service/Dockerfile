# Use a imagem oficial do Python
FROM python:3.9

# Crie um diretório de trabalho
WORKDIR /usr/src/app 

# Copie o scraper.sh e o parser.py para o diretório de trabalho
COPY scraper_parser.py .

# Instale as dependências necessárias
RUN pip install beautifulsoup4 requests pytz

# Comando para executar o scraper.sh
CMD ["python3", "scraper_parser.py"]
