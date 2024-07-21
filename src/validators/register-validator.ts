import { checkSchema } from "express-validator";
import { UserRole } from "../types/auth";

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
  },
  firstName: {
    notEmpty: {
      errorMessage: "First name is required!"
    },
    trim: true
  },
  lastName: {
    notEmpty: {
      errorMessage: "Last name is required!"
    },
    trim: true
  },
  role: {
    optional: true,
    trim: true,
    isIn: {
      options: [[UserRole.Customer]],
      errorMessage: "Invalid role!"
    }
  }
});

export default registerValidator;
