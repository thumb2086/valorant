import { Scene, TransformNode, Vector3, Color3, MeshBuilder, StandardMaterial } from '@babylonjs/core'

export type FrameType = 'pistol' | 'rifle' | 'knife'

export class WeaponFrame {
    public root: TransformNode
    public anchors: {
        barrel: TransformNode
        magazine: TransformNode
        scope: TransformNode
        stock: TransformNode
    }
    private scene: Scene
    private debugMeshes: TransformNode[] = []

    constructor(scene: Scene, type: FrameType) {
        this.scene = scene
        this.root = new TransformNode(`frame_${type}`, scene)

        // Initialize anchors container
        this.anchors = {
            barrel: new TransformNode('anchor_barrel', scene),
            magazine: new TransformNode('anchor_magazine', scene),
            scope: new TransformNode('anchor_scope', scene),
            stock: new TransformNode('anchor_stock', scene)
        }

        // Parent anchors to root
        Object.values(this.anchors).forEach(anchor => anchor.parent = this.root)

        // Configure anchors based on frame type
        this.configureAnchors(type)

        // Create visual representation of the frame (the core receiver)
        this.createFrameVisuals(type)

        // Add debug visualization for anchors
        this.createDebugVisuals()
    }

    private configureAnchors(type: FrameType): void {
        switch (type) {
            case 'pistol':
                this.anchors.barrel.position = new Vector3(0, 0.25, 0.5)
                this.anchors.magazine.position = new Vector3(0, -0.5, 0)
                this.anchors.scope.position = new Vector3(0, 0.35, 0) // Top rail
                this.anchors.stock.position = new Vector3(0, 0, -0.2) // Usually unused for pistols but available
                break
            case 'rifle':
                this.anchors.barrel.position = new Vector3(0, 0, 0.8)
                this.anchors.magazine.position = new Vector3(0, -0.3, 0.1)
                this.anchors.scope.position = new Vector3(0, 0.2, 0.2)
                this.anchors.stock.position = new Vector3(0, 0, -0.2)
                break
            case 'knife':
                // For knife, barrel anchor holds the blade
                this.anchors.barrel.position = new Vector3(0, 0, 0.1)
                // Others are unused but we keep them to avoid null checks
                this.anchors.magazine.position = new Vector3(0, 0, 0)
                this.anchors.scope.position = new Vector3(0, 0, 0)
                this.anchors.stock.position = new Vector3(0, 0, -0.2)
                break
        }
    }

    private createFrameVisuals(type: FrameType): void {
        // Create the core receiver mesh
        let receiver: any
        const mat = new StandardMaterial('frameMat', this.scene)
        mat.diffuseColor = new Color3(0.2, 0.2, 0.25)

        if (type === 'pistol') {
            // Pistol Grip & Frame
            const grip = MeshBuilder.CreateBox('pistol_grip', { width: 0.15, height: 0.5, depth: 0.2 }, this.scene)
            grip.position = new Vector3(0, -0.15, 0)
            grip.parent = this.root
            grip.material = mat

            const slideBase = MeshBuilder.CreateBox('pistol_slide_base', { width: 0.12, height: 0.1, depth: 0.6 }, this.scene)
            slideBase.position = new Vector3(0, 0.2, 0.1)
            slideBase.parent = this.root
            slideBase.material = mat
        } else if (type === 'rifle') {
            // Rifle Receiver
            receiver = MeshBuilder.CreateBox('rifle_receiver', { width: 0.12, height: 0.2, depth: 1.0 }, this.scene)
            receiver.position = new Vector3(0, 0, -0.2)
            receiver.parent = this.root
            receiver.material = mat

            const grip = MeshBuilder.CreateBox('rifle_grip', { width: 0.12, height: 0.3, depth: 0.15 }, this.scene)
            grip.position = new Vector3(0, -0.2, -0.3)
            grip.parent = this.root
            grip.material = mat
        } else if (type === 'knife') {
            // Knife Handle & Guard
            const handle = MeshBuilder.CreateCylinder('knife_handle', { height: 0.6, diameter: 0.15 }, this.scene)
            handle.rotation.x = Math.PI / 2
            handle.position = new Vector3(0, 0, -0.3)
            handle.parent = this.root
            handle.material = mat

            const guard = MeshBuilder.CreateBox('knife_guard', { width: 0.3, height: 0.05, depth: 0.08 }, this.scene)
            guard.position = new Vector3(0, 0, 0)
            guard.parent = this.root
            guard.material = mat
        }
    }

    private createDebugVisuals(): void {
        // Create small coordinate axes at each anchor point
        Object.entries(this.anchors).forEach(([name, anchor]) => {
            const axisSize = 0.2

            const xAxis = MeshBuilder.CreateLines(`debug_${name}_x`, {
                points: [Vector3.Zero(), new Vector3(axisSize, 0, 0)]
            }, this.scene)
            xAxis.color = Color3.Red()
            xAxis.parent = anchor

            const yAxis = MeshBuilder.CreateLines(`debug_${name}_y`, {
                points: [Vector3.Zero(), new Vector3(0, axisSize, 0)]
            }, this.scene)
            yAxis.color = Color3.Green()
            yAxis.parent = anchor

            const zAxis = MeshBuilder.CreateLines(`debug_${name}_z`, {
                points: [Vector3.Zero(), new Vector3(0, 0, axisSize)]
            }, this.scene)
            zAxis.color = Color3.Blue()
            zAxis.parent = anchor

            this.debugMeshes.push(xAxis, yAxis, zAxis)
        })
    }

    public dispose(): void {
        this.root.dispose()
        // Children (anchors and meshes) are disposed automatically when root is disposed
    }
}
