export type ItemStatus = 'unclaimed' | 'claimed';

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
}

export interface ItemFormData {
  itemName: string;
  description: string;
  location: string;
  date: string;
}
