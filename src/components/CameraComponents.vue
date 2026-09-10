<template>
  <ion-fab vertical="bottom" horizontal="center" slot="fixed">
    <ion-fab-button @click="takePhoto">
      <ion-icon :icon="camera"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import { IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { camera } from 'ionicons/icons';
import { usePhotoGallery } from '../composables/usePhotoGallery';

const { takePhoto } = usePhotoGallery();
</script>
