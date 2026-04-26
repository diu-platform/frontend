# Build stage
FROM rust:1.93 AS node-builder

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve with any static file server
FROM nginx:alpine
COPY --from=node-builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]