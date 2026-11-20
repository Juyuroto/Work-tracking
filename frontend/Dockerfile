FROM node:22.22.3-alpine3.24
RUN apk add --no-cache tzdata && mkdir /app && chown node:node /app
ENV NODE_ENV=production TZ=Europe/Paris NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# non-root, et propriétaire de .next/ : next start y écrit son cache
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node . .
RUN npm run build
CMD ["node_modules/.bin/next", "start"]
