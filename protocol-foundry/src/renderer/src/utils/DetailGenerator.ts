import { Scene, MeshBuilder, Mesh, Vector3, StandardMaterial, Color3 } from '@babylonjs/core'
import { MaterialGenerator } from './MaterialGenerator'
import { WeaponParams } from '../store'

/**
 * DetailGenerator - Creates micro-details for high-fidelity weapon models
 * Includes screws, rivets, markings, rails, vents, etc.
 */
export class DetailGenerator {
    private scene: Scene
    private materialGen: MaterialGenerator

    constructor(scene: Scene) {
        this.scene = scene
        this.materialGen = new MaterialGenerator(scene)
    }

    /**
     * Generate a screw/bolt detail
     */
    public createScrew(position: Vector3, size: number = 0.01): Mesh {
        const screw = new Mesh('screw', this.scene)

        // Screw head
        const head = MeshBuilder.CreateCylinder('screw_head', {
            height: size * 0.3,
            diameter: size,
            tessellation: 6
        }, this.scene)
        head.position = position
        head.parent = screw

        // Screw slot
        const slot = MeshBuilder.CreateBox('screw_slot', {
            width: size * 0.8,
            height: size * 0.1,
            depth: size * 0.15
        }, this.scene)
        slot.position = position.add(new Vector3(0, size * 0.15, 0))
        slot.parent = screw

        // Material
        const screwMat = new StandardMaterial('screw_mat', this.scene)
        screwMat.diffuseColor = new Color3(0.3, 0.3, 0.3)
        screwMat.specularColor = new Color3(0.5, 0.5, 0.5)
        head.material = screwMat
        slot.material = screwMat

        return screw
    }

    /**
     * Generate a rivet detail
     */
    public createRivet(position: Vector3, size: number = 0.008): Mesh {
        const rivet = MeshBuilder.CreateSphere('rivet', {
            diameter: size,
            segments: 8
        }, this.scene)
        rivet.position = position
        rivet.scaling.y = 0.5 // Flatten it

        const rivetMat = new StandardMaterial('rivet_mat', this.scene)
        rivetMat.diffuseColor = new Color3(0.4, 0.4, 0.4)
        rivet.material = rivetMat

        return rivet
    }

    /**
     * Generate a Picatinny rail system
     */
    public createPicatinnyRail(length: number, params: WeaponParams): Mesh {
        const rail = new Mesh('picatinny_rail', this.scene)

        // Rail base
        const base = MeshBuilder.CreateBox('rail_base', {
            width: length,
            height: 0.03,
            depth: 0.04
        }, this.scene)
        base.position.x = length / 2
        base.parent = rail

        // Rail slots (the characteristic teeth)
        const slotCount = Math.floor(length / 0.05)
        for (let i = 0; i < slotCount; i++) {
            const slot = MeshBuilder.CreateBox(`rail_slot_${i}`, {
                width: 0.02,
                height: 0.02,
                depth: 0.035
            }, this.scene)
            slot.position.x = (i + 0.5) * (length / slotCount)
            slot.position.y = -0.01
            slot.parent = rail

            // Side notches
            const notchL = MeshBuilder.CreateBox(`rail_notch_l_${i}`, {
                width: 0.015,
                height: 0.015,
                depth: 0.01
            }, this.scene)
            notchL.position.x = (i + 0.5) * (length / slotCount)
            notchL.position.z = -0.02
            notchL.parent = rail

            const notchR = MeshBuilder.CreateBox(`rail_notch_r_${i}`, {
                width: 0.015,
                height: 0.015,
                depth: 0.01
            }, this.scene)
            notchR.position.x = (i + 0.5) * (length / slotCount)
            notchR.position.z = 0.02
            notchR.parent = rail
        }

        // Apply material
        const railMat = this.materialGen.createPBRMaterial('rail_mat', {
            ...params,
            color: '#1a1a1a',
            metalness: 0.7,
            roughness: 0.5
        })
        rail.getChildMeshes().forEach(child => {
            child.material = railMat
        })

        return rail
    }

    /**
     * Generate ventilation holes/ports
     */
    public createVentHoles(parent: Mesh, count: number, spacing: number): void {
        for (let i = 0; i < count; i++) {
            const hole = MeshBuilder.CreateCylinder(`vent_${i}`, {
                height: 0.02,
                diameter: 0.015,
                tessellation: 8
            }, this.scene)
            hole.rotation.z = Math.PI / 2
            hole.position.x = i * spacing
            hole.position.y = 0.05
            hole.parent = parent

            const holeMat = new StandardMaterial('hole_mat', this.scene)
            holeMat.diffuseColor = new Color3(0.05, 0.05, 0.05)
            hole.material = holeMat
        }
    }

    /**
     * Generate text marking/serial number
     */
    public createMarking(text: string, position: Vector3, size: number = 0.02): Mesh {
        // For now, create a simple placeholder box
        // In production, you'd use a texture or dynamic texture
        const marking = MeshBuilder.CreateBox('marking', {
            width: size * text.length,
            height: size * 0.5,
            depth: 0.001
        }, this.scene)
        marking.position = position

        const markingMat = new StandardMaterial('marking_mat', this.scene)
        markingMat.diffuseColor = new Color3(0.9, 0.9, 0.9)
        markingMat.emissiveColor = new Color3(0.1, 0.1, 0.1)
        marking.material = markingMat

        return marking
    }

    /**
     * Generate charging handle
     */
    public createChargingHandle(params: WeaponParams): Mesh {
        const handle = new Mesh('charging_handle', this.scene)

        // Handle body
        const body = MeshBuilder.CreateBox('handle_body', {
            width: 0.08,
            height: 0.02,
            depth: 0.03
        }, this.scene)
        body.parent = handle

        // Handle latch
        const latch = MeshBuilder.CreateBox('handle_latch', {
            width: 0.03,
            height: 0.015,
            depth: 0.04
        }, this.scene)
        latch.position.x = -0.025
        latch.parent = handle

        // Material
        const handleMat = this.materialGen.createPBRMaterial('handle_mat', {
            ...params,
            color: '#2d3748',
            metalness: 0.8,
            roughness: 0.3
        })
        handle.getChildMeshes().forEach(child => {
            child.material = handleMat
        })

        return handle
    }

    /**
     * Generate ejection port
     */
    public createEjectionPort(params: WeaponParams): Mesh {
        const port = new Mesh('ejection_port', this.scene)

        // Port opening
        const opening = MeshBuilder.CreateBox('port_opening', {
            width: 0.08,
            height: 0.04,
            depth: 0.001
        }, this.scene)
        opening.parent = port

        // Port cover (dust cover)
        const cover = MeshBuilder.CreateBox('port_cover', {
            width: 0.09,
            height: 0.045,
            depth: 0.002
        }, this.scene)
        cover.position.z = 0.002
        cover.rotation.x = -0.3 // Slightly open
        cover.parent = port

        // Material
        const portMat = this.materialGen.createPBRMaterial('port_mat', params)
        port.getChildMeshes().forEach(child => {
            child.material = portMat
        })

        return port
    }

    /**
     * Generate magazine release button
     */
    public createMagRelease(params: WeaponParams): Mesh {
        const button = MeshBuilder.CreateCylinder('mag_release', {
            height: 0.015,
            diameter: 0.02,
            tessellation: 16
        }, this.scene)
        button.rotation.z = Math.PI / 2

        const buttonMat = this.materialGen.createPBRMaterial('button_mat', {
            ...params,
            color: '#1a1a1a',
            metalness: 0.5,
            roughness: 0.6
        })
        button.material = buttonMat

        return button
    }

    /**
     * Generate trigger assembly
     */
    public createTrigger(params: WeaponParams): Mesh {
        const trigger = new Mesh('trigger', this.scene)

        // Trigger blade
        const blade = MeshBuilder.CreateBox('trigger_blade', {
            width: 0.015,
            height: 0.05,
            depth: 0.02
        }, this.scene)
        blade.position.y = -0.025
        blade.parent = trigger

        // Trigger guard
        const guard = MeshBuilder.CreateTorus('trigger_guard', {
            diameter: 0.12,
            thickness: 0.008,
            tessellation: 32
        }, this.scene)
        guard.rotation.x = Math.PI / 2
        guard.scaling.y = 0.6
        guard.parent = trigger

        // Material
        const triggerMat = this.materialGen.createPBRMaterial('trigger_mat', {
            ...params,
            metalness: 0.9,
            roughness: 0.2
        })
        trigger.getChildMeshes().forEach(child => {
            child.material = triggerMat
        })

        return trigger
    }
}
