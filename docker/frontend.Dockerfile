# Build de l'image du frontend (cahier des charges §6 : webapp React).
# Ce fichier vit hors de frontend/ (voir docker-compose.yml à la racine,
# service "frontend") pour ne rien ajouter dans ce dossier.
# Contexte de build attendu : frontend/

FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# SPA (react-router-dom) : toute route qui n'est pas un fichier statique
# doit retomber sur index.html, sinon un F5 sur /donnees ou /historique
# renvoie un 404 nginx.
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
