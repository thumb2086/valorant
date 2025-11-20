import { Engine, Scene, Vector3, HemisphericLight, ArcRotateCamera, Color4 } from '@babylonjs/core'
import { Engine, Scene, Vector3, HemisphericLight, ArcRotateCamera, Color4 } from '@babylonjs/core'
import { CharacterGenerator } from '../generators/CharacterGenerator'
import { WeaponAssembler } from '../generators/WeaponAssembler'

console.log('Renderer process started')

try {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
    if (!canvas) throw new Error('Canvas not found')

    const engine = new Engine(canvas, true)
    console.log('Engine initialized')

    const createScene = () => {
        const scene = new Scene(engine)
        scene.clearColor = new Color4(0.2, 0.2, 0.3, 1) // Lighter Blue-ish for debug

        // Camera
        const camera = new ArcRotateCamera('camera1', -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene)
        camera.attachControl(canvas, true)

        // Light
        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene)
        light.intensity = 0.7

        // Generate Character
        console.log('Generating character...')
        const charGen = new CharacterGenerator(scene)
        charGen.generateVector(new Vector3(0, 0, 0))
        console.log('Character generated')

        // Generate Weapons (Showcase)
        const weaponGen = new WeaponAssembler(scene)

        const classic = weaponGen.generateClassic(new Vector3(-2, 1, 0))
        classic.rotation.y = Math.PI / 2

        const vandal = weaponGen.generateVandal(new Vector3(2, 1, 0))
        vandal.rotation.y = -Math.PI / 2

        const phantom = weaponGen.generatePhantom(new Vector3(2, 1, 2))
        phantom.rotation.y = -Math.PI / 2

        return scene
    }

    const scene = createScene()

    engine.runRenderLoop(() => {
        scene.render()
    })

    window.addEventListener('resize', () => {
        engine.resize()
    })
} catch (err) {
    console.error('Fatal Error:', err)
    document.body.innerHTML = `<div style="color:red; padding:20px;"><h1>Fatal Error</h1><pre>${err}</pre></div>`
}
