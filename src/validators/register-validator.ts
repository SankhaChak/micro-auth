import { checkSchema } from "express-validator";

// const registerValidator = [
//   body("email")
//     .notEmpty()
//     .withMessage("Email is required!")
//     .isEmail()
//     .withMessage("Invalid email!")
// ];

const registerValidator = checkSchema({
  email: {
    notEmpty: {
      errorMessage: "Email is required!"
    },
    trim: true,
    isEmail: {
      errorMessage: "Invalid email!"
    }
  },
  password: {
    notEmpty: {
      errorMessage: "Password is required!"
    },
    trim: true,
    isLength: {
      errorMessage: "Password should be at least 6 chars long",
      options: { min: 8 }
    }
  }
});

export default registerValidator;
