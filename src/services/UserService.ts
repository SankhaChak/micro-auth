import createHttpError from "http-errors";
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData, UserRole } from "../types/auth";
import HashService from "./HashService";

class UserService {
  private userRepository: Repository<User>;
  private hashService: HashService;

  constructor(userRepository: Repository<User>, hashService: HashService) {
    this.userRepository = userRepository;
    this.hashService = hashService;
  }

  async create(params: UserData) {
    try {
      const hashedPassword = await this.hashService.hashString(params.password);

      const user = await this.userRepository.save({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        role: UserRole.Customer,
        password: hashedPassword
      });

      return user;
    } catch (err) {
      const error = createHttpError(500, "Failed to create new user");
      throw error;
    }
  }
}

export default UserService;
