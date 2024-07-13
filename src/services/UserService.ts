import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types/auth";

class UserService {
  private userRepository: Repository<User>;

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  async create(params: UserData) {
    const user = await this.userRepository.save({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName
    });

    return user;
  }
}

export default UserService;
