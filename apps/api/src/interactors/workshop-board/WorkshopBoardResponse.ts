export interface WorkshopBoardRequest {
  elfId: string;
  email: string;
  displayName: string;
}

export interface WorkshopToy {
  id: string;
  name: string;
  status: "en_progreso" | "listo" | "pendiente";
  workshop: string;
}

export interface WorkshopBoardResponse {
  greeting: string;
  stats: {
    sledsReady: number;
    bearsPacked: number;
    trainsInProgress: number;
    elvesOnShift: number;
  };
  toys: WorkshopToy[];
}
