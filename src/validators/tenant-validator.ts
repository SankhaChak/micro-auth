import { checkSchema } from "express-validator";

const createTenantValidator = checkSchema({
  name: {
    notEmpty: {
      errorMessage: "Name is required!"
    },
    trim: true
  },
  address: {
    notEmpty: {
      errorMessage: "Address is required!"
    },
    trim: true
  }
});

export default createTenantValidator;
