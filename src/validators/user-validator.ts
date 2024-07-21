import { checkSchema } from "express-validator";
import { UserRole } from "../types/auth";

const createUserValidator = checkSchema({
  email: {
    trim: true,
    errorMessage: "Email is required!",
    notEmpty: true,
    isEmail: {
      errorMessage: "Email should be a valid email"
    }
  },
  firstName: {
    errorMessage: "First name is required!",
    notEmpty: true,
    trim: true
  },
  lastName: {
    errorMessage: "Last name is required!",
    notEmpty: true,
    trim: true
  },
  password: {
    trim: true,
    errorMessage: "Last name is required!",
    notEmpty: true,
    isLength: {
      options: {
        min: 8
      },
      errorMessage: "Password length should be at least 8 chars!"
    }
  },
  role: {
    errorMessage: "Role is required!",
    notEmpty: true,
    trim: true,
    isIn: {
      options: [UserRole.Manager],
      errorMessage: "Only manager role is allowed!"
    }
  },
  tenantId: {
    notEmpty: true,
    isInt: {
      errorMessage: "Tenant id should be an integer"
    }
  }
});

export const getUsersValidator = checkSchema(
  {
    // query: {
    //   page: {
    //     optional: true,
    //     isInt: {
    //       errorMessage: "Page should be an integer"
    //     }
    //   },
    //   limit: {
    //     optional: true,
    //     isInt: {
    //       errorMessage: "Limit should be an integer"
    //     }
    //   }
    // }
    role: {
      optional: true
    }
  },
  ["query"]
);

export const updateUserValidator = checkSchema({
  email: {
    optional: true,
    trim: true,
    isEmail: {
      errorMessage: "Should be a valid email"
    }
  },
  firstName: {
    optional: true,
    trim: true
  },
  lastName: {
    optional: true,
    trim: true
  },
  password: {
    optional: true,
    trim: true,
    isLength: {
      options: {
        min: 8
      },
      errorMessage: "Password length should be at least 8 chars!"
    }
  },
  role: {
    optional: true,
    trim: true,
    isIn: {
      options: [UserRole.Manager],
      errorMessage: "Only manager role is allowed!"
    }
  }
});

export default createUserValidator;
