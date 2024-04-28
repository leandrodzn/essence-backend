"use strict";

const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

const dotenvFilePath = path.resolve(process.cwd(), ".env");

const loadEnvFile = async () => {
  try {
    if (fs.existsSync(dotenvFilePath)) {
      dotenv.config({ path: dotenvFilePath });
    } else {
      throw new Error(".env NOT FOUND");
    }
  } catch (error) {
    throw new Error(".env NOT FOUND");
  }
};

loadEnvFile();

const env = Object.keys(process.env).reduce((acc, current) => {
  acc[current] = process.env[current];
  return acc;
}, {});

module.exports = env;
