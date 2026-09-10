export type ItemStatus = 'unclaimed' | 'pending' | 'claimed';

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
}
