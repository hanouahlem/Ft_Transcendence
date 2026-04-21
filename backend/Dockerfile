FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install express-rate-limit swagger-jsdoc swagger-ui-express
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]