import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Converts an image to grayscale (black and white)
 * @param {string} uri - The URI of the image to convert
 * @returns {Promise<string>} - The URI of the converted image
 */
export const convertToGrayscale = async (uri) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.8,
        base64: false,
        manipulate: [
          {
            name: 'grayscale',
          },
        ],
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Error converting image to grayscale:', error);
    return uri; // Return original URI if conversion fails
  }
};
