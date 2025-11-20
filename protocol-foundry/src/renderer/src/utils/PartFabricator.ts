import { Scene, Mesh, MeshBuilder, Vector3, StandardMaterial, Color3, TransformNode } from '@babylonjs/core'
import { WeaponParams } from '../store'

export type PartType = 'core' | 'barrel' | 'magazine' | 'scope' | 'stock'

export class PartFabricator {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    private hexToColor3(hex: string): Color3 {
        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255
        return new Color3(r, g, b)
    }

    public createBarrel(type: 'pistol' | 'rifle' | 'knife', params: WeaponParams): Mesh {
        const root = new Mesh('part_barrel', this.scene)
        const color = this.hexToColor3(params.color)
        const mat = new StandardMaterial('barrelMat', this.scene)
        mat.diffuseColor = type === 'pistol' ? new Color3(0.1, 0.1, 0.15) : new Color3(0.1, 0.1, 0.15)
        mat.specularColor = new Color3(0.3, 0.3, 0.3)

        if (type === 'pistol') {
            // Pistol Barrel
            const barrel = MeshBuilder.CreateCylinder('barrel_cyl', {
                height: 0.4 * params.barrelLength,
                diameter: 0.08
            }, this.scene)
            barrel.rotation.x = Math.PI / 2
            // Origin is at connection point (back of barrel), so move forward by half height
            barrel.position.z = (0.4 * params.barrelLength) / 2
            barrel.parent = root
            barrel.material = mat

            // Pistol Slide (attached to barrel group for now, or could be separate)
            const slide = MeshBuilder.CreateBox('slide', {
                width: 0.12,
                height: 0.15,
                depth: 0.6 * params.barrelLength
            }, this.scene)
            slide.position.z = -0.1 + (0.6 * params.barrelLength) / 2 // Adjust to align with frame
            slide.position.y = 0
            slide.parent = root
            const slideMat = new StandardMaterial('slideMat', this.scene)
            slideMat.diffuseColor = new Color3(0.25, 0.25, 0.3)
            slide.material = slideMat
        } else if (type === 'rifle') {
            // Rifle Barrel
            const barrel = MeshBuilder.CreateCylinder('barrel_cyl', {
                height: 1.2 * params.barrelLength,
                diameter: 0.08
            }, this.scene)
            barrel.rotation.x = Math.PI / 2
            barrel.position.z = (1.2 * params.barrelLength) / 2
            barrel.parent = root
            barrel.material = mat

            // Handguard
            const handguard = MeshBuilder.CreateBox('handguard', {
                width: 0.1,
                height: 0.12,
                depth: 0.6 * params.barrelLength
            }, this.scene)
            handguard.position.z = (0.6 * params.barrelLength) / 2
            handguard.parent = root
            const hgMat = new StandardMaterial('hgMat', this.scene)
            hgMat.diffuseColor = color
            handguard.material = hgMat
        } else if (type === 'knife') {
            // Knife Blade
            const blade = MeshBuilder.CreateBox('blade', {
                width: 0.1,
                height: 1.2 * params.barrelLength,
                depth: 0.05
            }, this.scene)
            // Blade extends forward from anchor
            blade.rotation.x = Math.PI / 2
            blade.position.z = (1.2 * params.barrelLength) / 2
            blade.parent = root

            const bladeMat = new StandardMaterial('bladeMat', this.scene)
            bladeMat.diffuseColor = new Color3(0.8, 0.8, 0.9)
            bladeMat.specularColor = new Color3(1, 1, 1)
            blade.material = bladeMat
        }

        return root
    }

    public createMagazine(type: 'pistol' | 'rifle', params: WeaponParams): Mesh {
        const root = new Mesh('part_magazine', this.scene)
        const mat = new StandardMaterial('magMat', this.scene)
        mat.diffuseColor = new Color3(0.2, 0.2, 0.2)

        if (type === 'pistol') {
            // Pistol Mag (internal mostly, but visible base)
            const mag = MeshBuilder.CreateBox('mag', { width: 0.13, height: 0.4, depth: 0.18 }, this.scene)
            mag.position.y = -0.2 // Extends down
            mag.parent = root
            mag.material = mat
        } else {
            // Rifle Mag (Banana shape approx)
            const mag = MeshBuilder.CreateBox('mag', { width: 0.1, height: 0.4, depth: 0.15 }, this.scene)
            mag.position.y = -0.2 // Extends down
            // Curve simulation
            mag.rotation.x = 0.2
            mag.parent = root
            mag.material = mat
        }

        return root
    }

    public createScope(type: 'iron' | 'red_dot' | 'sniper', params: WeaponParams): Mesh {
        const root = new Mesh('part_scope', this.scene)

        if (type === 'sniper') {
            const scopeBody = MeshBuilder.CreateCylinder('scope_body', { height: 0.3, diameter: 0.08 }, this.scene)
            scopeBody.rotation.z = Math.PI / 2
            scopeBody.parent = root

            const mat = new StandardMaterial('scopeMat', this.scene)
            mat.diffuseColor = new Color3(0.1, 0.1, 0.1)
            scopeBody.material = mat
        } else {
            // Simple Iron Sights
            const rearSight = MeshBuilder.CreateBox('rear_sight', { width: 0.04, height: 0.04, depth: 0.02 }, this.scene)
            rearSight.parent = root
        }

        return root
    }

    public createStock(type: 'standard' | 'tactical', params: WeaponParams): Mesh {
        const root = new Mesh('part_stock', this.scene)
        const color = this.hexToColor3(params.color)
        const mat = new StandardMaterial('stockMat', this.scene)
        mat.diffuseColor = color

        const stock = MeshBuilder.CreateBox('stock_body', {
            width: 0.15,
            height: 0.3,
            depth: 0.4 * params.gripSize
        }, this.scene)
        // Origin is connection point (front of stock), so move back
        stock.position.z = -(0.4 * params.gripSize) / 2
        stock.parent = root
        stock.material = mat

        return root
    }
}
