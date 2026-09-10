<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Lost &amp; Found</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleAdmin">
            <ion-icon slot="icon-only" :icon="isAdmin ? shieldCheckmark : shieldOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search items..."
          :debounce="200"
        ></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="typeFilter" scrollable>
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="found">
            <ion-label>Found</ion-label>
          </ion-segment-button>
          <ion-segment-button value="lost">
            <ion-label>Lost</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
      <ion-toolbar v-if="typeFilter !== 'lost'">
        <ion-segment v-model="statusFilter" scrollable>
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="unclaimed">
            <ion-label>Unclaimed</ion-label>
          </ion-segment-button>
          <ion-segment-button value="pending">
            <ion-label>Pending</ion-label>
          </ion-segment-button>
          <ion-segment-button value="claimed">
            <ion-label>Claimed</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="state-container">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="filteredItems.length === 0" class="state-container">
        <ion-icon :icon="searchOutline" class="state-icon"></ion-icon>
        <ion-text color="medium">No items match your search/filter.</ion-text>
      </div>

      <ion-list v-else>
        <item-card
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @click="goToDetail(item.id)"
        />
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="router.push('/items/new')">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { alertController, toastController } from '@ionic/vue';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonIcon,
  IonSpinner,
  IonText,
  IonFab,
  IonFabButton,
} from '@ionic/vue';
import { add, searchOutline, shieldOutline, shieldCheckmark } from 'ionicons/icons';
import { useItems } from '@/composables/useItems';
import { useAdmin } from '@/composables/useAdmin';
import ItemCard from '@/components/ItemCard.vue';

const router = useRouter();
const { items, loading } = useItems();
const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();

const searchQuery = ref('');
const typeFilter = ref<'all' | 'found' | 'lost'>('all');
const statusFilter = ref<'all' | 'unclaimed' | 'pending' | 'claimed'>('all');

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return items.value.filter((item) => {
    if (typeFilter.value !== 'all' && item.type !== typeFilter.value) return false;
    if (typeFilter.value !== 'lost' && statusFilter.value !== 'all' && item.status !== statusFilter.value) return false;
    if (q) {
      const haystack = `${item.itemName} ${item.description} ${item.location}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
});

const goToDetail = (id: string) => {
  router.push(`/items/${id}`);
};

const toggleAdmin = async () => {
  if (isAdmin.value) {
    const alert = await alertController.create({
      header: 'Log out admin?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Log out', handler: () => logoutAdmin() },
      ],
    });
    await alert.present();
    return;
  }

  const alert = await alertController.create({
    header: 'Admin login',
    message: 'Enter the admin PIN.',
    inputs: [{ name: 'pin', type: 'password', placeholder: 'PIN' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Login',
        handler: async (data) => {
          if (!loginAdmin((data.pin || '').trim())) {
            const toast = await toastController.create({
              message: 'Incorrect PIN.',
              duration: 1800,
              color: 'danger',
            });
            await toast.present();
            return false;
          }
          const toast = await toastController.create({
            message: 'Admin mode enabled.',
            duration: 1800,
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
</script>

<style scoped>
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 80px;
}

.state-icon {
  font-size: 48px;
  color: var(--ion-color-medium);
}
</style>
