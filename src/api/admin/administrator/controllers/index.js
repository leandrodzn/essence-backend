const { Administrator } = require("../../../../models");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const { validatorCreateAdministrator } = require("../validators");
const { hashPasswordAdministrator } = require("../../../../config/auth");

const cleanUser = (administratorModel) => {
  const administratorObject = administratorModel.get({ plain: true });

  delete administratorObject.password;
  delete administratorObject.reset_password_token;

  return administratorObject;
};

// const createInitialRootAdministrator = async (req, res) => {
//   const back = {};

//   return Promise.resolve()
//     .then(async () => {
//       await validatorCreateRootUser(req);
//     })
//     .then(async () => {
//       const criteria = {
//         where: {
//           email: "root@mail.com",
//           username: "root",
//         },
//         defaults: {
//           name: "Super",
//           surname: "Root",
//           email: "root@mail.com",
//           username: "root",
//           password: await hashPassword("uKe|nP=d?s73<l$pF'@j"),
//           type: "root",
//         },
//       };

//       const userModel = await User.findOrCreate(criteria);

//       back.userModel = userModel[0];
//       back.userModelCreated = userModel[1];
//     })
//     .then(async () => {
//       res.status(200).json({
//         data: {
//           ...back,
//         },
//       });
//     })
//     .catch((error) => res.jsonError(error));
// };

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
      (transaction?.finished || transaction.finished !== "commit")
    )
      await transaction.rollback();

    res.jsonError(error);
  }
};

module.exports = {
  createAdministrator,
};
