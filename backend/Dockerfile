
FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache curl

COPY --from=builder /build ./

HEALTHCHECK --interval=90s --timeout=20s --retries=3 \
CMD curl -f http://localhost:5000/docker || exit 1

EXPOSE 5000

CMD ["node", "index.js"]
