export interface Message {
    id: string;
    content: string;

    user: {
      name?: string | null;
      email?: string | null;

    };
    spaceId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface SendMessagePayload {
    content: string;
    spaceId: string;
  }