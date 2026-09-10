<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Lost &amp; Found</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search items..."
          :debounce="200"
        ></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="statusFilter">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="unclaimed">
            <ion-label>Unclaimed</ion-label>
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
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
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
import { add, searchOutline } from 'ionicons/icons';
import { useItems } from '@/composables/useItems';
import ItemCard from '@/components/ItemCard.vue';

const router = useRouter();
const { items, loading } = useItems();

const searchQuery = ref('');
const statusFilter = ref<'all' | 'unclaimed' | 'claimed'>('all');

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return items.value.filter((item) => {
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false;
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
