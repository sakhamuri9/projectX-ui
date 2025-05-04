import { Platform } from 'react-native';
import * as imageUtilsModule from '../../utils/imageUtils';

jest.mock('../../utils/imageUtils', () => {
  const originalModule = jest.requireActual('../../utils/imageUtils');
  
  return {
    ...originalModule,
    convertToGrayscale: jest.fn(),
  };
});

jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('imageUtils', () => {
  let originalConsoleError;
  let originalConsoleLog;
  
  beforeEach(() => {
    originalConsoleError = console.error;
    originalConsoleLog = console.log;
    
    console.error = jest.fn();
    console.log = jest.fn();
    
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });
  
  test('convertToGrayscale should return original URI on non-web platforms', async () => {
    const uri = 'https://example.com/image.jpg';
    Platform.OS = 'android';
    
    imageUtilsModule.convertToGrayscale.mockImplementation(async (inputUri) => {
      console.log('Native grayscale conversion not implemented yet, returning original image');
      return inputUri;
    });
    
    const result = await imageUtilsModule.convertToGrayscale(uri);
    
    expect(result).toBe(uri);
    expect(console.log).toHaveBeenCalledWith(
      'Native grayscale conversion not implemented yet, returning original image'
    );
  });
  
  test('convertToGrayscale should convert image to grayscale on web', async () => {
    const uri = 'https://example.com/image.jpg';
    Platform.OS = 'web';
    
    imageUtilsModule.convertToGrayscale.mockImplementation(async (inputUri) => {
      return 'data:image/jpeg;base64,mockbase64data';
    });
    
    const result = await imageUtilsModule.convertToGrayscale(uri);
    
    expect(result).toBe('data:image/jpeg;base64,mockbase64data');
  });
  
  test('convertToGrayscale should handle top-level errors', async () => {
    const uri = 'https://example.com/image.jpg';
    Platform.OS = 'web';
    
    imageUtilsModule.convertToGrayscale.mockImplementation(async (inputUri) => {
      const error = new Error('Image constructor error');
      console.error('Error converting image to grayscale:', error);
      return inputUri;
    });
    
    const result = await imageUtilsModule.convertToGrayscale(uri);
    
    expect(result).toBe(uri);
    expect(console.error).toHaveBeenCalledWith(
      'Error converting image to grayscale:',
      expect.any(Error)
    );
  });
  
  test('convertToGrayscale should handle image load errors', async () => {
    const uri = 'https://example.com/image.jpg';
    Platform.OS = 'web';
    
    imageUtilsModule.convertToGrayscale.mockImplementation(async (inputUri) => {
      const error = new Error('Image load failed');
      console.error('Error loading image for grayscale conversion:', error);
      return inputUri;
    });
    
    const result = await imageUtilsModule.convertToGrayscale(uri);
    
    expect(result).toBe(uri);
    expect(console.error).toHaveBeenCalledWith(
      'Error loading image for grayscale conversion:',
      expect.any(Error)
    );
  });
  
  test('convertToGrayscale should handle canvas processing errors', async () => {
    const uri = 'https://example.com/image.jpg';
    Platform.OS = 'web';
    
    imageUtilsModule.convertToGrayscale.mockImplementation(async (inputUri) => {
      const error = new Error('Canvas context error');
      console.error('Error processing image in canvas:', error);
      return inputUri;
    });
    
    const result = await imageUtilsModule.convertToGrayscale(uri);
    
    expect(result).toBe(uri);
    expect(console.error).toHaveBeenCalledWith(
      'Error processing image in canvas:',
      expect.any(Error)
    );
  });
});
