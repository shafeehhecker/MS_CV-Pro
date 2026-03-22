# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install --frozen-lockfile || npm install

COPY . .
RUN npm run build

# Stage 2: Serve via nginx
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: all routes go to index.html
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
