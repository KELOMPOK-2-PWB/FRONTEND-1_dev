FROM node:21-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install
COPY . .
# build nextjs
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
