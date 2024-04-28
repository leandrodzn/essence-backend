"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const getFiles = (dir) => {
  let files = [];

  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files = files.concat(getFiles(filePath));
    } else {
      files.push(filePath);
    }
  });

  return files;
};

const routesDir = `${__dirname}`;

const getRoutesFiles = () => {
  let files = [];

  getFiles(routesDir).forEach((file) => {
    if (file.endsWith(".js")) {
      files.push(file);
    }
  });

  return files;
};

const routesFiles = getRoutesFiles();

module.exports = (app) => {
  routesFiles.forEach((file) => {
    const routesModule = require(file);

    if (routesModule && Array.isArray(routesModule.routes)) {
      routesModule.routes.forEach((route) => {
        const { method, path, action, middleware } = route;

        let newRoute = null;

        if (middleware) {
          const applyMiddleware = Array.isArray(middleware)
            ? middleware
            : [middleware];

          newRoute = router[method](path, ...applyMiddleware, action);
        } else {
          newRoute = router[method](path, action);
        }
        app.use("/api/", newRoute);
      });
    }
  });
};
