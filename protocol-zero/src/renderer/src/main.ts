import { Engine, Scene, Vector3, HemisphericLight, Color4 } from '@babylonjs/core'
import { CharacterGenerator } from '../generators/CharacterGenerator'
import { WeaponAssembler } from '../generators/WeaponAssembler'
import { FPSController } from '../controllers/FPSController'

console.log('Renderer process started')

try {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
    if (!canvas) throw new Error('Canvas not found')

    const engine = new Engine(canvas, true)
    console.log('Engine initialized')

    const createScene = () => {
        const scene = new Scene(engine)
        scene.clearColor = new Color4(0.1, 0.1, 0.15, 1) // Dark Navy

        // FPS Controller (First Person Camera)
        const fpsController = new FPSController(scene, new Vector3(0, 1.6, -5))
        fpsController.setSensitivity(1.5) // Default sensitivity

        // Light
        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene)
        light.intensity = 0.7

        // Generate Character (World)
        console.log('Generating character...')
        const charGen = new CharacterGenerator(scene)
        charGen.generateVector(new Vector3(0, 0, 0))
        console.log('Character generated')

        // Generate Weapons (Showcase in World)
        const weaponGen = new WeaponAssembler(scene)

        // Showcase Skins (Moved back to avoid confusion)
        const gaia = weaponGen.generateVandal(new Vector3(-3, 1, 5), 'gaia')
        gaia.rotation.y = Math.PI / 2

        const flux = weaponGen.generateVandal(new Vector3(0, 1, 5), 'flux')
        flux.rotation.y = Math.PI / 2


        // UI hint management
        const uiHint = document.getElementById('ui-hint')
        const settingsPanel = document.getElementById('settings-panel')
        const crosshair = document.getElementById('crosshair')
        const sensitivitySlider = document.getElementById('sensitivity-slider') as HTMLInputElement
        const sensitivityValue = document.getElementById('sensitivity-value')

        // Sensitivity Control
        if (sensitivitySlider && sensitivityValue) {
            sensitivitySlider.addEventListener('input', (e) => {
                const val = parseFloat((e.target as HTMLInputElement).value)
                fpsController.setSensitivity(val)
                sensitivityValue.innerText = val.toFixed(1)
            })
        }

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement) {
                if (uiHint) uiHint.style.display = 'none'
                if (settingsPanel) settingsPanel.style.display = 'none'
                if (crosshair) crosshair.style.display = 'block'
            } else {
                if (uiHint) uiHint.style.display = 'block'
                if (settingsPanel) settingsPanel.style.display = 'block'
                if (crosshair) crosshair.style.display = 'none'
            }
        })

        engine.runRenderLoop(() => {
            fpsController.update()
            scene.render()
        })

        window.addEventListener('resize', () => {
            engine.resize()
        })
    } catch (err) {
        console.error('Fatal Error:', err)
        document.body.innerHTML = `<div style="color:red; padding:20px;"><h1>Fatal Error</h1><pre>${err}</pre></div>`
    }
