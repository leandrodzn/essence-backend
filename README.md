# Essence Creatives Backend

## Table of contents

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

```

### Start HTTP server

bash

```sh
  nodemon bin/www
```

### Push your branch

bash

```sh
  git push origin name/develop
```

<br>

## Authors

- **Domingo Emmanuel Ciau Uc**

  - [![GitHub](https://img.shields.io/badge/GitHub-EmanuelCiau-red?style=flat&logo=github)](https://github.com/EmanuelCiau)

- **María Belen Couoh Chan**

  - [![GitHub](https://img.shields.io/badge/GitHub-Belen2708-pink?style=flat&logo=github)](https://github.com/Belen2708)

- **Leandro Angel Dzib Nauat**
  - [![GitHub](https://img.shields.io/badge/GitHub-leandrodzn-green?style=flat&logo=github)](https://github.com/leandrodzn)

## Build with

- [NodeJs](https://nodejs.org/es) - Server runtime environment Version (^ v20.11.0)
- [Express](https://expressjs.com/) - Framework
- [MySQL](https://www.mysql.com/) - Database
- [Sequelize](https://sequelize.org/) - Database ORM
