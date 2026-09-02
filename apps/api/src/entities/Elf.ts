import { AccountStatus } from "./AccountStatus.js";
import { AccountNotVerifiedError } from "./errors/AccountNotVerifiedError.js";
import { ValidationError } from "./errors/ValidationError.js";
import { Email } from "./Email.js";
import { ElfId } from "./ElfId.js";
import {
  registerDisplayNameRule,
  registerPasswordRule,
} from "./validation/registerFormPolicy.js";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export interface ElfProps {
  id: ElfId;
  email: Email;
  displayName: string;
  passwordHash: string;
  status: AccountStatus;
  verificationTokenHash: string | null;
  verificationExpiresAt: Date | null;
}

export class Elf {
  private constructor(private readonly props: ElfProps) {}

  static register(input: {
    email: Email;
    displayName: string;
    passwordHash: string;
    verificationTokenHash: string;
    verificationExpiresAt: Date;
  }): Elf {
    const nameIssue = registerDisplayNameRule.validate(input.displayName);
    if (nameIssue) {
      throw new ValidationError(nameIssue.code, nameIssue.message);
    }
    const name = input.displayName.trim();

    return new Elf({
      id: ElfId.create(),
      email: input.email,
      displayName: name,
      passwordHash: input.passwordHash,
      status: AccountStatus.UNVERIFIED,
      verificationTokenHash: input.verificationTokenHash,
      verificationExpiresAt: input.verificationExpiresAt,
    });
  }

  static reconstitute(props: ElfProps): Elf {
    return new Elf(props);
  }

  static validatePassword(plain: string): void {
    const issue = registerPasswordRule.validate(plain);
    if (issue) {
      throw new ValidationError(issue.code, issue.message);
    }
  }

  static verificationExpiryFrom(now: Date): Date {
    return new Date(now.getTime() + VERIFICATION_TTL_MS);
  }

  get id(): ElfId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get status(): AccountStatus {
    return this.props.status;
  }

  get verificationTokenHash(): string | null {
    return this.props.verificationTokenHash;
  }

  get verificationExpiresAt(): Date | null {
    return this.props.verificationExpiresAt;
  }

  assertCanLogin(): void {
    if (this.props.status !== AccountStatus.VERIFIED) {
      throw new AccountNotVerifiedError();
    }
  }

  matchesVerificationTokenHash(hash: string, now: Date): boolean {
    if (!this.props.verificationTokenHash || !this.props.verificationExpiresAt) {
      return false;
    }
    if (this.props.verificationExpiresAt.getTime() < now.getTime()) {
      return false;
    }
    return this.props.verificationTokenHash === hash;
  }

  verify(now: Date): Elf {
    if (this.props.status === AccountStatus.VERIFIED) {
      return this;
    }
    return new Elf({
      ...this.props,
      status: AccountStatus.VERIFIED,
      verificationTokenHash: null,
      verificationExpiresAt: null,
    });
  }

  toProps(): ElfProps {
    return { ...this.props };
  }
}
