import type { WorkshopBoardResponse } from "../../interactors/workshop-board/WorkshopBoardResponse.js";
import type { JsonView } from "./JsonView.js";

export class JsonWorkshopPresenter {
  constructor(private readonly view: JsonView) {}

  present(board: WorkshopBoardResponse): void {
    this.view.render({
      status: 200,
      body: {
        success: true,
        data: board,
        error: null,
        meta: null,
      },
    });
  }

  presentUnauthorized(): void {
    this.view.render({
      status: 401,
      body: {
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "Necesitas credenciales de elfo verificado.",
        },
        meta: null,
      },
    });
  }
}
