const { Customer } = require("../../../../models");
const { validatorLogin } = require("../validators");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const {
  checkPassword,
  generateTokenCustomer,
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

    const customerModel = await Customer.findOne(criteria);

    if (!customerModel)
      throw new CustomError({
        status: 404,
        name: "Invalid",
        message: constants.response.INVALID_AUTH_CREDENTIAL,
      });

    const validPassword = await checkPassword(password, customerModel.password);

    if (!validPassword)
      throw new CustomError({
        status: 404,
        name: "Invalid",
        message: constants.response.INVALID_AUTH_CREDENTIAL,
      });

    const sessionToken = generateTokenCustomer({
      userId: customerModel.id,
    });

    const data = {
      jwt: sessionToken,
      user: {
        id: customerModel.id,
        name: customerModel.name,
        surname: customerModel.surname,
        email: customerModel.email,
        phone: customerModel.phone,
        created_at: customerModel.created_at,
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
