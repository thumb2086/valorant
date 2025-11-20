import React, { useEffect, useRef } from 'react'
import {
    Engine,
    Scene as BabylonScene,
    Vector3,
    HemisphericLight,
    ArcRotateCamera,
    Color4,
    Color3
} from '@babylonjs/core'
import { WeaponAssembler } from '../utils/WeaponAssembler'
import { useWeaponStore } from '../store'

const Scene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const weaponAssemblerRef = useRef<WeaponAssembler | null>(null)
    const { weaponType, params, explodedViewDistance } = useWeaponStore()

    useEffect(() => {
        if (!canvasRef.current) return

        const engine = new Engine(canvasRef.current, true)
        const scene = new BabylonScene(engine)

        // Lighter background for better contrast
        scene.clearColor = new Color4(0.12, 0.12, 0.15, 1)

        const camera = new ArcRotateCamera('camera1', -Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene)
        camera.attachControl(canvasRef.current, true)
        camera.wheelPrecision = 50

        // Main ambient light
        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene)
        light.intensity = 0.8
        light.groundColor = new Color3(0.2, 0.2, 0.2)

        // Directional light
        const dirLight = new HemisphericLight('light2', new Vector3(1, 0.5, -1), scene)
        dirLight.intensity = 0.5
        dirLight.specular = new Color3(1, 1, 1)

        // Initialize weapon assembler
        weaponAssemblerRef.current = new WeaponAssembler(scene)
        weaponAssemblerRef.current.assembleWeapon(weaponType, params, explodedViewDistance)

        engine.runRenderLoop(() => {
            scene.render()
        })

        const handleResize = () => {
            engine.resize()
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            weaponAssemblerRef.current?.dispose()
            engine.dispose()
        }
    }, [])

    // Update weapon when type, params, or exploded view changes
    useEffect(() => {
        if (!weaponAssemblerRef.current) return
        weaponAssemblerRef.current.assembleWeapon(weaponType, params, explodedViewDistance)
    }, [weaponType, params, explodedViewDistance])

    return (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    )
}

export default Scene
