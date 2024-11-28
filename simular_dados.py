# arquivo de teste para emular o scrape de dados com o preço desejado
# para testar o envio do email

from datetime import datetime
import requests # type: ignore
import pprint
import pytz # type: ignore


preco = 10.00 # coloque um preço que será usado para todas as urls

sao_paulo_tz = pytz.timezone('America/Sao_Paulo')

URL = []
try:
    response = requests.get('http://localhost:4000/get-links')
    json_data = response.json()
    for link in json_data.keys():
        URL.append(str(link))
except:
    print('Erro ao receber as URLs')

scraped_data = {}
for url in URL:
    scraped_data[url]= {
        "horario": datetime.now(sao_paulo_tz).strftime("%d-%m-%Y %H:%M:%S"),
        "preco": preco
    }

pprint.pprint(scraped_data)

try:
    response = requests.post('http://localhost:4000/scrape-data', json=scraped_data)
    if(response.status_code == 200):
        print(response.content)
    else:
        print('Falha ao enviar os dados')
except:
    print('Erro ao enviar dados')
