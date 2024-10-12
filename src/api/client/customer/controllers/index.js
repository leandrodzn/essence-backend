const { Customer } = require("../../../../models");
const constants = require("../../../../utils/constants");
const Database = require("../../../../config/database");
const { validatorCreateCustomer } = require("../validators");
const { hashPasswordCustomer } = require("../../../../config/auth");
const { Op } = require("sequelize");

const cleanUser = (customerModel) => {
  const customerObject = customerModel.get({ plain: true });

  delete customerObject.password;
  delete customerObject.reset_password_token;

  return customerObject;
};

const createCustomer = async (req, res) => {
  let transaction;
  try {
    // Validate front data
    await validatorCreateCustomer(req);

    // validate username
    const criteria = {
      where: {
        email: { [Op.like]: req.body.email },
      },
    };

    let customerModel = await Customer.findOne(criteria);

    if (customerModel)
      throw new CustomError({
        status: 400,
        name: "EmailInvalid",
        message: constants.response.EMAIL_INVALID,
      });

    transaction = await Database.transaction();

    const { name, surname, phone, email, password } = req.body;

    const hashedPassword = await hashPasswordCustomer(password);

    customerModel = await Customer.create(
      {
        name,
        surname,
        phone,
        email,
        password: hashedPassword,
      },
      { transaction }
    );

    await transaction.commit();

    customerModel = cleanUser(customerModel);

    res.status(201).json({
      status: "OK",
      data: customerModel,
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

module.exports = {
  createCustomer,
};
