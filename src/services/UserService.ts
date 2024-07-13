import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types/auth";

class UserService {
  private userRepository: Repository<User>;

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  async create(params: UserData) {
    await this.userRepository.save({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName
    });
  }
}

export default UserService;
