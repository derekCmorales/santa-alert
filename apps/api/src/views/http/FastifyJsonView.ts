import type { FastifyReply } from "fastify";
import type { JsonView, JsonViewModel } from "../../presenters/json/JsonView.js";

export class FastifyJsonView implements JsonView {
  private model: JsonViewModel | null = null;

  constructor(private readonly reply: FastifyReply) {}

  render(model: JsonViewModel): void {
    this.model = model;
    void this.reply.status(model.status).send(model.body);
  }

  getModel(): JsonViewModel | null {
    return this.model;
  }
}

export function createFastifyJsonView(reply: FastifyReply): FastifyJsonView {
  return new FastifyJsonView(reply);
}
