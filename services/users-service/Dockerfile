FROM node:20-alpine

WORKDIR /app

# deps
COPY services/users-service/package.json services/users-service/package-lock.json* ./
RUN npm install --omit=dev

# service code
COPY services/users-service/src ./src

# shared libs for paths like ../../libs/shared/...
COPY libs ./libs

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "src/index.js"]