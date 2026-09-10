<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/items"></ion-back-button>
        </ion-buttons>
        <ion-title>Item Details</ion-title>
        <ion-buttons slot="end" v-if="item">
          <ion-button v-if="item.status === 'unclaimed'" @click="router.push(`/items/${item.id}/edit`)">
            <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
          </ion-button>
          <ion-button v-if="isAdmin" color="danger" @click="confirmDelete">
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
            <ion-badge :color="item.type === 'lost' ? 'danger' : 'success'">
              {{ item.type === 'lost' ? 'Lost' : 'Found' }}
            </ion-badge>
            <ion-badge v-if="item.type === 'found'" :color="statusColor">{{ statusLabel }}</ion-badge>
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

          <div v-if="item.type === 'lost'" class="claim-info">
            <ion-icon :icon="informationCircleOutline" color="danger"></ion-icon>
            <span>Reported lost. Once it's turned in at the Lost and Found area, an admin marks it Found so it can be claimed.</span>
          </div>

          <template v-if="item.type === 'found'">
            <div v-if="item.status === 'claimed'" class="claim-info">
              <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
              <span>Claimed by {{ item.claimedBy }}<template v-if="item.dateclaimed"> on {{ formattedClaimedDate }}</template></span>
            </div>

            <template v-if="claimsList.length">
              <h3>Pending claims</h3>
              <ion-list lines="full" class="info-list">
                <ion-item v-for="c in claimsList" :key="c.id">
                  <ion-label>
                    <h2>{{ c.name }}</h2>
                    <p>{{ c.date }}</p>
                  </ion-label>
                  <ion-buttons v-if="isAdmin" slot="end">
                    <ion-button color="success" @click="approve(c)">Approve</ion-button>
                    <ion-button color="medium" @click="reject(c.id)">Reject</ion-button>
                  </ion-buttons>
                </ion-item>
              </ion-list>
              <p v-if="!isAdmin" class="pending-note">
                <ion-text color="medium">Awaiting admin approval.</ion-text>
              </p>
            </template>
          </template>
        </div>

        <div class="action-bar">
          <template v-if="item.type === 'lost'">
            <ion-button v-if="isAdmin" expand="block" @click="markFoundConfirm">
              <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
              Mark as found
            </ion-button>
          </template>
          <template v-else>
            <ion-button
              v-if="item.status !== 'claimed'"
              expand="block"
              @click="promptClaim"
            >
              <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
              Claim this item
            </ion-button>
            <ion-button v-else-if="isAdmin" expand="block" fill="outline" @click="unclaim">
              Undo claim
            </ion-button>
          </template>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { alertController } from '@ionic/vue';
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
  informationCircleOutline,
  imageOutline,
} from 'ionicons/icons';
import { useItems } from '@/composables/useItems';
import { useAdmin } from '@/composables/useAdmin';
import { ClaimRequest } from '@/types/item';

const route = useRoute();
const router = useRouter();
const { items, loading, deleteItem, claimItem, approveClaim, rejectClaim, unclaimItem, markFound } = useItems();
const { isAdmin } = useAdmin();

const itemId = computed(() => route.params.id as string);
const item = computed(() => items.value.find((i) => i.id === itemId.value));

const claimsList = computed(() => {
  const claims = item.value?.claims;
  if (!claims) return [];
  return Object.entries(claims).map(([id, claim]) => ({ id, ...claim }));
});

const statusLabel = computed(() => {
  if (item.value?.status === 'claimed') return 'Claimed';
  if (item.value?.status === 'pending') return 'Pending';
  return 'Unclaimed';
});

const statusColor = computed(() => {
  if (item.value?.status === 'claimed') return 'medium';
  if (item.value?.status === 'pending') return 'warning';
  return 'primary';
});

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
          const confirmAlert = await alertController.create({
            header: 'Claim submitted',
            message: 'Go to the Lost and Found area to verify and complete your claim.',
            buttons: ['OK'],
          });
          await confirmAlert.present();
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

const approve = async (claim: { id: string; name: string; date: string }) => {
  if (!item.value) return;
  const alert = await alertController.create({
    header: 'Approve claim?',
    message: `Mark this item as claimed by ${claim.name}. Other pending claims will be cleared.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Approve',
        handler: async () => {
          if (!item.value) return;
          const request: ClaimRequest = { name: claim.name, date: claim.date };
          await approveClaim(item.value.id, request);
        },
      },
    ],
  });
  await alert.present();
};

const reject = async (claimId: string) => {
  if (!item.value) return;
  await rejectClaim(item.value.id, claimId);
};

const markFoundConfirm = async () => {
  if (!item.value) return;
  const alert = await alertController.create({
    header: 'Mark as found?',
    message: 'This confirms the item has been turned in at the Lost and Found area. It will then be available to claim.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Mark as found',
        handler: async () => {
          if (!item.value) return;
          await markFound(item.value.id);
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
