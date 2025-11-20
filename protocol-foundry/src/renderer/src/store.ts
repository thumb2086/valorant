import { create } from 'zustand'

export type WeaponType = 'knife' | 'pistol' | 'rifle'

interface WeaponStore {
    weaponType: WeaponType
    setWeaponType: (type: WeaponType) => void
}

export const useWeaponStore = create<WeaponStore>((set) => ({
    weaponType: 'knife',
    setWeaponType: (type) => set({ weaponType: type })
}))
