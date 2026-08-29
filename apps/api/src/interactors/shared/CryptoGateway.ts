export interface GeneratedToken {
  raw: string;
  hash: string;
}

export interface CryptoGateway {
  hashPassword(plain: string): Promise<string>;
  verifyPassword(plain: string, hash: string): Promise<boolean>;
  generateVerificationToken(): GeneratedToken;
  hashVerificationToken(raw: string): string;
  now(): Date;
}
