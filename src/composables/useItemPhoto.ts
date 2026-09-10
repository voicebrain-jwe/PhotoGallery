import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function useItemPhoto() {
  // No Firebase Storage on the Spark (free) plan, so photos are captured as
  // base64 data URLs and stored directly on the item record in the Realtime Database.
  const capturePhoto = async (source: CameraSource = CameraSource.Prompt): Promise<string | undefined> => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source,
      quality: 70,
      width: 1000,
    });
    if (!photo.base64String) return undefined;
    return `data:image/jpeg;base64,${photo.base64String}`;
  };

  return { capturePhoto };
}
