import { Platform } from 'react-native';

/**
 * Converts an image to grayscale (black and white)
 * @param {string} uri - The URI of the image to convert
 * @returns {Promise<string>} - The URI of the converted image
 */
export const convertToGrayscale = async (uri) => {
  try {
    // For web, use Canvas API
    if (Platform.OS === 'web') {
      return await convertToGrayscaleWeb(uri);
    } 
    else {
      console.log('Native grayscale conversion not implemented yet, returning original image');
      return uri;
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
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        try {
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
        } catch (innerError) {
          console.error('Error processing image in canvas:', innerError);
          resolve(uri); // Fallback to original image
        }
      };
      
      img.onerror = (e) => {
        console.error('Error loading image for grayscale conversion:', e);
        resolve(uri); // Fallback to original image instead of rejecting
      };
      
      img.src = uri;
    } catch (outerError) {
      console.error('Unexpected error in grayscale conversion:', outerError);
      resolve(uri); // Fallback to original image
    }
  });
};
