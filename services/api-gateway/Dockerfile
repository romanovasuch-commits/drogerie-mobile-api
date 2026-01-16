FROM node:20-alpine

WORKDIR /app

COPY services/api-gateway/package.json services/api-gateway/package-lock.json* ./
RUN npm install --omit=dev

COPY services/api-gateway/src ./src
COPY libs ./libs

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "src/index.js"]