import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/firebase";
import { Attachment } from "../types";

export const uploadService = {
  uploadFile: async (file: File, userId: string): Promise<Attachment> => {
    try {
      // Path: users/{userId}/notes/{timestamp}_{filename}
      // sanitize filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `users/${userId}/notes/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, path);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      return {
        id: path, // Use storage path as ID to easily delete later
        name: file.name,
        url: url,
        type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'other',
        size: file.size
      };
    } catch (error) {
      console.error("Upload failed", error);
      throw new Error("Failed to upload file. Check your connection.");
    }
  },

  deleteFile: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Delete failed", error);
      // We don't throw here to allow UI to remove the link even if storage delete fails
    }
  }
};