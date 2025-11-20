import { Scene, Mesh, Vector3 } from '@babylonjs/core'
import { WeaponParams, WeaponType } from '../store'
import { PartFabricator } from './PartFabricator'

interface AssemblyRecipe {
    parts: {
        receiver?: { position: Vector3; rotation?: Vector3 }
        barrel?: { position: Vector3; rotation?: Vector3 }
        handguard?: { position: Vector3; rotation?: Vector3 }
        magazine?: { position: Vector3; rotation?: Vector3 }
        scope?: { position: Vector3; rotation?: Vector3 }
        stock?: { position: Vector3; rotation?: Vector3 }
        blade?: { position: Vector3; rotation?: Vector3 }
    }
}

export class WeaponAssembler {
    private scene: Scene
    private fabricator: PartFabricator
    private currentWeapon: Mesh | null = null

    constructor(scene: Scene) {
        this.scene = scene
        this.fabricator = new PartFabricator(scene)
    }

    public assembleWeapon(type: WeaponType, params: WeaponParams, explodedDist: number = 0): Mesh {
        // Clean up previous weapon
        if (this.currentWeapon) {
            this.currentWeapon.dispose()
        }

        const weapon = new Mesh(`weapon_${type}`, this.scene)
        const recipe = this.getRecipeForType(type)

        // Assemble parts based on recipe
        if (type === 'knife') {
            if (recipe.parts.blade) {
                const blade = this.fabricator.createBarrel('knife', params)
                blade.position = recipe.parts.blade.position
                if (recipe.parts.blade.rotation) {
                    blade.rotation = recipe.parts.blade.rotation
                }
                blade.parent = weapon
            }
        } else {
            // Rifle or Pistol assembly
            if (recipe.parts.receiver) {
                const receiver = this.fabricator.createReceiver(type, params)
                receiver.position = recipe.parts.receiver.position
                if (recipe.parts.receiver.rotation) {
                    receiver.rotation = recipe.parts.receiver.rotation
                }
                receiver.parent = weapon
            }

            if (recipe.parts.barrel) {
                const barrel = this.fabricator.createBarrel(type, params)
                barrel.position = recipe.parts.barrel.position
                if (recipe.parts.barrel.rotation) {
                    barrel.rotation = recipe.parts.barrel.rotation
                }
                barrel.parent = weapon
            }

            if (recipe.parts.handguard && type === 'rifle') {
                const handguard = this.fabricator.createHandguard('rifle', params)
                handguard.position = recipe.parts.handguard.position
                if (recipe.parts.handguard.rotation) {
                    handguard.rotation = recipe.parts.handguard.rotation
                }
                handguard.parent = weapon
            }

            if (recipe.parts.magazine) {
                const magazine = this.fabricator.createMagazine(type, params)
                magazine.position = recipe.parts.magazine.position
                if (recipe.parts.magazine.rotation) {
                    magazine.rotation = recipe.parts.magazine.rotation
                }
                magazine.parent = weapon
            }

            if (recipe.parts.scope) {
                const scope = this.fabricator.createScope('red_dot', params)
                scope.position = recipe.parts.scope.position
                if (recipe.parts.scope.rotation) {
                    scope.rotation = recipe.parts.scope.rotation
                }
                scope.parent = weapon
            }

            if (recipe.parts.stock && type === 'rifle') {
                const stock = this.fabricator.createStock('tactical', params)
                stock.position = recipe.parts.stock.position
                if (recipe.parts.stock.rotation) {
                    stock.rotation = recipe.parts.stock.rotation
                }
                stock.parent = weapon
            }
        }

        // Apply exploded view effect
        if (explodedDist > 0) {
            weapon.getChildMeshes().forEach((child, index) => {
                if (child.name.includes('barrel')) {
                    child.position = child.position.add(new Vector3(explodedDist, 0, 0))
                } else if (child.name.includes('magazine')) {
                    child.position = child.position.add(new Vector3(0, -explodedDist, 0))
                } else if (child.name.includes('scope')) {
                    child.position = child.position.add(new Vector3(0, explodedDist, 0))
                } else if (child.name.includes('stock')) {
                    child.position = child.position.add(new Vector3(-explodedDist, 0, 0))
                }
            })
        }

        // Apply global scale
        weapon.scaling = new Vector3(params.scale, params.scale, params.scale)

        this.currentWeapon = weapon
        return weapon
    }

    private getRecipeForType(type: WeaponType): AssemblyRecipe {
        switch (type) {
            case 'knife':
                return {
                    parts: {
                        blade: { position: new Vector3(0, 0, 0) }
                    }
                }

            case 'pistol':
                return {
                    parts: {
                        receiver: { position: new Vector3(0, 0, 0) },
                        barrel: { position: new Vector3(0.25, 0.03, 0) },
                        magazine: { position: new Vector3(0.05, -0.12, 0) },
                        scope: { position: new Vector3(0.1, 0.08, 0) }
                    }
                }

            case 'rifle':
                return {
                    parts: {
                        receiver: { position: new Vector3(0, 0, 0) },
                        barrel: { position: new Vector3(0.4, 0.04, 0) },
                        handguard: { position: new Vector3(0.4, 0.01, 0) },
                        magazine: { position: new Vector3(0.1, -0.17, 0) },
                        scope: { position: new Vector3(0.15, 0.12, 0) },
                        stock: { position: new Vector3(0, 0, 0) }
                    }
                }
        }
    }

    public dispose(): void {
        if (this.currentWeapon) {
            this.currentWeapon.dispose()
            this.currentWeapon = null
        }
    }
}
