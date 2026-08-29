import type { WorkshopBoardRequester } from "../../interactors/workshop-board/WorkshopBoardRequester.js";
import type { JsonWorkshopPresenter } from "../../presenters/json/JsonWorkshopPresenter.js";
import type { SessionTokenVerifier } from "../../infrastructure/auth/SessionTokenVerifier.js";

export class WorkshopController {
  constructor(
    private readonly requester: WorkshopBoardRequester,
    private readonly presenter: JsonWorkshopPresenter,
    private readonly tokenVerifier: SessionTokenVerifier,
  ) {}

  async handle(authorizationHeader?: string): Promise<void> {
    const claims = await this.tokenVerifier.verifyFromHeader(authorizationHeader);
    if (!claims) {
      this.presenter.presentUnauthorized();
      return;
    }

    const board = await this.requester.execute({
      elfId: claims.elfId,
      email: claims.email,
      displayName: claims.displayName,
    });

    this.presenter.present(board);
  }
}
