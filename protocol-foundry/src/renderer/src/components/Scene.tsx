import React, { useEffect, useRef } from 'react'
import {
    Engine,
    Scene as BabylonScene,
    Vector3,
    HemisphericLight,
    ArcRotateCamera,
    Color4
} from '@babylonjs/core'
import { WeaponGenerator } from '../utils/WeaponGenerator'
import { useWeaponStore } from '../store'

const Scene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const weaponGeneratorRef = useRef<WeaponGenerator | null>(null)
    const weaponType = useWeaponStore((state) => state.weaponType)

    useEffect(() => {
        if (!canvasRef.current) return

        const engine = new Engine(canvasRef.current, true)
        const scene = new BabylonScene(engine)

        scene.clearColor = new Color4(0.05, 0.05, 0.05, 1)

        const camera = new ArcRotateCamera('camera1', -Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene)
        camera.attachControl(canvasRef.current, true)

        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene)
        light.intensity = 0.7

        // Initialize weapon generator
        weaponGeneratorRef.current = new WeaponGenerator(scene)
        weaponGeneratorRef.current.generateWeapon(weaponType)

        engine.runRenderLoop(() => {
            scene.render()
        })

        const handleResize = () => {
            engine.resize()
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            weaponGeneratorRef.current?.dispose()
            engine.dispose()
        }
    }, [])

    // Update weapon when type changes
    useEffect(() => {
        if (weaponGeneratorRef.current) {
            weaponGeneratorRef.current.generateWeapon(weaponType)
        }
    }, [weaponType])

    return <canvas ref={canvasRef} className="w-full h-full outline-none" />
}

export default Scene

