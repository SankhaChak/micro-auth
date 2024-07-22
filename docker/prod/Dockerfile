FROM node:18-alpine as builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:18-alpine as production

ENV NODE_ENV=production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=builder /app/dist ./

EXPOSE 5500

CMD [ "node", "src/index.js" ]
