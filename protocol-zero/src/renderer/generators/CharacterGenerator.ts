import { Scene, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, Scalar } from '@babylonjs/core'

export class CharacterGenerator {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    public generateVector(position: Vector3): Mesh {
        const root = new Mesh('Vector_Root', this.scene)
        root.position = position

        // 1. Core (Glowing Crystal Arrow)
        const core = MeshBuilder.CreatePolyhedron('core', { type: 1, size: 0.5 }, this.scene)
        core.parent = root
        const coreMat = new StandardMaterial('coreMat', this.scene)
        coreMat.emissiveColor = new Color3(0, 0.8, 1) // Cyan Glow
        core.material = coreMat

        // 2. Floating Shards (Simplex Noise Simulation)
        const shardCount = 20
        for (let i = 0; i < shardCount; i++) {
            const shard = MeshBuilder.CreatePolyhedron(`shard_${i}`, { type: 2, size: 0.15 }, this.scene)
            shard.parent = root

            // Random initial position around core
            const angle = Math.random() * Math.PI * 2
            const height = (Math.random() - 0.5) * 2
            const radius = 0.8 + Math.random() * 0.5

            shard.position = new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius)

            const shardMat = new StandardMaterial(`shardMat_${i}`, this.scene)
            shardMat.diffuseColor = new Color3(0.2, 0.2, 0.3)
            shardMat.emissiveColor = new Color3(0, 0.2, 0.3)
            shard.material = shardMat

            // Animation (Breathing effect)
            this.scene.onBeforeRenderObservable.add(() => {
                const time = performance.now() * 0.001
                const offset = i * 0.1
                shard.position.y += Math.sin(time + offset) * 0.002
                shard.rotation.y += 0.01
                shard.rotation.x += 0.005
            })
        }

        // 3. Trail Effect (Simulated with particles or simple mesh trail for now)
        // For MVP, we just add a rotating ring to simulate data ring
        const ring = MeshBuilder.CreateTorus('ring', { diameter: 1.5, thickness: 0.05 }, this.scene)
        ring.parent = root
        ring.rotation.x = Math.PI / 2
        const ringMat = new StandardMaterial('ringMat', this.scene)
        ringMat.emissiveColor = new Color3(0, 0.5, 1)
        ring.material = ringMat

        this.scene.onBeforeRenderObservable.add(() => {
            ring.rotation.z += 0.02
        })

        return root
    }
}
