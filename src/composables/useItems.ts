import { ref } from 'vue';
import {
  ref as dbRef,
  push,
  set,
  update,
  remove,
  onValue,
} from 'firebase/database';
import { db } from '@/firebase';
import { ItemFormData, LostFoundItem } from '@/types/item';

const items = ref<LostFoundItem[]>([]);
const loading = ref(true);
let listenerAttached = false;

function subscribe() {
  if (listenerAttached) return;
  listenerAttached = true;

  const itemsRef = dbRef(db, 'items');
  onValue(itemsRef, (snapshot) => {
    const val = snapshot.val() as Record<string, Omit<LostFoundItem, 'id'>> | null;
    items.value = val
      ? Object.entries(val)
          .map(([id, item]) => ({ id, ...item }))
          // Firebase push() keys sort chronologically, so this is newest-first
          .sort((a, b) => (a.id < b.id ? 1 : -1))
      : [];
    loading.value = false;
  });
}

export function useItems() {
  subscribe();

  const addItem = async (input: ItemFormData, imgURL = ''): Promise<string> => {
    const itemsRef = dbRef(db, 'items');
    const newRef = push(itemsRef);
    const payload: Omit<LostFoundItem, 'id'> = {
      itemName: input.itemName,
      description: input.description,
      location: input.location,
      date: input.date,
      imgURL,
      status: 'unclaimed',
      claimedBy: '',
      dateclaimed: '',
    };
    await set(newRef, payload);
    return newRef.key as string;
  };

  const updateItem = async (id: string, changes: Partial<Omit<LostFoundItem, 'id'>>) => {
    await update(dbRef(db, `items/${id}`), changes);
  };

  const deleteItem = async (id: string) => {
    await remove(dbRef(db, `items/${id}`));
  };

  const claimItem = async (id: string, claimedBy: string) => {
    await updateItem(id, {
      status: 'claimed',
      claimedBy,
      dateclaimed: new Date().toISOString().slice(0, 10),
    });
  };

  const unclaimItem = async (id: string) => {
    await updateItem(id, { status: 'unclaimed', claimedBy: '', dateclaimed: '' });
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    claimItem,
    unclaimItem,
  };
}
