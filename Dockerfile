FROM node:12-alpine
WORKDIR /app
RUN npm install -g @nestjs/cli
COPY ./package.json ./

# FOR CACHE DISABLING
ARG BUILD_VERSION=01-01-2021-t-10-00

RUN npm install
COPY . .
RUN rm -rf dist
EXPOSE 8080
CMD ["npm", "run", "start"]
