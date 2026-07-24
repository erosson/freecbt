# Build a node-based static site
FROM node:22 AS build1
WORKDIR /app
# copying from a parent dir requires special docker context; we use translation files from a parent dir
# docker-compose.yml and .github/workflows/build-docker-image.yml both set this context, but be careful if you're trying to do something new
COPY package.json /app/
COPY expo54/package.json /app/expo54/
COPY www/package.json /app/www/
RUN yarn --frozen-lockfile

FROM build1 AS build2
# `.dockerignore` is important to cache these copies properly
COPY expo54 /app/expo54/
COPY www /app/www/
WORKDIR /app/www
RUN yarn build

# Run the static site we just built. No Caddyfile or other config, just static files.
# "The default config file simply serves files from /usr/share/caddy" - https://hub.docker.com/_/caddy
FROM caddy:2.8
COPY --from=build2 /app/www/build/ /usr/share/caddy
