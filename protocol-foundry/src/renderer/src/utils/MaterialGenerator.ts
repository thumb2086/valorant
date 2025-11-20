import { PBRMaterial, Scene, Color3, Texture } from '@babylonjs/core'
import { WeaponParams } from '../store'

export class MaterialGenerator {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    public createPBRMaterial(name: string, params: WeaponParams): PBRMaterial {
        const material = new PBRMaterial(name, this.scene)

        // Base Color
        material.albedoColor = Color3.FromHexString(params.color)

        // Metallic & Roughness
        material.metallic = params.metalness
        material.roughness = params.roughness

        // Environmental Lighting
        // In a real PBR setup, we need an environment texture. 
        // For now, we simulate it with high contrast lighting settings.
        material.environmentIntensity = 1.0

        // Wear & Tear (Procedural Noise Simulation)
        // If we had noise textures, we would apply them here based on params.wearLevel
        // For now, we slightly modulate the roughness based on wear
        if (params.wearLevel > 0) {
            material.roughness += params.wearLevel * 0.2
            if (material.roughness > 1) material.roughness = 1
        }

        return material
    }

    public createAccentMaterial(name: string, color: string): PBRMaterial {
        const material = new PBRMaterial(name, this.scene)
        material.albedoColor = Color3.FromHexString(color)
        material.metallic = 0.1
        material.roughness = 0.8
        return material
    }
}
