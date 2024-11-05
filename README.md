# Essence Creatives Backend

## Table of contents

- [Essence Creatives Backend](#essence-creatives-backend)
  - [Table of contents](#table-of-contents)
  - [Description](#description)
  - [Run locally](#run-locally)
    - [Node version](#node-version)
    - [Clone the project](#clone-the-project)
    - [Go to the project directory](#go-to-the-project-directory)
    - [Create your branch](#create-your-branch)
    - [Change to your branch](#change-to-your-branch)
    - [Install dependencies](#install-dependencies)
    - [Create empty database](#create-empty-database)
    - [Create .env file](#create-env-file)
    - [Start HTTP server](#start-http-server)
    - [Run seeders](#run-seeders)
    - [Push your branch](#push-your-branch)
  - [Authors](#authors)
  - [Build with](#build-with)

## Description

Backend development for Project System 'Essence Creatives'

<br>

## Run locally

### Node version

Install Node v. 20.11.0 and use for this project

### Clone the project

bash

```sh
  git clone https://github.com/leandrodzn/essence-backend.git
```

### Go to the project directory

bash

```sh
  cd essence-backend
```

### Create your branch

bash

```sh
  git checkout -b develop
```

```sh
  git pull origin develop
```

```sh
  git branch [name]/develop
```

Example: belen/develop

### Change to your branch

bash

```sh
  git checkout name/develop
```

### Install dependencies

bash

```sh
  npm install
```

bash

```sh
  npm install -g nodemon
```

### Create empty database

Name

```sh
  essence_creatives_db
```

### Create .env file

Variables

```bash

EC_PORT=3110
EC_SERVER_URL=http://localhost:3110

# Database
EC_DATABASE_USERNAME=
EC_DATABASE_PASSWORD=
EC_DATABASE_NAME=essence_creatives_db
EC_DATABASE_HOST=localhost
EC_DATABASE_PORT=3306
EC_DATABASE_LOGGING=false

# Authentication Administrator
EC_ADMIN_JWT_SECRET=
EC_ADMIN_JWT_EXPIRATION=
EC_ADMIN_JWT_IGNORE_EXPIRATION=false
EC_ADMIN_BCRYPT_SALT_ROUNDS=
EC_ADMIN_JWT_REFRESH_TOKEN_SECRET=

# Authentication Customer
EC_CLIENT_JWT_SECRET=
EC_CLIENT_JWT_EXPIRATION=
EC_CLIENT_JWT_IGNORE_EXPIRATION=false
EC_CLIENT_BCRYPT_SALT_ROUNDS=
EC_CLIENT_JWT_REFRESH_TOKEN_SECRET=

# Initial Administrator user
EC_INITIAL_ROOT_MAIL=
EC_INITIAL_ROOT_NAME=
EC_INITIAL_ROOT_SURNAME=
EC_INITIAL_ROOT_PASSWORD=
EC_INITIAL_ROOT_CODE=

```

### Start HTTP server

bash

```sh
  npm run dev
```

### Run seeders

> [!IMPORTANT]  
> Server should be running to run seeders.

Initialize Sequelize to be able to run seeders.

bash

```sh
  npx sequelize-cli init
```

Configure the config/config.json file with database connection (for local environment configure "development")

```bash
{
  "development": {
    "username": "root",
    "password": "password",
    "database": "essence_creatives_db",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

Run the seeds

bash

```sh
  npx sequelize-cli db:seed:all
```

### Push your branch

bash

```sh
  git push origin name/develop // example wilder/develop
```

<br>

## Authors

- **Domingo Ciau Uc**

  [![GitHub](https://img.shields.io/badge/GitHub-DomingoCiau02-red?style=flat&logo=github)](https://github.com/DomingoCiau02)

- **Belen Couoh Chan**

  [![GitHub](https://img.shields.io/badge/GitHub-Belen2708-pink?style=flat&logo=github)](https://github.com/Belen2708)

- **Leandro Dzib Nauat**

  [![GitHub](https://img.shields.io/badge/GitHub-leandrodzn-green?style=flat&logo=github)](https://github.com/leandrodzn)

- **Wilder Turriza Poot**

  [![GitHub](https://img.shields.io/badge/GitHub-WilderTurriza-blue?style=flat&logo=github)](https://github.com/WilderTurriza)

- **Wilbeth Kantun Lizama**

  [![GitHub](https://img.shields.io/badge/GitHub-WilberthKantun-yellow?style=flat&logo=github)](https://github.com/WilberthKantun)

## Build with

- [NodeJs](https://nodejs.org/es) - Server runtime environment Version (^ v20.11.0)
- [Express](https://expressjs.com/) - Framework
- [MySQL](https://www.mysql.com/) - Database
- [Sequelize](https://sequelize.org/) - Database ORM
