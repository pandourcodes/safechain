// src/services/fileHelpers.js
import * as FileSystem from 'expo-file-system/legacy';

let ImageManipulator = null;
try {
  ImageManipulator = require('expo-image-manipulator');
} catch (e) {
  console.warn('[fileHelpers] expo-image-manipulator not loaded yet, using raw fallback.');
}

/**
 * Standard safe base64 reader
 */
export async function uriToBase64(uri) {
  if (!uri) return null;
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.warn('[uriToBase64] Error:', error);
    return null;
  }
}

/**
 * Resizes and compresses image so it fits comfortably within Firestore limits (<100KB)
 */
export async function compressPhotoToBase64(uri) {
  if (!uri) return null;
  try {
    if (ImageManipulator && ImageManipulator.manipulateAsync) {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 640 } }],
        {
          compress: 0.3,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      if (manipResult && manipResult.base64) {
        return manipResult.base64;
      }
    }
    // Fallback if manipulator is not initialized
    return await uriToBase64(uri);
  } catch (err) {
    console.warn('[compressPhotoToBase64] Compression warning, falling back to raw:', err);
    return await uriToBase64(uri);
  }
}