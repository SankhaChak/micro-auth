import bcrypt from "bcryptjs";

class CredentialService {
  private saltRounds: number = 10;

  constructor(saltRounds?: number) {
    if (saltRounds) {
      this.saltRounds = saltRounds;
    }
  }

  async hashString(plainString: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(plainString, salt);
  }

  async compareStrings(
    plainString: string,
    hashedString: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainString, hashedString);
  }
}

export default CredentialService;
