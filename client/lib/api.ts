const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CreateRoomResponse {
  success: boolean;
  code?: string;
  message?: string;
}

export interface RoomExistsResponse {
  success: boolean;
  exists: boolean;
  code?: string;
  createdAt?: string;
  message?: string;
}

export const api = {
  async createRoom(creatorName?: string): Promise<CreateRoomResponse> {
    const response = await fetch(`${API_URL}/api/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create room');
    }

    return response.json();
  },

  async checkRoom(code: string): Promise<RoomExistsResponse> {
    const response = await fetch(`${API_URL}/api/room/${code.toUpperCase()}`);

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check room');
    }

    return response.json();
  },
};
