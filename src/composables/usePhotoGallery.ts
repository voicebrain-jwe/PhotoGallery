import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

const photos = ref<UserPhoto[]>([]);

export function usePhotoGallery() {
  const takePhoto = async () => {
    const capturedPhoto: Photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = new Date().getTime() + '.jpeg';
    photos.value = [
      { filepath: fileName, webviewPath: capturedPhoto.webPath },
      ...photos.value,
    ];
  };

  return {
    photos,
    takePhoto,
  };
}
