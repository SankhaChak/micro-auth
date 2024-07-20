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

export const updateTenantValidator = checkSchema({
  name: {
    optional: true,
    trim: true
  },
  address: {
    optional: true,
    trim: true
  },
  "*": {
    custom: {
      options: (_value, { req }) => {
        const allowedFields = ["name", "address"];
        const fields = Object.keys(req.body);
        const invalidFields = fields.filter(
          (field) => !allowedFields.includes(field)
        );

        if (invalidFields.length) {
          throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
        }

        const validFieldsLength = fields.length - invalidFields.length;

        if (!validFieldsLength) {
          throw new Error("No fields provided!");
        }

        return true;
      }
    }
  }
});

export default createTenantValidator;
