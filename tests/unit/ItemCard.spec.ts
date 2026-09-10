import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import ItemCard from '@/components/ItemCard.vue'
import { LostFoundItem } from '@/types/item'

const baseItem: LostFoundItem = {
  id: '1',
  itemName: 'Black wallet',
  description: '',
  location: 'Library',
  date: '2026-01-01',
  imgURL: '',
  status: 'unclaimed',
  claimedBy: '',
  dateclaimed: '',
}

describe('ItemCard.vue', () => {
  test('shows Unclaimed badge', () => {
    const wrapper = mount(ItemCard, { props: { item: baseItem } })
    expect(wrapper.text()).toMatch('Unclaimed')
  })

  test('shows Pending badge while a claim is awaiting admin approval', () => {
    const wrapper = mount(ItemCard, { props: { item: { ...baseItem, status: 'pending' } } })
    expect(wrapper.text()).toMatch('Pending')
  })

  test('shows Claimed badge once approved', () => {
    const wrapper = mount(ItemCard, { props: { item: { ...baseItem, status: 'claimed' } } })
    expect(wrapper.text()).toMatch('Claimed')
  })
})
