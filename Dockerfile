FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .
COPY dist ../dist

EXPOSE 5000

CMD ["node", "server.js"]
