FROM node:lts-alpine3.12 as build

COPY --chown=node:node package.json package-lock.json ./

RUN npm ci
COPY --chown=node:node src ./src
COPY --chown=node:node views/*  ./views/
COPY --chown=node:node static/*  ./static/
COPY --chown=node:node config.js ./config.js

FROM node:lts-alpine3.12
COPY --chown=node:node --from=build package.json package-lock.json ./
COPY --chown=node:node --from=build node_modules ./node_modules
COPY --chown=node:node --from=build src ./src
COPY --chown=node:node --from=build views ./views
COPY --chown=node:node --from=build config.js ./config.js

RUN npm prune --production

EXPOSE 8080

CMD [ "node", "src/index.js" ]
