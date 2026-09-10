<template>
  <div class="item-photo-capture">
    <div class="photo-frame" :class="{ 'has-photo': !!displayUrl }" @click="!displayUrl && choose()">
      <ion-img v-if="displayUrl" :src="displayUrl" class="preview-img" />
      <ion-icon v-else :icon="cameraOutline"></ion-icon>

      <ion-button
        v-if="displayUrl"
        class="frame-btn retake-btn"
        shape="round"
        color="primary"
        @click.stop="choose()"
      >
        <ion-icon slot="icon-only" :icon="camera"></ion-icon>
      </ion-button>
      <ion-button
        v-if="displayUrl"
        class="frame-btn remove-btn"
        shape="round"
        fill="solid"
        color="dark"
        @click.stop="clear"
      >
        <ion-icon slot="icon-only" :icon="close"></ion-icon>
      </ion-button>
    </div>

    <ion-text v-if="!displayUrl" class="hint-text" color="medium">Tap to add a photo</ion-text>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.photo-frame {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 20px;
  overflow: hidden;
  background: var(--app-accent-tint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-frame:not(.has-photo) {
  border: 2px dashed var(--app-accent-border);
  cursor: pointer;
}

.photo-frame > ion-icon {
  font-size: 30px;
  color: var(--ion-color-primary);
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

.hint-text {
  font-size: 12px;
}

.frame-btn {
  position: absolute;
  margin: 0;
  width: 26px;
  height: 26px;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
}

.frame-btn ion-icon {
  font-size: 14px;
}

.retake-btn {
  bottom: -4px;
  right: -4px;
}

.remove-btn {
  top: -4px;
  right: -4px;
  --background: rgba(15, 23, 42, 0.7);
}
</style>
