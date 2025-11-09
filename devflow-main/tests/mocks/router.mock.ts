const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

const mockUseRouter = jest.fn(() => mockRouter);

export { mockRouter, mockUseRouter };
