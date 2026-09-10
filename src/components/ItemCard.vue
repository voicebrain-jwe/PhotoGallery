<template>
  <ion-item button :detail="true" @click="$emit('click')">
    <ion-thumbnail slot="start" class="item-thumb">
      <ion-img v-if="item.imgURL" :src="item.imgURL" />
      <div v-else class="thumb-placeholder">
        <ion-icon :icon="imageOutline"></ion-icon>
      </div>
    </ion-thumbnail>

    <ion-label>
      <h2>{{ item.itemName }}</h2>
      <p>
        <ion-icon :icon="locationOutline"></ion-icon>
        {{ item.location }} &middot; {{ formattedDate }}
      </p>
      <div class="badges">
        <ion-badge :color="item.status === 'claimed' ? 'medium' : 'primary'">
          {{ item.status === 'claimed' ? 'Claimed' : 'Unclaimed' }}
        </ion-badge>
      </div>
    </ion-label>
  </ion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonItem, IonLabel, IonThumbnail, IonImg, IonBadge, IonIcon } from '@ionic/vue';
import { locationOutline, imageOutline } from 'ionicons/icons';
import { LostFoundItem } from '@/types/item';

const props = defineProps<{ item: LostFoundItem }>();
defineEmits<{ (e: 'click'): void }>();

const formattedDate = computed(() => {
  if (!props.item.date) return '';
  const d = new Date(props.item.date);
  if (isNaN(d.getTime())) return props.item.date;
  return d.toLocaleDateString();
});
</script>

<style scoped>
.item-thumb {
  --border-radius: 10px;
  width: 56px;
  height: 56px;
  overflow: hidden;
  border: 1px solid var(--app-accent-border);
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-accent-tint);
}

.thumb-placeholder ion-icon {
  font-size: 22px;
  color: var(--ion-color-primary);
}

.badges {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}

p ion-icon {
  vertical-align: -2px;
  margin-right: 2px;
}
</style>
