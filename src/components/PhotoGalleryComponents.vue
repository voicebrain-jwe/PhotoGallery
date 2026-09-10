<template>
  <ion-grid>
    <ion-row>
      <ion-col size="6" v-for="photo in photos" :key="photo.filepath">
        <ion-img :src="photo.webviewPath"></ion-img>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import { IonGrid, IonRow, IonCol, IonImg } from '@ionic/vue';
import { usePhotoGallery } from '../composables/usePhotoGallery';

const { photos } = usePhotoGallery();
</script>
