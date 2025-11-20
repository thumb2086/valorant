import { Scene, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, Scalar, GlowLayer } from '@babylonjs/core'

export class CharacterGenerator {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    public generateVector(position: Vector3): Mesh {
        const root = new Mesh('Vector_Root', this.scene)
        root.position = position

        // Enable Glow Layer for the scene if not already present
        let gl: GlowLayer | undefined
        if (this.scene.effectLayers) {
            gl = this.scene.effectLayers.find(l => l.getClassName() === 'GlowLayer') as GlowLayer
        }

        if (!gl) {
            gl = new GlowLayer('glow', this.scene)
            gl.intensity = 1.5
        }

        // 1. Core: Arrow-shaped Crystal (Tetrahedron-like)
        const core = MeshBuilder.CreatePolyhedron('core', { type: 1, size: 0.4 }, this.scene)
        core.parent = root
        core.position.y = 1.6 // Head height
        core.scaling = new Vector3(0.8, 1.5, 0.8) // Elongate to look like an arrow/crystal

        const coreMat = new StandardMaterial('coreMat', this.scene)
        coreMat.emissiveColor = new Color3(0, 0.9, 1) // Cyan Neon
        coreMat.diffuseColor = new Color3(0, 0, 0)
        coreMat.specularColor = new Color3(1, 1, 1)
        core.material = coreMat

        // 2. Body: Cluster of Floating Shards (Composite Construct)
        const shardCount = 35
        const shards: Mesh[] = []

        for (let i = 0; i < shardCount; i++) {
            // Create sharp triangular shards (Tetrahedrons)
            const shard = MeshBuilder.CreatePolyhedron(`shard_${i}`, { type: 0, size: 0.1 + Math.random() * 0.15 }, this.scene)
            shard.parent = root

            // Cluster Algorithm: Distribute around a central spine
            const angle = Math.random() * Math.PI * 2
            const height = 0.5 + Math.random() * 1.2 // Body height range
            const radius = 0.3 + Math.random() * 0.4 // Width of the body

            // Initial position
            shard.position = new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius)

            // Random rotation for chaotic look
            shard.rotation = new Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)

            const shardMat = new StandardMaterial(`shardMat_${i}`, this.scene)
            // Dark metallic look with cyan edges (simulated by emissive)
            shardMat.diffuseColor = new Color3(0.1, 0.1, 0.15)
            shardMat.emissiveColor = new Color3(0, 0.2 + Math.random() * 0.2, 0.3 + Math.random() * 0.2)
            shard.material = shardMat

            // Store initial data for animation
            shard.metadata = {
                initialPos: shard.position.clone(),
                offset: Math.random() * 100,
                speed: 0.5 + Math.random() * 1.5
            }
            shards.push(shard)
        }

        // 3. Animation: "Breathing" & Floating
        this.scene.onBeforeRenderObservable.add(() => {
            const time = performance.now() * 0.001

            // Animate Core
            core.rotation.y += 0.01
            core.position.y = 1.6 + Math.sin(time * 2) * 0.05

            // Animate Shards
            shards.forEach(shard => {
                const data = shard.metadata
                // Float up and down
                shard.position.y = data.initialPos.y + Math.sin(time * data.speed + data.offset) * 0.1
                // Rotate slowly
                shard.rotation.x += 0.01
                shard.rotation.z += 0.005
                // Pulse out/in (Breathing)
                const pulse = 1 + Math.sin(time * 1.5) * 0.05
                shard.position.x = data.initialPos.x * pulse
                shard.position.z = data.initialPos.z * pulse
            })
        })

        // 4. Trail: Data Ring (Orbiting the core)
        const ring = MeshBuilder.CreateTorus('ring', { diameter: 1.2, thickness: 0.02, tessellation: 64 }, this.scene)
        ring.parent = root
        ring.position.y = 1.6
        ring.rotation.x = Math.PI / 2 + 0.2

        const ringMat = new StandardMaterial('ringMat', this.scene)
        ringMat.emissiveColor = new Color3(0, 1, 1)
        ringMat.alpha = 0.6
        ring.material = ringMat

        this.scene.onBeforeRenderObservable.add(() => {
            ring.rotation.z -= 0.05
            ring.rotation.x = Math.PI / 2 + Math.sin(performance.now() * 0.002) * 0.2
        })

        return root
    }
}
