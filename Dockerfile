FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG BASE_PATH=""
ENV BASE_PATH=${BASE_PATH}

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html/app
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
