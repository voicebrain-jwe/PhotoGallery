<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/items"></ion-back-button>
        </ion-buttons>
        <ion-title>Item Details</ion-title>
        <ion-buttons slot="end" v-if="item">
          <ion-button @click="router.push(`/items/${item.id}/edit`)">
            <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
          </ion-button>
          <ion-button color="danger" @click="confirmDelete">
            <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="state-container">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="!item" class="state-container">
        <ion-text color="medium">This item could not be found.</ion-text>
      </div>

      <template v-else>
        <div class="hero-wrap">
          <ion-img v-if="item.imgURL" :src="item.imgURL" class="hero-img" />
          <div v-else class="hero-placeholder">
            <ion-icon :icon="imageOutline"></ion-icon>
          </div>
        </div>

        <div class="content-pad">
          <div class="badges">
            <ion-badge :color="item.status === 'claimed' ? 'medium' : 'primary'">
              {{ item.status === 'claimed' ? 'Claimed' : 'Unclaimed' }}
            </ion-badge>
          </div>

          <h1>{{ item.itemName }}</h1>

          <ion-list lines="none" class="info-list">
            <ion-item>
              <ion-icon :icon="locationOutline" slot="start" color="medium"></ion-icon>
              <ion-label>{{ item.location }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="calendarOutline" slot="start" color="medium"></ion-icon>
              <ion-label>{{ formattedDate }}</ion-label>
            </ion-item>
          </ion-list>

          <h3>Description</h3>
          <p class="description">{{ item.description || 'No description provided.' }}</p>

          <div v-if="item.status === 'claimed'" class="claim-info">
            <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
            <span>Claimed by {{ item.claimedBy }}<template v-if="item.dateclaimed"> on {{ formattedClaimedDate }}</template></span>
          </div>
        </div>

        <div class="action-bar">
          <ion-button
            v-if="item.status !== 'claimed'"
            expand="block"
            @click="promptClaim"
          >
            <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
            Claim this item
          </ion-button>
          <ion-button v-else expand="block" fill="outline" @click="unclaim">
            Undo claim
          </ion-button>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { alertController, toastController } from '@ionic/vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonContent,
  IonImg,
  IonSpinner,
  IonText,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/vue';
import {
  createOutline,
  trashOutline,
  locationOutline,
  calendarOutline,
  checkmarkCircleOutline,
  imageOutline,
} from 'ionicons/icons';
import { useItems } from '@/composables/useItems';

const route = useRoute();
const router = useRouter();
const { items, loading, deleteItem, claimItem, unclaimItem } = useItems();

const itemId = computed(() => route.params.id as string);
const item = computed(() => items.value.find((i) => i.id === itemId.value));

const formattedDate = computed(() => {
  if (!item.value?.date) return '';
  const d = new Date(item.value.date);
  return isNaN(d.getTime()) ? item.value.date : d.toLocaleDateString();
});

const formattedClaimedDate = computed(() => {
  if (!item.value?.dateclaimed) return '';
  const d = new Date(item.value.dateclaimed);
  return isNaN(d.getTime()) ? item.value.dateclaimed : d.toLocaleDateString();
});

const confirmDelete = async () => {
  const alert = await alertController.create({
    header: 'Delete item?',
    message: 'This will permanently remove this item.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          if (!item.value) return;
          await deleteItem(item.value.id);
          router.replace('/items');
        },
      },
    ],
  });
  await alert.present();
};

const promptClaim = async () => {
  const alert = await alertController.create({
    header: 'Claim item',
    message: 'Enter your name so the reporter knows who claimed it.',
    inputs: [{ name: 'claimant', type: 'text', placeholder: 'Your name' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Claim',
        handler: async (data) => {
          const name = (data.claimant || '').trim();
          if (!name || !item.value) return false;
          await claimItem(item.value.id, name);
          const toast = await toastController.create({
            message: 'Item claimed successfully.',
            duration: 2000,
            color: 'success',
          });
          await toast.present();
          return true;
        },
      },
    ],
  });
  await alert.present();
};

const unclaim = async () => {
  if (!item.value) return;
  await unclaimItem(item.value.id);
};
</script>

<style scoped>
.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 80px;
}

.hero-wrap {
  margin: 12px 16px 0;
  border-radius: 16px;
  overflow: hidden;
}

.hero-img {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
}

.hero-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-accent-tint);
  border: 2px dashed var(--app-accent-border);
  border-radius: 16px;
}

.hero-placeholder ion-icon {
  font-size: 56px;
  color: var(--ion-color-primary);
}

.content-pad {
  padding: 16px;
  padding-bottom: 100px;
}

.badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

h1 {
  margin: 0 0 8px;
}

.info-list {
  margin: 8px 0;
}

.description {
  color: var(--ion-color-medium-shade);
  white-space: pre-wrap;
}

.claim-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--app-accent-tint);
  border-radius: 10px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: var(--ion-background-color);
}
</style>
