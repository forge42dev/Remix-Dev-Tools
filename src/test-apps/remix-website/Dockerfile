# base node image
FROM node:20-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Consume build arguments for non-secret env vars
ARG SOURCE_REPO
ENV SOURCE_REPO=$SOURCE_REPO
ARG RELEASE_PACKAGE
ENV RELEASE_PACKAGE=$RELEASE_PACKAGE

# Install all node_modules, including dev
FROM base as deps

WORKDIR /remixapp

ADD package.json package-lock.json ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /remixapp

COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --from=build /remixapp/build /remixapp/build
COPY --from=build /remixapp/server.mjs /remixapp/server.mjs
COPY --from=build /remixapp/package.json /remixapp/package.json
COPY --from=build /remixapp/start.sh /remixapp/start.sh

CMD ["npm", "start"]
