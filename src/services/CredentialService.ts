import bcrypt from "bcrypt";

class CredentialService {
  private saltRounds: number = 10;

  constructor(saltRounds?: number) {
    if (saltRounds) {
      this.saltRounds = saltRounds;
    }
  }

  async hashString(plainString: string): Promise<string> {
    return await bcrypt.hash(plainString, this.saltRounds);
  }

  async compareStrings(
    plainString: string,
    hashedString: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainString, hashedString);
  }
}

export default CredentialService;
