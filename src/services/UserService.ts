import createHttpError from "http-errors";
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserRole } from "../types/auth";
import { UserData } from "../types/user";
import CredentialService from "./CredentialService";

class UserService {
  private userRepository: Repository<User>;
  private credentialService: CredentialService;

  constructor(
    userRepository: Repository<User>,
    credentialService: CredentialService
  ) {
    this.userRepository = userRepository;
    this.credentialService = credentialService;
  }

  async create(params: Partial<UserData>) {
    try {
      const doesUserExist = await this.userRepository.findOne({
        where: { email: params.email }
      });

      if (doesUserExist) {
        const error = createHttpError(
          400,
          "User with this email already exists"
        );
        throw error;
      }

      const hashedPassword = await this.credentialService.hashString(
        params.password!
      );

      const user = await this.userRepository.save({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        role: params.role || UserRole.Customer,
        password: hashedPassword,
        tenant: params.tenantId ? { id: params.tenantId } : undefined
      });

      return user;
    } catch (err) {
      if (err instanceof createHttpError.HttpError) {
        throw err;
      }

      const error = createHttpError(500, "Failed to create new user");
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email }
      });

      return user;
    } catch (err) {
      if (err instanceof createHttpError.HttpError) {
        throw err;
      }

      const error = createHttpError(500, "Failed to find user by email");
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: +id }
      });

      return user;
    } catch (err) {
      if (err instanceof createHttpError.HttpError) {
        throw err;
      }

      const error = createHttpError(500, "Failed to find user by id");
      throw error;
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();

      return users;
    } catch (err) {
      const error = createHttpError(500, "Failed to find all users");
      throw error;
    }
  }

  async update(id: string, params: Partial<UserData>) {
    try {
      const user = await this.findById(id);

      if (!user) {
        const error = createHttpError(404, `User with id ${id} not found`);
        throw error;
      }

      if (params.email) {
        const doesUserExist = await this.findByEmail(params.email);

        if (doesUserExist) {
          const error = createHttpError(
            400,
            "User with this email already exists"
          );
          throw error;
        }
      }

      // const updatedUser = await this.userRepository.update({ id: +id }, params);
      const updatedUser = await this.userRepository.save({
        ...user,
        ...params
      });

      return updatedUser;
    } catch (err) {
      if (err instanceof createHttpError.HttpError) {
        throw err;
      }

      const error = createHttpError(500, "Failed to update user");
      throw error;
    }
  }
}

export default UserService;
