import { Scene, Vector3, Mesh } from '@babylonjs/core'
import { WeaponFrame, FrameType } from './WeaponFrame'
import { PartFabricator } from './PartFabricator'
import { WeaponParams, WeaponType } from '../store'

export interface AssemblyRecipe {
    frame: FrameType
    barrel: 'pistol' | 'rifle' | 'knife'
    magazine: 'pistol' | 'rifle' | null
    scope: 'iron' | 'red_dot' | 'sniper' | null
    stock: 'standard' | 'tactical' | null
}

export class WeaponAssembler {
    private scene: Scene
    private fabricator: PartFabricator
    private currentFrame: WeaponFrame | null = null
    private parts: Mesh[] = []

    constructor(scene: Scene) {
        this.scene = scene
        this.fabricator = new PartFabricator(scene)
    }

    public assemble(type: WeaponType, params: WeaponParams, explodedDist: number = 0): void {
        // Cleanup existing
        this.dispose()

        // Determine recipe based on type
        const recipe = this.getRecipeForType(type)

        // 1. Create Frame
        this.currentFrame = new WeaponFrame(this.scene, recipe.frame)

        // Apply global scale to the root
        this.currentFrame.root.scaling = new Vector3(params.scale, params.scale, params.scale)

        // 2. Create Parts
        const barrel = this.fabricator.createBarrel(recipe.barrel, params)
        const mag = recipe.magazine ? this.fabricator.createMagazine(recipe.magazine, params) : null
        const scope = recipe.scope ? this.fabricator.createScope(recipe.scope, params) : null
        const stock = recipe.stock ? this.fabricator.createStock(recipe.stock, params) : null

        this.parts = [barrel]
        if (mag) this.parts.push(mag)
        if (scope) this.parts.push(scope)
        if (stock) this.parts.push(stock)

        // 3. Attach to Anchors (Parenting)
        barrel.parent = this.currentFrame.anchors.barrel
        if (mag) mag.parent = this.currentFrame.anchors.magazine
        if (scope) scope.parent = this.currentFrame.anchors.scope
        if (stock) stock.parent = this.currentFrame.anchors.stock

        // 4. Apply Exploded View Offset
        // Move parts along their local axes relative to the anchor
        if (explodedDist > 0) {
            // Barrel moves forward (Z+)
            barrel.position = new Vector3(0, 0, explodedDist)

            // Mag moves down (Y-)
            if (mag) mag.position = new Vector3(0, -explodedDist, 0)

            // Scope moves up (Y+)
            if (scope) scope.position = new Vector3(0, explodedDist, 0)

            // Stock moves back (Z-)
            if (stock) stock.position = new Vector3(0, 0, -explodedDist)
        } else {
            // Reset positions (local to anchor)
            barrel.position = Vector3.Zero()
            if (mag) mag.position = Vector3.Zero()
            if (scope) scope.position = Vector3.Zero()
            if (stock) stock.position = Vector3.Zero()
        }
    }

    private getRecipeForType(type: WeaponType): AssemblyRecipe {
        switch (type) {
            case 'pistol':
                return {
                    frame: 'pistol',
                    barrel: 'pistol',
                    magazine: 'pistol',
                    scope: 'iron',
                    stock: null
                }
            case 'rifle':
                return {
                    frame: 'rifle',
                    barrel: 'rifle',
                    magazine: 'rifle',
                    scope: 'sniper',
                    stock: 'tactical'
                }
            case 'knife':
                return {
                    frame: 'knife',
                    barrel: 'knife',
                    magazine: null,
                    scope: null,
                    stock: null
                }
        }
    }

    public dispose(): void {
        if (this.currentFrame) {
            this.currentFrame.dispose()
            this.currentFrame = null
        }
        // Parts are children of frame anchors, so they get disposed with the frame
        this.parts = []
    }
}
