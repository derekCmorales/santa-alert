import type { LoginElfRequest } from "./LoginElfRequest.js";
import type { LoginElfResponse } from "./LoginElfResponse.js";

export interface LoginElfRequester {
  execute(request: LoginElfRequest): Promise<LoginElfResponse>;
}
