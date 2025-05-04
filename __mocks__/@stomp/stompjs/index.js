const ClientMock = jest.fn().mockImplementation(() => ({
  activate: jest.fn(),
  deactivate: jest.fn(),
  subscribe: jest.fn().mockReturnValue({
    unsubscribe: jest.fn(),
  }),
  publish: jest.fn(),
}));

module.exports = {
  Client: ClientMock,
};
