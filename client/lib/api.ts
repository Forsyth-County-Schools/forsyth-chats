const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:4000' 
  : 'https://forsyth-chats.onrender.com';

export const SERVER_URL = API_URL;

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

export interface UserProfile {
  clerkId: string;
  email: string;
  displayName: string;
  profileImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

export const api = {
  async createRoom(creatorName?: string): Promise<CreateRoomResponse> {
    const response = await fetch(`${API_URL}/api/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        creatorName
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

  // User management APIs
  async createOrUpdateUser(userData: {
    clerkId: string;
    email: string;
    displayName: string;
    profileImageUrl?: string;
  }): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create/update user');
    }

    return response.json();
  },

  async getUser(clerkId: string): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/api/users/${clerkId}`);

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user');
    }

    return response.json();
  },

  async updateUser(clerkId: string, updates: {
    displayName?: string;
    profileImageUrl?: string | null;
  }): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/api/users/${clerkId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  },
};
