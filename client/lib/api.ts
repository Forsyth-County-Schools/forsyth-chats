const API_URL = 'https://forsyth-chats.onrender.com';

export interface CreateRoomResponse {
  success: boolean;
  code?: string;
  school?: string;
  message?: string;
}

export interface RoomExistsResponse {
  success: boolean;
  exists: boolean;
  code?: string;
  createdAt?: string;
  message?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
  };
  room?: {
    code: string;
    createdAt: string;
  };
  message?: string;
}

export const api = {
  async createRoom(creatorName?: string, schoolData?: { schoolName: string; schoolCode: string }): Promise<CreateRoomResponse> {
    const response = await fetch(`${API_URL}/api/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        creatorName, 
        ...schoolData 
      }),
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

  async joinRoom(data: { roomCode: string; name: string }): Promise<JoinRoomResponse> {
    const response = await fetch(`${API_URL}/api/join-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join room');
    }

    return response.json();
  },
};
