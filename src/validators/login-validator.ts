import { checkSchema } from "express-validator";

const loginValidator = checkSchema({
  email: {
    notEmpty: {
      errorMessage: "Email is required!"
    },
    trim: true
    // isEmail: {
    //   errorMessage: "Invalid email!"
    // }
  },
  password: {
    notEmpty: {
      errorMessage: "Password is required!"
    },
    trim: true
  }
});

export default loginValidator;
