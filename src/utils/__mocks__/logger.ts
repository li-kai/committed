export default {
  fatal: jest.fn((message) => {
    throw new Error(message);
  }),
  debug: jest.fn(),
};
