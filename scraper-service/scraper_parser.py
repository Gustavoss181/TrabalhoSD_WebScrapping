import json
from bs4 import BeautifulSoup # type: ignore
from datetime import datetime
import subprocess
import requests # type: ignore
import pprint
import sched
import time
import pytz # type: ignore

# URL = "https://store.steampowered.com/app/504230/Celeste/"
# URL = "https://store.steampowered.com/app/268910/Cuphead/"
sao_paulo_tz = pytz.timezone('America/Sao_Paulo')

def scrape():
    URL = []
    try:
        response = requests.get('http://data-service:4000/get-links')
        json_data = response.json()
        for link in json_data.keys():
            URL.append(str(link))
    except:
        print('Erro ao receber as URLs')
    
    scraped_data = {}
    for url in URL:
        command = ['curl', '-s', url]
        try:
            result = subprocess.run(command, capture_output=True, text=True)
        except:
            print('Jogo ', url, ' para maior de 18')
            continue

        content = result.stdout
        print(result.stderr)

        # Faz o parsing do HTML com BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')

        divs = soup.find_all('div', {"class": 'price'})
        if(len(divs) <= 0):
            print(divs)
            return
        preco = divs[0].string.strip()[3:]

        scraped_data[url]= {
            "horario": datetime.now(sao_paulo_tz).strftime("%d-%m-%Y %H:%M:%S"),
            "preco": float(preco.replace(',', '.'))
        }

    pprint.pprint(scraped_data)

    try:
        response = requests.post('http://data-service:4000/scrape-data', json=scraped_data)
        if(response.status_code == 200):
            print(response.content)
        else:
            print('Falha ao enviar os dados')
    except:
        print('Erro ao enviar dados')



scheduler = sched.scheduler(time.time, time.sleep)
intervalo = 15 # 30 segundos

def agendar_prox_execucao():
    scrape()
    scheduler.enter(intervalo, 1, agendar_prox_execucao)

scheduler.enter(0, 1, agendar_prox_execucao)
scheduler.run()
