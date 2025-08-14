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

# Create entrypoint script
RUN echo '#!/bin/sh\n\
BASE_PATH_CLEAN=$(echo "$BASE_PATH" | sed "s|^/||")\n\
if [ -n "$BASE_PATH_CLEAN" ]; then\n\
  mkdir -p "/usr/share/nginx/html/$BASE_PATH_CLEAN"\n\
  cp -r /usr/share/nginx/html/app/* "/usr/share/nginx/html/$BASE_PATH_CLEAN/"\n\
  echo "server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    location /$BASE_PATH_CLEAN {\n\
        try_files \$uri \$uri/ /$BASE_PATH_CLEAN/index.html;\n\
    }\n\
    \n\
    location / {\n\
        return 301 /$BASE_PATH_CLEAN;\n\
    }\n\
}" > /etc/nginx/conf.d/default.conf\n\
else\n\
  cp -r /usr/share/nginx/html/app/* /usr/share/nginx/html/\n\
fi\n\
nginx -g "daemon off;"' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
