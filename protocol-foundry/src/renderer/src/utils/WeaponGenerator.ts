import { Scene, Mesh, MeshBuilder, Vector3, StandardMaterial, Color3 } from '@babylonjs/core'
import type { WeaponType } from '../store'

export class WeaponGenerator {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    /**
     * Generate a weapon based on the specified type
     */
    generateWeapon(type: WeaponType): Mesh {
        // Clear existing weapons
        this.scene.meshes.forEach((mesh) => {
            if (mesh.name !== 'camera' && mesh.name.startsWith('weapon_')) {
                mesh.dispose()
            }
        })

        switch (type) {
            case 'knife':
                return this.generateKnife()
            case 'pistol':
                return this.generatePistol()
            case 'rifle':
                return this.generateRifle()
            default:
                return this.generateKnife()
        }
    }

    /**
     * Generate a procedural knife
     */
    private generateKnife(): Mesh {
        const knife = new Mesh('weapon_knife', this.scene)

        // Blade - elongated box
        const blade = MeshBuilder.CreateBox(
            'blade',
            { width: 0.1, height: 1.2, depth: 0.05 },
            this.scene
        )
        blade.position = new Vector3(0, 0.4, 0)
        blade.parent = knife

        const bladeMaterial = new StandardMaterial('bladeMat', this.scene)
        bladeMaterial.diffuseColor = new Color3(0.8, 0.8, 0.9)
        bladeMaterial.specularColor = new Color3(1, 1, 1)
        blade.material = bladeMaterial

        // Handle - grip
        const handle = MeshBuilder.CreateCylinder(
            'handle',
            { height: 0.5, diameter: 0.12 },
            this.scene
        )
        handle.position = new Vector3(0, -0.25, 0)
        handle.parent = knife

        const handleMaterial = new StandardMaterial('handleMat', this.scene)
        handleMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2)
        handle.material = handleMaterial

        // Guard
        const guard = MeshBuilder.CreateBox(
            'guard',
            { width: 0.3, height: 0.05, depth: 0.08 },
            this.scene
        )
        guard.position = new Vector3(0, 0, 0)
        guard.parent = knife

        const guardMaterial = new StandardMaterial('guardMat', this.scene)
        guardMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4)
        guard.material = guardMaterial

        knife.rotation.z = Math.PI / 4
        return knife
    }

    /**
     * Generate a procedural pistol
     */
    private generatePistol(): Mesh {
        const pistol = new Mesh('weapon_pistol', this.scene)

        // Grip
        const grip = MeshBuilder.CreateBox(
            'grip',
            { width: 0.15, height: 0.5, depth: 0.2 },
            this.scene
        )
        grip.position = new Vector3(0, -0.15, 0)
        grip.parent = pistol

        const gripMaterial = new StandardMaterial('gripMat', this.scene)
        gripMaterial.diffuseColor = new Color3(0.15, 0.15, 0.15)
        grip.material = gripMaterial

        // Slide (top part)
        const slide = MeshBuilder.CreateBox(
            'slide',
            { width: 0.12, height: 0.15, depth: 0.6 },
            this.scene
        )
        slide.position = new Vector3(0, 0.25, 0.1)
        slide.parent = pistol

        const slideMaterial = new StandardMaterial('slideMat', this.scene)
        slideMaterial.diffuseColor = new Color3(0.25, 0.25, 0.3)
        slideMaterial.specularColor = new Color3(0.5, 0.5, 0.5)
        slide.material = slideMaterial

        // Barrel
        const barrel = MeshBuilder.CreateCylinder(
            'barrel',
            { height: 0.4, diameter: 0.08 },
            this.scene
        )
        barrel.rotation.x = Math.PI / 2
        barrel.position = new Vector3(0, 0.25, 0.5)
        barrel.parent = pistol

        const barrelMaterial = new StandardMaterial('barrelMat', this.scene)
        barrelMaterial.diffuseColor = new Color3(0.1, 0.1, 0.15)
        barrel.material = barrelMaterial

        // Trigger guard
        const trigger = MeshBuilder.CreateTorus(
            'trigger',
            { diameter: 0.15, thickness: 0.02 },
            this.scene
        )
        trigger.rotation.x = Math.PI / 2
        trigger.position = new Vector3(0, -0.05, 0.05)
        trigger.scaling.y = 0.8
        trigger.parent = pistol

        const triggerMaterial = new StandardMaterial('triggerMat', this.scene)
        triggerMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2)
        trigger.material = triggerMaterial

        pistol.rotation.y = Math.PI / 4
        return pistol
    }

    /**
     * Generate a procedural rifle
     */
    private generateRifle(): Mesh {
        const rifle = new Mesh('weapon_rifle', this.scene)

        // Stock (rear)
        const stock = MeshBuilder.CreateBox(
            'stock',
            { width: 0.15, height: 0.3, depth: 0.4 },
            this.scene
        )
        stock.position = new Vector3(0, 0, -0.9)
        stock.parent = rifle

        const stockMaterial = new StandardMaterial('stockMat', this.scene)
        stockMaterial.diffuseColor = new Color3(0.2, 0.15, 0.1)
        stock.material = stockMaterial

        // Receiver (body)
        const receiver = MeshBuilder.CreateBox(
            'receiver',
            { width: 0.12, height: 0.2, depth: 1.0 },
            this.scene
        )
        receiver.position = new Vector3(0, 0, -0.2)
        receiver.parent = rifle

        const receiverMaterial = new StandardMaterial('receiverMat', this.scene)
        receiverMaterial.diffuseColor = new Color3(0.15, 0.15, 0.15)
        receiver.material = receiverMaterial

        // Barrel
        const barrel = MeshBuilder.CreateCylinder(
            'barrel',
            { height: 1.2, diameter: 0.08 },
            this.scene
        )
        barrel.rotation.x = Math.PI / 2
        barrel.position = new Vector3(0, 0, 0.8)
        barrel.parent = rifle

        const barrelMaterial = new StandardMaterial('barrelMat', this.scene)
        barrelMaterial.diffuseColor = new Color3(0.1, 0.1, 0.15)
        barrelMaterial.specularColor = new Color3(0.3, 0.3, 0.3)
        barrel.material = barrelMaterial

        // Magazine
        const magazine = MeshBuilder.CreateBox(
            'magazine',
            { width: 0.1, height: 0.4, depth: 0.15 },
            this.scene
        )
        magazine.position = new Vector3(0, -0.3, 0.1)
        magazine.parent = rifle

        const magazineMaterial = new StandardMaterial('magazineMat', this.scene)
        magazineMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2)
        magazine.material = magazineMaterial

        // Scope
        const scope = MeshBuilder.CreateCylinder(
            'scope',
            { height: 0.3, diameter: 0.08 },
            this.scene
        )
        scope.rotation.z = Math.PI / 2
        scope.position = new Vector3(0, 0.2, 0.2)
        scope.parent = rifle

        const scopeMaterial = new StandardMaterial('scopeMat', this.scene)
        scopeMaterial.diffuseColor = new Color3(0.05, 0.05, 0.1)
        scopeMaterial.alpha = 0.7
        scope.material = scopeMaterial

        // Grip
        const grip = MeshBuilder.CreateBox(
            'grip',
            { width: 0.12, height: 0.3, depth: 0.15 },
            this.scene
        )
        grip.position = new Vector3(0, -0.2, -0.3)
        grip.parent = rifle

        const gripMaterial = new StandardMaterial('gripMat', this.scene)
        gripMaterial.diffuseColor = new Color3(0.15, 0.15, 0.15)
        grip.material = gripMaterial

        rifle.rotation.y = Math.PI / 6
        rifle.rotation.z = -Math.PI / 12
        return rifle
    }

    /**
     * Dispose all weapon meshes
     */
    dispose(): void {
        this.scene.meshes.forEach((mesh) => {
            if (mesh.name.startsWith('weapon_')) {
                mesh.dispose()
            }
        })
    }
}
