export interface JsonEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  meta: Record<string, unknown> | null;
}

export interface JsonViewModel {
  status: number;
  body: JsonEnvelope;
}

export interface JsonView {
  render(model: JsonViewModel): void;
}
