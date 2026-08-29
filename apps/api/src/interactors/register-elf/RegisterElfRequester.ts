import type { RegisterElfRequest } from "./RegisterElfRequest.js";
import type { RegisterElfResponse } from "./RegisterElfResponse.js";

export interface RegisterElfRequester {
  execute(request: RegisterElfRequest): Promise<RegisterElfResponse>;
}
