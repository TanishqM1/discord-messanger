import { POST } from './route';
import { StreamChat } from "stream-chat";

// Mock StreamChat and its methods
jest.mock("stream-chat", () => ({
  StreamChat: {
    getInstance: jest.fn(),
  },
}));

describe('POST /api/token', () => {
  const mockApiKey = 'test-api-key';
  const mockSecret = 'test-secret';

  beforeEach(() => {
    process.env.STREAM_API_KEY = mockApiKey;
    process.env.STREAM_SECRET = mockSecret;
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

  it('should return an error if userId is missing in the request body', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await POST(request);

    expect(response.status).toBe(500); // Adjust based on actual error handling
  });

  it('should call createToken and return a response with userId and token', async () => {
    const mockUserId = 'test-user-id';
    const mockToken = 'test-token';
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ userId: mockUserId }),
    });

    // Mock StreamChat.getInstance to return an object with createToken
    const mockCreateToken = jest.fn().mockReturnValue(mockToken);
    (StreamChat.getInstance as jest.Mock).mockReturnValue({
      createToken: mockCreateToken,
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(StreamChat.getInstance).toHaveBeenCalledWith(mockApiKey, mockSecret);
    expect(mockCreateToken).toHaveBeenCalledWith(mockUserId);

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      userId: mockUserId,
      token: mockToken,
    });
  });
});
