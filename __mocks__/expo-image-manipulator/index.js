const ImageManipulator = {
  manipulateAsync: jest.fn().mockImplementation(() => Promise.resolve({
    uri: 'mock-processed-image-uri'
  })),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  }
};

module.exports = ImageManipulator;
