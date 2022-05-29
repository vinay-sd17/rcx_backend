# rcx_backend
RCX Backend App built on NestJs (NodeJs)

# Prerequisite
1. MongoDB (installed locally or remote)

Installing MongoDB using Docker
1. run "docker-compose up -d" on terminal at the root folder, this will boot MongoDB locally
2. check MongoDB is running in your machine by firing "docker ps" on terminal

# Steps to bootstrap API application
1.  npm install
2.  npm run start

# Access api by
http://localhost:4000/swagger

# Monitor Api server status:
http://localhost:4000/metrics/ux#/

![Alt text](docs/metrics-1.png?raw=true "Metrics 1")

![Alt text](docs/metrics-2.png?raw=true "Metrics 2")


# Debug API on Intellij
Node param: node_modules/@nestjs/cli/bin/nest.js start --watch

Working Dir: your source dir

Javascript file: src/main.ts

![Alt text](docs/Intellij_debug_settings.png?raw=true "Debug Settings")

