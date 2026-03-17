FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY services/api-gateway/package.json services/api-gateway/package.json
COPY services/auth-service/package.json services/auth-service/package.json
COPY services/catalog-service/package.json services/catalog-service/package.json
COPY services/article-service/package.json services/article-service/package.json
COPY services/audit-service/package.json services/audit-service/package.json
COPY services/notification-service/package.json services/notification-service/package.json
COPY backend/prisma backend/prisma

RUN npm ci

COPY services/notification-service services/notification-service

RUN npm run build -w services/notification-service

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

WORKDIR /app/services/notification-service

EXPOSE 3006

CMD ["node", "dist/main"]
