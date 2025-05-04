const SockJSMock = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

module.exports = SockJSMock;
