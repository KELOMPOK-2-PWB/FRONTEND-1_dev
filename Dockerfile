FROM node:21-alpine AS base
#alphine aja biar enteng

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]