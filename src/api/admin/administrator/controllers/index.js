const { Administrator } = require("../../../../models");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const {
  validatorCreateAdministrator,
  validatorCreateRootAdministrator,
} = require("../validators");
const { hashPasswordAdministrator } = require("../../../../config/auth");

const cleanUser = (administratorModel) => {
  const administratorObject = administratorModel.get({ plain: true });

  delete administratorObject.password;
  delete administratorObject.reset_password_token;

  return administratorObject;
};

const createInitialRootAdministrator = async (req, res) => {
  const back = {};

  return Promise.resolve()
    .then(async () => {
      await validatorCreateRootAdministrator(req);
    })
    .then(async () => {
      const criteria = {
        where: {
          email: process.env.EC_INITIAL_ADMIN_MAIL,
        },
      };

      const defaults = {
        name: process.env.EC_INITIAL_ADMIN_NAME,
        surname: process.env.EC_INITIAL_ADMIN_SURNAME,
        email: process.env.EC_INITIAL_ADMIN_MAIL,
        password: await hashPasswordAdministrator(
          process.env.EC_INITIAL_ADMIN_PASSWORD
        ),
      };

      let administratorModel = await Administrator.findOne(criteria);

      if (administratorModel) {
        administratorModel = await administratorModel.update(defaults);
      } else {
        administratorModel = await Administrator.create(defaults);
      }

      back.administratorModel = administratorModel;
    })
    .then(async () => {
      res.status(200).json({
        data: back.administratorModel,
      });
    })
    .catch((error) => res.jsonError(error));
};

const createAdministrator = async (req, res) => {
  let transaction;
  try {
    // Validate front data
    await validatorCreateAdministrator(req);

    // validate username
    const criteria = {
      where: {
        email: { $like: req.body.email },
      },
    };

    let administratorModel = await Administrator.findOne(criteria);

    if (administratorModel)
      throw new CustomError({
        status: 400,
        name: "EmailInvalid",
        message: constants.response.EMAIL_INVALID,
      });

    transaction = await Database.transaction();

    const { name, surname, email, password } = req.body;

    const hashedPassword = await hashPasswordAdministrator(password);

    administratorModel = await Administrator.create(
      {
        name,
        surname,
        email,
        password: hashedPassword,
      },
      { transaction }
    );

    await transaction.commit();

    administratorModel = cleanUser(administratorModel);

    res.status(201).json({
      status: "OK",
      data: administratorModel,
    });
  } catch (error) {
    if (
      transaction &&
      (!transaction?.finished || transaction?.finished !== "commit")
    )
      await transaction.rollback();

    res.jsonError(error);
  }
};

const getAdministratorMe = async (req, res) => {
  const back = {};

  return Promise.resolve()
    .then(async () => {
      const userModel = await Administrator.findByPk(req.currentUser.id);

      if (!userModel) {
        throw new CustomError({
          status: 401,
          name: "Invalid",
          message: constants.response.INVALID_AUTH_CREDENTIAL,
        });
      }

      cleanUser(userModel);

      back.userModel = userModel.get({ plain: true });
    })
    .then(async () => {
      res.status(200).json({
        data: back.userModel,
      });
    })
    .catch((error) => res.jsonError(error));
};

module.exports = {
  createAdministrator,
  getAdministratorMe,
  createInitialRootAdministrator,
};
