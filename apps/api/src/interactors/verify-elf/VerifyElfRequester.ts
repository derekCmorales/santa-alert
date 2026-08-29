import type { VerifyElfRequest } from "./VerifyElfRequest.js";
import type { VerifyElfResponse } from "./VerifyElfResponse.js";

export interface VerifyElfRequester {
  execute(request: VerifyElfRequest): Promise<VerifyElfResponse>;
}
