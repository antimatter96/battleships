FROM node:lts-alpine3.12 as base_image

RUN mkdir /src
WORKDIR /src

COPY package.json .
RUN npm install

FROM base_image

COPY src/*  ./src/
COPY views/*  ./views/
COPY static/*  ./static/
COPY config.js ./config.js

# COPY public/*  /src/
COPY config.js src/config.js

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
