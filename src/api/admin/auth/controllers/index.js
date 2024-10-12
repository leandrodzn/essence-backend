const { Administrator } = require("../../../../models");
const { validatorLogin } = require("../validators");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const {
  checkPassword,
  generateTokenAdministrator,
} = require("../../../../config/auth");
const { Op } = require("sequelize");

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const authLogin = async (req, res) => {
  try {
    // Validate front data
    await validatorLogin(req);

    const { email, password } = req.body;

    const criteria = {
      where: {
        [Op.and]: [
          { email: { [Op.ne]: null } },
          {
            email: { [Op.eq]: email },
          },
        ],
      },
    };

    const administratorModel = await Administrator.findOne(criteria);

    if (!administratorModel)
      throw new CustomError({
        status: 404,
        name: "Invalid",
        message: constants.response.INVALID_AUTH_CREDENTIAL,
      });

    const validPassword = await checkPassword(
      password,
      administratorModel.password
    );

    if (!validPassword)
      throw new CustomError({
        status: 404,
        name: "Invalid",
        message: constants.response.INVALID_AUTH_CREDENTIAL,
      });

    const sessionToken = generateTokenAdministrator({
      userId: administratorModel.id,
    });

    const data = {
      jwt: sessionToken,
      user: {
        id: administratorModel.id,
        name: administratorModel.name,
        surname: administratorModel.surname,
        email: administratorModel.email,
        created_at: administratorModel.created_at,
      },
    };

    res.status(200).json({
      status: "OK",
      data: data,
    });
  } catch (error) {
    res.jsonError(error);
  }
};

module.exports = {
  authLogin,
};
