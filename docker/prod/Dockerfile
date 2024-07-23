FROM node:20-alpine as builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

RUN ls -la node_modules

COPY . .

RUN pnpm build

FROM node:20-alpine as production

ENV NODE_ENV=production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=builder /app/dist ./

EXPOSE 5001

CMD [ "node", "src/index.js" ]
