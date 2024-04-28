# In Xook Backend :wrench:

## Table of contents :card_index:

- [Description :page_facing_up:](#description-page_facing_up)
- [Run locally :computer:](#run-locally-computer)
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
- [Build with :hammer:](#build-with-hammer)

## Description :page_facing_up:

Backend development for Social Service Project 'In Xook'

<br>

## Run locally :computer:

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

## Build with :hammer:

- [NodeJs](https://nodejs.org/es) - Server runtime environment Version (^ v20.11.0)
- [Express](https://expressjs.com/) - Framework
- [MySQL](https://www.mysql.com/) - Database
- [Sequelize](https://sequelize.org/) - Database ORM
