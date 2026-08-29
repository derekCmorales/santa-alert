import type { Email } from "../../entities/Email.js";
import type { Elf } from "../../entities/Elf.js";
import type { ElfId } from "../../entities/ElfId.js";

export interface ElfAccountGateway {
  findById(id: ElfId): Promise<Elf | null>;
  findByEmail(email: Email): Promise<Elf | null>;
  findByVerificationTokenHash(hash: string): Promise<Elf | null>;
  save(elf: Elf): Promise<void>;
}
