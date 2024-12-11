import { POST } from './route';
import { clerkClient } from "@clerk/nextjs/server";
import { StreamChat } from "stream-chat";

jest.mock("@clerk/nextjs/server", () => ({
  clerkClient: jest.fn(() => ({
    users: {
      updateUser: jest.fn(),
    },
  })),
}));

jest.mock("stream-chat", () => ({
  StreamChat: {
    getInstance: jest.fn(() => ({
      upsertUser: jest.fn(),
    })),
  },
}));

describe('POST /api/register-user', () => {
  const mockApiKey = 'test-api-key';
  const mockSecret = 'test-secret';

  beforeEach(() => {
    process.env.STREAM_API_KEY = mockApiKey;
    process.env.STREAM_CHAT_SECRET = mockSecret;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error if STREAM_API_KEY is not set', async () => {
    delete process.env.STREAM_API_KEY;

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(500); // Adjust based on actual error handling
  });

  it('should return an error if userId or email is missing in the request body', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await POST(request);

    expect(response.status).toBe(500); // Adjust based on actual error handling
  });

  it('should call updateUser and upsertUser and return a response with userId and userName', async () => {
    const mockUserId = 'test-user-id';
    const mockEmail = 'test@example.com';
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ userId: mockUserId, email: mockEmail }),
    });

    // Mock implementations for Clerk and StreamChat functions
    const mockUpsertUser = jest.fn().mockResolvedValue({ id: mockUserId });

    const mockUpdateUser = jest.fn().mockResolvedValue({ id: mockUserId });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(mockUpsertUser).toHaveBeenCalledWith({
      id: mockUserId,
      role: 'user',
      name: mockEmail,
      image: expect.stringContaining(mockUserId),
    });

    expect(mockUpdateUser).toHaveBeenCalledWith(mockUserId, {
      publicMetaData: { streamRegistered: true },
    });

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      userId: mockUserId,
      userName: mockEmail,
    });
  });
});
