FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate && mkdir -p uploads

FROM base AS dev

EXPOSE 3001

CMD ["npm", "run", "dev"]

FROM base AS runtime

ENV NODE_ENV=production

RUN chmod +x /app/entrypoint.sh

EXPOSE 3001

CMD ["/app/entrypoint.sh"]
