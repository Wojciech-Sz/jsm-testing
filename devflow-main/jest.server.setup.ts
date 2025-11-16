import "@testing-library/jest-dom";
import { connectDB, disconnectDB, clearDB, isDBConnected } from "@/tests/config/db-integration";
import { mockAuth } from "@/tests/mocks";

jest.mock("@/auth", () => ({
  auth: mockAuth,
}));

// Set default mock behavior
mockAuth.mockResolvedValue({ user: null });

beforeAll(async () => {
  await connectDB();
}, 30000);

beforeEach(async () => {
  if (isDBConnected()) await clearDB();
}, 10000);

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  await clearDB();
});

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});
