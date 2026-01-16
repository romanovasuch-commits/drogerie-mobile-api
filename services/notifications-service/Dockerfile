FROM node:20-alpine

WORKDIR /app

COPY services/notifications-service/package.json services/notifications-service/package-lock.json* ./
RUN npm ci --omit=dev

COPY services/notifications-service/src ./src
COPY libs ./libs

ENV NODE_ENV=production
EXPOSE 3003

CMD ["node", "src/index.js"]