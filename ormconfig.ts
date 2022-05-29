import {TypeOrmModuleOptions} from '@nestjs/typeorm';


console.log("***********DB CONFIG***************")
console.log("******** using: " + (process.env['run_mode'] === undefined ? "LOCALHOST" : process.env['run_mode']) + "  ************")
console.log("************************** \n")

let config;
if (process.env['run_mode'] === "prod") {
  config = {
    "name": "default",
    "type": "mongodb",
    "url": "mongodb+srv://ipx-user:ipxmongo1!@ipx-stage-cluster.vjqdv.mongodb.net/ipx-stg-db?retryWrites=true&w=majority",
    "useNewUrlParser": true,
    "useUnifiedTopology": true,
    "entities": [
      "dist/**/*.entity{ .ts,.js}"
    ],
    "synchronize": true,
    "migrations": [
      "dist/migrations/*{.ts,.js}"
    ],
    "migrationsTableName": "migrations_typeorm",
    "migrationsRun": true,
    "logging": true
  } as TypeOrmModuleOptions
} else {
  config = {
    "name": "default",
    "type": "mongodb",
    "host": "localhost",
    "port": 27017,
    "database": "ipx-acc-db",
    "entities": [
      "dist/**/*.entity{ .ts,.js}"
    ],
    "synchronize": true,
    "migrations": [
      "dist/migrations/*{.ts,.js}"
    ],
    "migrationsTableName": "migrations_typeorm",
    "migrationsRun": true,
    "logging": true
  } as TypeOrmModuleOptions
}

export const ormconfig = [config];
