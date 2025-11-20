import { Scene, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, CSG, TransformNode } from '@babylonjs/core'

export class WeaponAssembler {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    public generateClassic(position: Vector3): Mesh {
        const root = new Mesh('Classic_Root', this.scene)
        root.position = position

        // 1. Body (Box)
        const body = MeshBuilder.CreateBox('body', { width: 0.2, height: 0.3, depth: 0.8 }, this.scene)
        body.position.z = 0.2

        // 2. Grip (Angled Box)
        const grip = MeshBuilder.CreateBox('grip', { width: 0.18, height: 0.4, depth: 0.25 }, this.scene)
        grip.rotation.x = Math.PI / 8
        grip.position.y = -0.3
        grip.position.z = -0.1

        // 3. Barrel (Cylinder)
        const barrel = MeshBuilder.CreateCylinder('barrel', { diameter: 0.1, height: 0.4 }, this.scene)
        barrel.rotation.x = Math.PI / 2
        barrel.position.z = 0.6
        barrel.position.y = 0.1

        // Merge meshes
        const bodyCSG = CSG.FromMesh(body)
        const gripCSG = CSG.FromMesh(grip)
        const barrelCSG = CSG.FromMesh(barrel)

        const combo = bodyCSG.union(gripCSG).union(barrelCSG)
        const mesh = combo.toMesh('Classic_Mesh', null, this.scene)

        // Cleanup primitives
        body.dispose()
        grip.dispose()
        barrel.dispose()

        mesh.parent = root

        // Material
        const mat = new StandardMaterial('classicMat', this.scene)
        mat.diffuseColor = new Color3(0.3, 0.3, 0.35) // Dark Grey
        mat.specularColor = new Color3(0.1, 0.1, 0.1)
        mesh.material = mat

        return root
    }

    public generateVandal(position: Vector3): Mesh {
        const root = new Mesh('Vandal_Root', this.scene)
        root.position = position

        // Industrial / Angular Style

        // Main Receiver
        const receiver = MeshBuilder.CreateBox('receiver', { width: 0.25, height: 0.4, depth: 1.2 }, this.scene)

        // Stock (Hollowed out look via CSG subtraction later? For now just shapes)
        const stock = MeshBuilder.CreateBox('stock', { width: 0.2, height: 0.3, depth: 0.8 }, this.scene)
        stock.position.z = -1.0
        stock.position.y = -0.1

        // Barrel (Long)
        const barrel = MeshBuilder.CreateCylinder('barrel', { diameter: 0.12, height: 1.0 }, this.scene)
        barrel.rotation.x = Math.PI / 2
        barrel.position.z = 1.0
        barrel.position.y = 0.1

        // Magazine (Curved - simulated with angled box)
        const mag = MeshBuilder.CreateBox('mag', { width: 0.15, height: 0.6, depth: 0.3 }, this.scene)
        mag.rotation.x = Math.PI / 6
        mag.position.y = -0.5
        mag.position.z = 0.2

        // CSG Union
        let gunCSG = CSG.FromMesh(receiver)
        gunCSG = gunCSG.union(CSG.FromMesh(stock))
        gunCSG = gunCSG.union(CSG.FromMesh(barrel))
        gunCSG = gunCSG.union(CSG.FromMesh(mag))

        const mesh = gunCSG.toMesh('Vandal_Mesh', null, this.scene)

        receiver.dispose()
        stock.dispose()
        barrel.dispose()
        mag.dispose()

        mesh.parent = root

        // Material: Industrial Metal + Emissive Strips
        const mat = new StandardMaterial('vandalMat', this.scene)
        mat.diffuseColor = new Color3(0.1, 0.1, 0.15) // Black Metal
        mat.emissiveColor = new Color3(0.1, 0.05, 0) // Slight orange glow
        mesh.material = mat

        return root
    }

    public generatePhantom(position: Vector3): Mesh {
        const root = new Mesh('Phantom_Root', this.scene)
        root.position = position

        // Smooth / Silenced Style

        // Body (Capsule-like or rounded box)
        const body = MeshBuilder.CreateCylinder('body', { diameter: 0.4, height: 1.5, tessellation: 16 }, this.scene)
        body.rotation.x = Math.PI / 2

        // Silencer (Thicker cylinder at front)
        const silencer = MeshBuilder.CreateCylinder('silencer', { diameter: 0.35, height: 0.8 }, this.scene)
        silencer.rotation.x = Math.PI / 2
        silencer.position.z = 1.0

        // Grip & Mag (Integrated smooth shape)
        const grip = MeshBuilder.CreateBox('grip', { width: 0.2, height: 0.6, depth: 0.4 }, this.scene)
        grip.position.y = -0.4
        grip.position.z = -0.2
        grip.rotation.x = Math.PI / 12

        let gunCSG = CSG.FromMesh(body)
        gunCSG = gunCSG.union(CSG.FromMesh(silencer))
        gunCSG = gunCSG.union(CSG.FromMesh(grip))

        const mesh = gunCSG.toMesh('Phantom_Mesh', null, this.scene)

        body.dispose()
        silencer.dispose()
        grip.dispose()

        mesh.parent = root

        // Material: Matte Camo/Plastic
        const mat = new StandardMaterial('phantomMat', this.scene)
        mat.diffuseColor = new Color3(0.2, 0.25, 0.2) // Dark Green/Grey
        mesh.material = mat

        return root
    }
}
