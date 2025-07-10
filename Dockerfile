FROM node:18-slim

# Déclarer les variables d'environnement à la compilation
ARG AIRTABLE_API_KEY
ARG AIRTABLE_BASE_ID
ARG TABLE_NAME
ARG BASIC_USER
ARG BASIC_PASS
ARG DRIVE_FOLDER_ID

# Les rendre accessibles pendant l'exécution
ENV AIRTABLE_API_KEY=$AIRTABLE_API_KEY
ENV AIRTABLE_BASE_ID=$AIRTABLE_BASE_ID
ENV TABLE_NAME=$TABLE_NAME
ENV BASIC_USER=$BASIC_USER
ENV BASIC_PASS=$BASIC_PASS
ENV DRIVE_FOLDER_ID=$DRIVE_FOLDER_ID

# Installer les dépendances nécessaires pour Chromium (si tu utilises puppeteer ou pdf)
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste de l'application
COPY . .

# Build de l'application Next.js
RUN npm run build

# Démarrage de l'app
CMD ["npm", "start"]
