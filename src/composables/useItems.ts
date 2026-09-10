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
import { ClaimRequest, ItemFormData, LostFoundItem } from '@/types/item';

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
          .map(([id, raw]) => {
            const item = { id, ...raw } as LostFoundItem;
            // Older records predate the lost/found split; treat them as 'found'.
            if (!item.type) item.type = 'found';
            return item;
          })
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
      type: input.type,
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

  // Claiming an item just files a claim request; it does not mark the item
  // as claimed. Multiple people can file a claim while it's pending —
  // only an admin approving one moves the item to 'claimed'.
  const claimItem = async (id: string, claimantName: string) => {
    const item = items.value.find((i) => i.id === id);
    const claim: ClaimRequest = {
      name: claimantName,
      date: new Date().toISOString().slice(0, 10),
    };
    await set(push(dbRef(db, `items/${id}/claims`)), claim);
    if (!item || item.status === 'unclaimed') {
      await updateItem(id, { status: 'pending' });
    }
  };

  const approveClaim = async (id: string, claim: ClaimRequest) => {
    await update(dbRef(db, `items/${id}`), {
      status: 'claimed',
      claimedBy: claim.name,
      dateclaimed: claim.date,
      claims: null,
    });
  };

  const rejectClaim = async (id: string, claimId: string) => {
    const item = items.value.find((i) => i.id === id);
    const remaining = Object.keys(item?.claims || {}).filter((k) => k !== claimId);
    await update(dbRef(db, `items/${id}`), {
      [`claims/${claimId}`]: null,
      ...(remaining.length === 0 ? { status: 'unclaimed' } : {}),
    });
  };

  const unclaimItem = async (id: string) => {
    await update(dbRef(db, `items/${id}`), {
      status: 'unclaimed',
      claimedBy: '',
      dateclaimed: '',
      claims: null,
    });
  };

  // Admin action: a lost report's item has been physically turned in, so it
  // moves into the normal found/unclaimed → pending → claimed flow.
  const markFound = async (id: string) => {
    await updateItem(id, { type: 'found' });
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    claimItem,
    approveClaim,
    rejectClaim,
    unclaimItem,
    markFound,
  };
}
