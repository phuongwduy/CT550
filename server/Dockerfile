# -------------------
# Dockerfile - server
# -------------------

FROM node:18

WORKDIR /app

COPY package*.json ./

# Cài dependencies + nodemon
RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
