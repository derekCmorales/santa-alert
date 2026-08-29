import type { WorkshopBoardRequest } from "./WorkshopBoardRequest.js";
import type { WorkshopBoardResponse } from "./WorkshopBoardResponse.js";

export interface WorkshopBoardRequester {
  execute(request: WorkshopBoardRequest): Promise<WorkshopBoardResponse>;
}
