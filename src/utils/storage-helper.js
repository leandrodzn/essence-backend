// Import necessary modules and libraries
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const { URL } = require("url");

// Define the root folder for public uploads
const PUBLIC_UPLOAD_FOLDER = "public";

// Utility function to get the base path of the current file
const _getBasePath = () => __dirname.replace(path.join("src", "utils"), "");

// Allowed file extensions for uploaded images
const ALLOWED_EXT = ["png", "jpg", "jpeg", "webp"];

// Asynchronous function to validate the existence of a folder and create it if needed
const _validateExistenceFolderAndCreate = async (absolutePath) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if the folder already exists
      if (fs.existsSync(absolutePath)) return resolve(true);

      // If not, create the folder recursively
      fs.mkdir(absolutePath, { recursive: true }, (error) => {
        console.log(error);
        if (error) reject(error);
        else resolve(true);
      });
    } catch (error) {
      // Handle any errors that occur during the process
      reject(error);
    }
  });
};

const uploadSingleFile = async ({
  req,
  res,
  name = "image",
  folder = "images",
}) => {
  return new Promise(async (resolve, reject) => {
    // Variables to store the relative path and error filter
    let relativeFolderPath = "";
    let errorFilter = null;

    // Configure the storage settings for multer
    let storage = multer.diskStorage({
      destination: async (req, file, callback) => {
        // Set the absolute and relative paths for the upload folder
        let absoluteFolderPath = path.join(
          _getBasePath(),
          PUBLIC_UPLOAD_FOLDER
        );
        relativeFolderPath = path.dirname(PUBLIC_UPLOAD_FOLDER);

        absoluteFolderPath = path.join(absoluteFolderPath, folder);
        relativeFolderPath = path.join(PUBLIC_UPLOAD_FOLDER, folder);

        // Ensure the folder exists before uploading
        await _validateExistenceFolderAndCreate(absoluteFolderPath);

        // Set the destination for the uploaded file
        callback(null, absoluteFolderPath);
      },

      filename: (req, file, callback) => {
        // Generate a unique filename using UUID and the current timestamp
        let finalFilename = `${uuidv4()}-${moment().format("DDMMYYYYHHmmss")}`;

        // Set the filename for the uploaded file
        callback(null, finalFilename);
      },
    });

    // Configure additional options for multer
    let options = {
      storage: storage,
      fileFilter: (req, file, cb) => {
        // Check if the file extension is allowed
        const extension = (
          file.originalname.split(".").pop() || ""
        ).toLowerCase();
        const isAllowed = ALLOWED_EXT.includes(extension);

        // If not allowed, set an error filter
        if (!isAllowed) errorFilter = new Error("Image not allowed");

        // Continue with the upload process
        cb(null, true);
      },
    };

    // Function to fix the request body
    const fixBody = () => {
      for (let element in req.body) {
        if (req.body[element] && typeof req.body[element] !== "object") {
          if (req.body[element] == "undefined") req.body[element] = undefined;
          else if (req.body[element] == "null" || req.body[element] == "NULL")
            req.body[v] = null;
        }
      }
    };

    // Create a multer instance for handling the single file upload
    const upload = multer(options).single(name);

    // Perform the upload and handle any errors
    upload(req, res, (error) => {
      if (error || errorFilter) return reject(error ?? errorFilter);

      fixBody();
      if (req.file) {
        // If the upload is successful, resolve with the file path
        return resolve(path.join(relativeFolderPath, req.file.filename));
      } else {
        // If no file is uploaded, resolve with null
        return resolve(null);
      }
    });
  });
};

const getUrlPublicFile = (relativePath) => {
  if (!relativePath) return "";

  const baseUrl = process.env.EC_SERVER_URL;

  if (!baseUrl)
    throw new Error(
      "IX_SERVER_URL no está definida en las variables de entorno."
    );

  const absoluteUrl = new URL(relativePath, baseUrl).toString();
  return absoluteUrl;
};

// Delete a file from the public files
const deleteFile = async (relativePath) => {
  try {
    if (!relativePath) return false;

    const absolutePath = path.join(_getBasePath(), relativePath);

    const fileExists = await fs.promises
      .access(absolutePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) return false;

    // If file exists delete it
    await fs.promises.unlink(absolutePath);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  uploadSingleFile,
  getUrlPublicFile,
  deleteFile,
};
