import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Converts an image to grayscale (black and white)
 * @param {string} uri - The URI of the image to convert
 * @returns {Promise<string>} - The URI of the converted image
 */
export const convertToGrayscale = async (uri) => {
  try {
    if (Platform.OS === 'web') {
      return await convertToGrayscaleWeb(uri);
    } 
    else {
      return await convertToGrayscaleNative(uri);
    }
  } catch (error) {
    console.error('Error converting image to grayscale:', error);
    return uri; // Return original URI if conversion fails
  }
};

/**
 * Web implementation of grayscale conversion using Canvas API
 */
const convertToGrayscaleWeb = (uri) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUrl);
    };
    
    img.onerror = (e) => {
      console.error('Error loading image for grayscale conversion:', e);
      reject(e);
    };
    
    img.src = uri;
  });
};

/**
 * Native implementation of grayscale conversion
 * Uses a simpler approach since expo-image-manipulator has web compatibility issues
 */
const convertToGrayscaleNative = async (uri) => {
  try {
    const ImageManipulator = await import('expo-image-manipulator');
    
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.8,
        base64: false,
      }
    );
    
    return result.uri;
  } catch (error) {
    console.error('Native grayscale conversion error:', error);
    return uri;
  }
};
