import { Scene, UniversalCamera, Vector3, ActionManager, KeyboardEventTypes, Axis, Ray, Color3, MeshBuilder, StandardMaterial } from '@babylonjs/core'

export class FPSController {
    private scene: Scene
    private camera: UniversalCamera
    private inputMap: { [key: string]: boolean } = {}
    private moveSpeed: number = 0.2
    private jumpPower: number = 0.3
    private velocity: Vector3 = Vector3.Zero()
    private grounded: boolean = true
    private canvas: HTMLCanvasElement
    private isLocked: boolean = false

    constructor(scene: Scene, startPosition: Vector3) {
        this.scene = scene
        this.canvas = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement

        // Create first-person camera
        this.camera = new UniversalCamera('fpsCamera', startPosition, scene)
        this.camera.setTarget(new Vector3(0, 1.6, 0)) // Eye-level height
        this.camera.attachControl(this.canvas, true)

        // Mouse sensitivity
        this.camera.angularSensibility = 1000
        this.camera.speed = 0

        // Collision & Gravity
        this.camera.checkCollisions = true
        this.camera.applyGravity = true
        this.camera.ellipsoid = new Vector3(0.5, 0.9, 0.5) // Player capsule

        this.setupKeyboardInput()
        this.setupPointerLock()
    }

    private setupPointerLock() {
        // Click to lock pointer
        this.canvas.addEventListener('click', () => {
            if (!this.isLocked) {
                this.canvas.requestPointerLock()
            }
        })

        // Listen for pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.canvas
            console.log('Pointer lock:', this.isLocked ? 'LOCKED' : 'UNLOCKED')
        })

        // ESC to unlock
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isLocked) {
                document.exitPointerLock()
            }
        })

        // Mouse click for shooting
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.isLocked) { // Left click
                this.shoot()
            }
        })
    }

    private setupKeyboardInput() {
        this.scene.actionManager = new ActionManager(this.scene)

        // Key Down
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                this.inputMap[kbInfo.event.key.toLowerCase()] = true
            }
            if (kbInfo.type === KeyboardEventTypes.KEYUP) {
                this.inputMap[kbInfo.event.key.toLowerCase()] = false
            }
        })
    }

    public update() {
        // Only process movement if pointer is locked
        if (!this.isLocked) return

        // Movement direction
        const forward = this.camera.getDirection(Axis.Z)
        const right = this.camera.getDirection(Axis.X)

        let movement = Vector3.Zero()

        if (this.inputMap['w']) movement.addInPlace(forward)
        if (this.inputMap['s']) movement.addInPlace(forward.scale(-1))
        if (this.inputMap['a']) movement.addInPlace(right.scale(-1))
        if (this.inputMap['d']) movement.addInPlace(right)

        // Normalize diagonal movement
        if (movement.length() > 0) {
            movement.normalize().scaleInPlace(this.moveSpeed)
        }

        // Apply movement only on XZ plane (don't fly)
        movement.y = 0
        this.camera.position.addInPlace(movement)

        // Gravity and Jumping
        // Apply gravity
        if (!this.grounded) {
            this.velocity.y -= 0.015 // Gravity
        }

        // Jump
        if (this.inputMap[' '] && this.grounded) {
            this.velocity.y = this.jumpPower
            this.grounded = false
        }

        // Apply vertical velocity
        this.camera.position.y += this.velocity.y

        // Ground check (Simple floor at y=1.6)
        if (this.camera.position.y <= 1.6) {
            this.camera.position.y = 1.6
            this.velocity.y = 0
            this.grounded = true
        } else {
            this.grounded = false
        }
    }

    public setSensitivity(sensitivity: number) {
        // BabylonJS angularSensibility is inverse (higher = slower)
        // Base 1000. Sensitivity 1.0 -> 1000. Sensitivity 2.0 -> 500.
        this.camera.angularSensibility = 2000 / sensitivity
    }

    private shoot() {
        if (!this.isLocked) return

        // Raycast from center of screen
        const origin = this.camera.position
        const direction = this.camera.getForwardRay().direction

        const ray = new Ray(origin, direction, 100)
        const hit = this.scene.pickWithRay(ray)

        // Visual: Bullet Trail (Line)
        // Offset start to look like coming from right side (gun position)
        // We need to calculate world position of the gun muzzle offset
        const right = this.camera.getDirection(Axis.X).scale(0.2)
        const down = this.camera.getDirection(Axis.Y).scale(-0.2)
        const forward = this.camera.getDirection(Axis.Z).scale(0.5)
        const gunMuzzlePos = origin.add(right).add(down).add(forward)

        const endPoint = hit?.pickedPoint || origin.add(direction.scale(100))

        const trail = MeshBuilder.CreateLines('trail', {
            points: [gunMuzzlePos, endPoint],
            updatable: false
        }, this.scene)
        trail.color = new Color3(1, 1, 0) // Yellow trail

        // Fade out trail
        setTimeout(() => {
            trail.dispose()
        }, 100)

        if (hit?.pickedMesh) {
            console.log('Hit:', hit.pickedMesh.name)

            // Visual: Hit Marker (Sphere)
            const marker = MeshBuilder.CreateSphere('hit', { diameter: 0.1 }, this.scene)
            marker.position = hit.pickedPoint!
            const mat = new StandardMaterial('hitMat', this.scene)
            mat.emissiveColor = new Color3(1, 0, 0)
            marker.material = mat

            setTimeout(() => {
                marker.dispose()
            }, 500)
        }
    }

    public getCamera(): UniversalCamera {
        return this.camera
    }
}
