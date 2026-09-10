<template>
  <div class="item-photo-capture">
    <div class="photo-frame" :class="{ 'has-photo': !!displayUrl }" @click="!displayUrl && choose()">
      <ion-img v-if="displayUrl" :src="displayUrl" class="preview-img" />
      <div v-else class="photo-placeholder">
        <ion-icon :icon="cameraOutline"></ion-icon>
        <ion-text>Add a photo</ion-text>
      </div>

      <ion-button
        v-if="displayUrl"
        class="frame-btn retake-btn"
        size="small"
        shape="round"
        color="primary"
        @click.stop="choose()"
      >
        <ion-icon slot="icon-only" :icon="camera"></ion-icon>
      </ion-button>
      <ion-button
        v-if="displayUrl"
        class="frame-btn remove-btn"
        size="small"
        shape="round"
        fill="solid"
        color="dark"
        @click.stop="clear"
      >
        <ion-icon slot="icon-only" :icon="close"></ion-icon>
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonImg, IonButton, IonIcon, IonText } from '@ionic/vue';
import { camera, cameraOutline, close } from 'ionicons/icons';
import { CameraSource } from '@capacitor/camera';
import { useItemPhoto } from '@/composables/useItemPhoto';

const props = defineProps<{
  modelValue?: string | null;
  existingUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null | undefined): void;
}>();

const { capturePhoto } = useItemPhoto();

const displayUrl = computed(() => {
  if (props.modelValue !== undefined) return props.modelValue;
  return props.existingUrl;
});

const choose = async () => {
  try {
    const webPath = await capturePhoto(CameraSource.Prompt);
    if (webPath) emit('update:modelValue', webPath);
  } catch {
    // user cancelled the picker
  }
};

const clear = () => {
  emit('update:modelValue', null);
};
</script>

<style scoped>
.item-photo-capture {
  padding: 16px;
}

.photo-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  overflow: hidden;
  background: var(--app-accent-tint);
}

.photo-frame:not(.has-photo) {
  border: 2px dashed var(--app-accent-border);
  cursor: pointer;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-img::part(image) {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
  color: var(--ion-color-primary);
}

.photo-placeholder ion-icon {
  font-size: 36px;
}

.photo-placeholder ion-text {
  font-size: 14px;
  font-weight: 500;
}

.frame-btn {
  position: absolute;
  margin: 0;
  --box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.retake-btn {
  bottom: 10px;
  right: 10px;
}

.remove-btn {
  top: 10px;
  right: 10px;
  --background: rgba(15, 23, 42, 0.55);
}
</style>
