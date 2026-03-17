FROM node:22-alpine AS builder

WORKDIR /app
ENV NEXT_PUBLIC_API_BASE_URL=/api

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

COPY frontend frontend

RUN npm run build -w frontend

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

WORKDIR /app/frontend

EXPOSE 3000

CMD ["npm", "run", "start"]
