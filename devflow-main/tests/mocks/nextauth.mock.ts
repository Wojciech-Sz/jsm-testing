const mockSession = {
  user: {
    id: "mock-user-1",
    name: "John Doe",
    email: "john.doe@example.com",
    image: "https://example.com/image.jpg",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

const mockAuth = jest.fn();
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

const mockHandlers = {
  GET: jest.fn(),
  POST: jest.fn(),
};

type MockUseSessionReturn = {
  data: typeof mockSession | null;
  status: "authenticated" | "unauthenticated" | "loading";
  update: jest.Mock;
};

const mockUseSession: jest.Mock<MockUseSessionReturn, []> = jest.fn(() => ({
  data: mockSession,
  status: "authenticated",
  update: jest.fn(),
}));

const mockGetSession = jest.fn();
const mockGetServerSession = jest.fn();
const mockSignInReact = jest.fn();
const mockSignOutReact = jest.fn();

const mockGitHub = jest.fn();
const mockGoogle = jest.fn();
const mockCredentials = jest.fn();

export {
  mockSession,
  mockAuth,
  mockSignIn,
  mockSignOut,
  mockHandlers,
  mockUseSession,
  mockGetSession,
  mockGetServerSession,
  mockSignInReact,
  mockSignOutReact,
  mockGitHub,
  mockGoogle,
  mockCredentials,
};
