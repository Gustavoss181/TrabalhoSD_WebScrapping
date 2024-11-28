# Use a imagem oficial do Node.js
FROM node:14

# Crie um diretório de trabalho
WORKDIR /usr/src/app

# Instale as dependências
COPY package.json ./
RUN npm install

# Copie o restante da aplicação
COPY . .

# Exponha a porta da aplicação
EXPOSE 4000

# Comando para rodar a aplicação
CMD ["npm", "start"]
