export type ItemStatus = 'unclaimed' | 'pending' | 'claimed';
export type ItemType = 'lost' | 'found';

export interface ClaimRequest {
  name: string;
  date: string;
}

export interface LostFoundItem {
  id: string;
  itemName: string;
  description: string;
  location: string;
  date: string;
  imgURL: string;
  // A 'lost' report has no physical item on hand yet, so unclaimed/pending/
  // claimed doesn't apply until an admin marks it 'found' (turned in).
  type: ItemType;
  status: ItemStatus;
  claimedBy: string;
  dateclaimed: string;
  claims?: Record<string, ClaimRequest>;
}

export interface ItemFormData {
  itemName: string;
  description: string;
  location: string;
  date: string;
  type: ItemType;
}
