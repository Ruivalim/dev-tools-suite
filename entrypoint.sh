#!/bin/sh

# Clean up BASE_PATH (remove leading slash)
BASE_PATH_CLEAN=$(echo "$BASE_PATH" | sed "s|^/||")

if [ -n "$BASE_PATH_CLEAN" ]; then
  # Create directory for the base path
  mkdir -p "/usr/share/nginx/html/$BASE_PATH_CLEAN"
  
  # Copy app files to the base path directory
  cp -r /usr/share/nginx/html/app/* "/usr/share/nginx/html/$BASE_PATH_CLEAN/"
  
  # Create nginx config with base path
  cat > /etc/nginx/conf.d/default.conf << EOF
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location /$BASE_PATH_CLEAN {
        try_files \$uri \$uri/ /$BASE_PATH_CLEAN/index.html;
    }
    
    location / {
        return 301 /$BASE_PATH_CLEAN;
    }
}
EOF
else
  # No base path, copy files to root
  cp -r /usr/share/nginx/html/app/* /usr/share/nginx/html/
fi

# Start nginx
exec nginx -g "daemon off;"