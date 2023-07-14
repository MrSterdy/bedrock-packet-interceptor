FROM node:18.16.1-alpine3.17 AS build

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build

FROM node:18.16.1-alpine3.17 AS prod

WORKDIR /app

COPY --from=build /app/package*.json .
COPY --from=build /app/build .

RUN npm i --omit=dev

EXPOSE 3000

CMD ["node", "index.js"]