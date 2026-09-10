<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Photos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar color="primary">
          <ion-title size="large">Photos</ion-title>
        </ion-toolbar>
      </ion-header>

      <photo-gallery-components />
      <camera-components />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import CameraComponents from '../components/CameraComponents.vue';
import PhotoGalleryComponents from '../components/PhotoGalleryComponents.vue';
</script>
