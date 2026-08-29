import type { WorkshopBoardRequest } from "./WorkshopBoardRequest.js";
import type { WorkshopBoardRequester } from "./WorkshopBoardRequester.js";
import type { WorkshopBoardResponse } from "./WorkshopBoardResponse.js";

export class WorkshopBoardGenerator implements WorkshopBoardRequester {
  async execute(request: WorkshopBoardRequest): Promise<WorkshopBoardResponse> {
    return {
      greeting: `Bienvenido al taller, ${request.displayName}.`,
      stats: {
        sledsReady: 42,
        bearsPacked: 318,
        trainsInProgress: 17,
        elvesOnShift: 128,
      },
      toys: [
        {
          id: "toy-1",
          name: "Tren del Polo Norte",
          status: "en_progreso",
          workshop: "Línea Norte",
        },
        {
          id: "toy-2",
          name: "Oso de peluche nevado",
          status: "listo",
          workshop: "Empaque A",
        },
        {
          id: "toy-3",
          name: "Trineo miniatura",
          status: "pendiente",
          workshop: "Carpintería B",
        },
        {
          id: "toy-4",
          name: "Muñeca artesanal",
          status: "en_progreso",
          workshop: "Costura C",
        },
      ],
    };
  }
}
