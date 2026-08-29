import { randomUUID } from "node:crypto";

export class ElfId {
  private constructor(readonly value: string) {}

  static create(value?: string): ElfId {
    return new ElfId(value ?? randomUUID());
  }
}
