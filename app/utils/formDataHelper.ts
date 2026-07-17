// utils/formDataHelper.ts
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const createMultipartFormData = async (data: Record<string, any>): Promise<FormData> => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (key === 'checkInImage' || key === 'checkOutImage') {
      // Handle image file
      if (value && typeof value === 'object' && 'uri' in value) {
        const fileInfo = await FileSystem.getInfoAsync(value.uri);
        if (fileInfo.exists) {
          const filename = value.name || `image-${Date.now()}.jpg`;
          const mimeType = value.type || 'image/jpeg';
          
          // For React Native, we need to handle file upload differently
          // Using the uri directly as blob
          const response = await fetch(value.uri);
          const blob = await response.blob();
          
          formData.append(key, blob, filename);
        }
      }
    } else if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false');
    } else if (typeof value === 'number') {
      formData.append(key, value.toString());
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
};