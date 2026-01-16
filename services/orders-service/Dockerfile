FROM node:20-alpine

WORKDIR /app

COPY services/orders-service/package.json services/orders-service/package-lock.json* ./
RUN npm ci --omit=dev

COPY services/orders-service/src ./src
COPY libs ./libs

ENV NODE_ENV=production
EXPOSE 3002

CMD ["node", "src/index.js"]