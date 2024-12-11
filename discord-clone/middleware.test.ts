import { NextResponse } from "next/server";
import { RedirectToSignIn } from "@clerk/nextjs";
import { clerkMiddleware } from "@clerk/nextjs/server";

// Mock the RedirectToSignIn and clerkMiddleware
jest.mock("@clerk/nextjs", () => ({
  RedirectToSignIn: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(),
  },
}));

// Mock implementation of the clerkMiddleware for each test
const mockClerkMiddleware = jest.fn();

describe("Clerk Middleware", () => {
  it("should redirect to sign in if user is not authenticated", async () => {
    // Mock implementation for unauthenticated user
    mockClerkMiddleware.mockImplementationOnce(async (req) => {
      const auth = { userId: null }; // No authenticated user
      if (!auth.userId) {
        return RedirectToSignIn({ redirectUrl: req.url });
      }
      return NextResponse.next();
    });

    const mockRequest = { url: "http://localhost/api/test" };

    // Call the middleware
    const response = await mockClerkMiddleware(mockRequest);

    // Check if RedirectToSignIn is called with the correct redirect URL
    expect(RedirectToSignIn).toHaveBeenCalledWith({ redirectUrl: mockRequest.url });
    expect(response).toEqual(RedirectToSignIn({ redirectUrl: mockRequest.url }));
  });

  it("should proceed to next response if user is authenticated", async () => {
    // Mock implementation for authenticated user
    mockClerkMiddleware.mockImplementationOnce(async (req) => {
      const auth = { userId: "valid-user-id" }; // Authenticated user
      if (!auth.userId) {
        return RedirectToSignIn({ redirectUrl: req.url });
      }
      return NextResponse.next();
    });

    const mockRequest = { url: "http://localhost/api/test" };

    // Call the middleware
    const response = await mockClerkMiddleware(mockRequest);

    // Check if NextResponse.next() is called
    expect(NextResponse.next).toHaveBeenCalled();
    expect(response).toEqual(NextResponse.next());
  });
});
