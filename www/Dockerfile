# Build a node-based static site
# TODO: more recent versions of node break the build :( figure out why!
FROM node:16 AS build
WORKDIR /app/webapp
COPY www/webapp/package.json www/webapp/yarn.lock /app/webapp/
RUN yarn --frozen-lockfile
WORKDIR /app
COPY www/package.json /app/
RUN yarn --frozen-lockfile
# copying from a parent dir requires special docker context; we use translation files from a parent dir
# docker-compose.yml and .github/workflows/build-docker-image.yml both set this context, but be careful if you're trying to do something new
COPY expo54/src/locals /expo54/src/locals
# `.dockerignore` is important to cache this copy properly
COPY www /app/
# RUN yarn test run
RUN yarn build

# Run the static site we just built. No Caddyfile or other config, just static files.
# "The default config file simply serves files from /usr/share/caddy" - https://hub.docker.com/_/caddy
FROM caddy:2.8
COPY --from=build /app/build/ /usr/share/caddy
