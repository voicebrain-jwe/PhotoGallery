<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button :default-href="backHref"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Edit Item' : 'Report Item' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="isEdit && loading" class="state-container">
        <ion-spinner></ion-spinner>
      </div>

      <form v-else @submit.prevent="save">
        <item-photo-capture v-model="photoDraft" :existing-url="existingItem?.imgURL" />

        <ion-segment v-if="!isEdit" v-model="form.type" class="type-segment">
          <ion-segment-button value="found">
            <ion-label>I found this</ion-label>
          </ion-segment-button>
          <ion-segment-button value="lost">
            <ion-label>I lost this</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-list>
          <ion-item>
            <ion-label position="stacked">Item name *</ion-label>
            <ion-input v-model="form.itemName" placeholder="e.g. Black leather wallet" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Location *</ion-label>
            <ion-input v-model="form.location" placeholder="e.g. Library, 2nd floor" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Date *</ion-label>
            <ion-input v-model="form.date" type="date" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Description</ion-label>
            <ion-textarea v-model="form.description" placeholder="Distinguishing details, contents, condition..." auto-grow></ion-textarea>
          </ion-item>
        </ion-list>

        <div class="submit-bar">
          <ion-button expand="block" type="submit" :disabled="saving">
            <ion-spinner v-if="saving" name="crescent"></ion-spinner>
            <template v-else>{{ isEdit ? 'Save Changes' : 'Report Item' }}</template>
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonSpinner,
} from '@ionic/vue';
import { useItems } from '@/composables/useItems';
import { ItemFormData } from '@/types/item';
import ItemPhotoCapture from '@/components/ItemPhotoCapture.vue';

const route = useRoute();
const router = useRouter();
const { items, loading, addItem, updateItem } = useItems();

const itemId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!itemId.value);
const backHref = computed(() => (itemId.value ? `/items/${itemId.value}` : '/items'));

const existingItem = computed(() => items.value.find((i) => i.id === itemId.value));

const form = reactive<ItemFormData>({
  itemName: '',
  description: '',
  location: '',
  date: new Date().toISOString().slice(0, 10),
  type: 'found',
});

// undefined = no change, null = removed, string = new local photo path
const photoDraft = ref<string | null | undefined>(undefined);
const saving = ref(false);

let hydrated = false;
watch(
  existingItem,
  async (val) => {
    if (val && !hydrated) {
      hydrated = true;
      if (isEdit.value && val.status !== 'unclaimed') {
        await showError('This item can no longer be edited.');
        router.replace(`/items/${val.id}`);
        return;
      }
      form.itemName = val.itemName;
      form.description = val.description;
      form.location = val.location;
      form.date = val.date;
    }
  },
  { immediate: true }
);

const showError = async (message: string) => {
  const toast = await toastController.create({ message, duration: 2500, color: 'danger' });
  await toast.present();
};

const validate = (): boolean => {
  if (!form.itemName.trim() || !form.location.trim() || !form.date) return false;
  return true;
};

const save = async () => {
  if (!validate()) {
    await showError('Please fill in all required fields.');
    return;
  }

  if (isEdit.value && existingItem.value && existingItem.value.status !== 'unclaimed') {
    await showError('This item can no longer be edited.');
    router.replace(`/items/${existingItem.value.id}`);
    return;
  }

  saving.value = true;
  try {
    if (isEdit.value && itemId.value) {
      // type isn't editable here — only an admin can move an item from
      // 'lost' to 'found' (see the "Mark as found" action).
      const { type: _type, ...editable } = form;
      const changes: Record<string, unknown> = { ...editable };

      if (photoDraft.value === null) {
        changes.imgURL = '';
      } else if (typeof photoDraft.value === 'string') {
        changes.imgURL = photoDraft.value;
      }

      await updateItem(itemId.value, changes);
      router.replace('/items');
    } else {
      await addItem(form, photoDraft.value ?? '');
      router.replace('/items');
    }
  } catch (err) {
    console.error('Failed to save item:', err);
    const message = err instanceof Error ? err.message : 'Something went wrong while saving. Please try again.';
    await showError(message);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 80px;
}

.submit-bar {
  padding: 16px;
}

.type-segment {
  margin: 0 16px 8px;
  width: auto;
}
</style>
