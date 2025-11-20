import { Scene, MeshBuilder, Mesh, Vector3, Color3, StandardMaterial } from '@babylonjs/core'
import { WeaponParams } from '../store'
import { MaterialGenerator } from './MaterialGenerator'

/**
 * PartFabricator - Valorant 精確設計
 * 基於官方武器庫和設計指南
 */
export class PartFabricator {
    private scene: Scene
    private materialGen: MaterialGenerator

    constructor(scene: Scene) {
        this.scene = scene
        this.materialGen = new MaterialGenerator(scene)
    }

    // ==================== 機匣 ====================
    public createReceiver(type: 'pistol' | 'rifle', params: WeaponParams): Mesh {
        const receiver = new Mesh('receiver', this.scene)

        if (type === 'rifle') {
            // Vandal 風格 - 上機匣
            const upper = MeshBuilder.CreateBox('upper', {
                width: 0.4, height: 0.07, depth: 0.08
            }, this.scene)
            upper.position = new Vector3(0.2, 0.035, 0)
            upper.parent = receiver

            // 下機匣
            const lower = MeshBuilder.CreateBox('lower', {
                width: 0.35, height: 0.08, depth: 0.06
            }, this.scene)
            lower.position = new Vector3(0.175, -0.04, 0)
            lower.parent = receiver

            // 彈匣井
            const magwell = MeshBuilder.CreateBox('magwell', {
                width: 0.08, height: 0.12, depth: 0.05
            }, this.scene)
            magwell.position = new Vector3(0.12, -0.1, 0)
            magwell.parent = receiver

            // 手槍握把
            const grip = MeshBuilder.CreateBox('grip', {
                width: 0.05, height: 0.11, depth: 0.04
            }, this.scene)
            grip.position = new Vector3(0.075, -0.14, 0)
            grip.rotation.z = -0.22
            grip.parent = receiver

            // 頂部瞄準平台
            const platform = MeshBuilder.CreateBox('sight_platform', {
                width: 0.2, height: 0.015, depth: 0.03
            }, this.scene)
            platform.position = new Vector3(0.22, 0.078, 0)
            platform.parent = receiver

        } else {
            // Ghost 風格 - 滑套
            const slide = MeshBuilder.CreateBox('slide', {
                width: 0.18, height: 0.045, depth: 0.035
            }, this.scene)
            slide.position = new Vector3(0.09, 0.0225, 0)
            slide.parent = receiver

            // 框架
            const frame = MeshBuilder.CreateBox('frame', {
                width: 0.16, height: 0.065, depth: 0.032
            }, this.scene)
            frame.position = new Vector3(0.08, -0.0325, 0)
            frame.parent = receiver

            // 握把
            const grip = MeshBuilder.CreateBox('grip', {
                width: 0.04, height: 0.09, depth: 0.035
            }, this.scene)
            grip.position = new Vector3(0.05, -0.08, 0)
            grip.rotation.z = -0.15
            grip.parent = receiver
        }

        const mat = this.materialGen.createPBRMaterial('receiver_mat', {
            ...params,
            metalness: 0.75,
            roughness: 0.45
        })
        receiver.getChildMeshes().forEach(m => m.material = mat)
        return receiver
    }

    // ==================== 槍管 ====================
    public createBarrel(type: 'pistol' | 'rifle' | 'knife', params: WeaponParams): Mesh {
        if (type === 'knife') return this.createKnifeBlade(params)

        const barrel = new Mesh('barrel', this.scene)
        const len = type === 'rifle' ? 0.55 : 0.12
        const dia = type === 'rifle' ? 0.022 : 0.015

        // 主槍管
        const main = MeshBuilder.CreateCylinder('barrel_main', {
            height: len, diameter: dia, tessellation: 12
        }, this.scene)
        main.rotation.z = Math.PI / 2
        main.position.x = len / 2
        main.parent = barrel

        if (type === 'rifle') {
            // 消焰器 - 六角形
            const muzzle = MeshBuilder.CreateCylinder('muzzle', {
                height: 0.05, diameter: 0.032, tessellation: 6
            }, this.scene)
            muzzle.rotation.z = Math.PI / 2
            muzzle.position.x = len - 0.025
            muzzle.parent = barrel
        }

        const mat = this.materialGen.createPBRMaterial('barrel_mat', {
            ...params,
            metalness: 0.9,
            roughness: 0.28
        })
        barrel.getChildMeshes().forEach(m => m.material = mat)
        return barrel
    }

    private createKnifeBlade(params: WeaponParams): Mesh {
        const blade = new Mesh('blade', this.scene)

        // 刀身
        const body = MeshBuilder.CreateBox('blade_body', {
            width: 0.3, height: 0.08, depth: 0.015
        }, this.scene)
        body.position.x = 0.15
        body.parent = blade

        // 刀尖
        const tip = MeshBuilder.CreateCylinder('blade_tip', {
            height: 0.1, diameterTop: 0, diameterBottom: 0.08, tessellation: 3
        }, this.scene)
        tip.rotation.z = Math.PI / 2
        tip.position.x = 0.35
        tip.parent = blade

        const mat = this.materialGen.createPBRMaterial('blade_mat', {
            ...params,
            metalness: 0.95,
            roughness: 0.15
        })
        blade.getChildMeshes().forEach(m => m.material = mat)
        return blade
    }

    // ==================== 護木 ====================
    public createHandguard(type: 'rifle' | 'pistol', params: WeaponParams): Mesh {
        const handguard = new Mesh('handguard', this.scene)
        if (type === 'pistol') return handguard // 手槍無護木

        const len = 0.35

        // 主體 - 方形
        const body = MeshBuilder.CreateBox('hg_body', {
            width: len, height: 0.055, depth: 0.07
        }, this.scene)
        body.position.x = len / 2
        body.parent = handguard

        // 頂部導軌
        if (params.railSystem) {
            const rail = MeshBuilder.CreateBox('top_rail', {
                width: len, height: 0.012, depth: 0.028
            }, this.scene)
            rail.position = new Vector3(len / 2, 0.034, 0)
            rail.parent = handguard

            // 導軌槽紋
            for (let i = 0; i < 7; i++) {
                const slot = MeshBuilder.CreateBox(`slot_${i}`, {
                    width: 0.01, height: 0.01, depth: 0.03
                }, this.scene)
                slot.position = new Vector3((i + 1) * len / 8, 0.039, 0)
                slot.parent = handguard
            }
        }

        // M-LOK 側面開孔
        for (let i = 0; i < 4; i++) {
            const hole = MeshBuilder.CreateBox(`mlok_${i}`, {
                width: 0.04, height: 0.02, depth: 0.006
            }, this.scene)
            hole.position = new Vector3((i + 0.5) * len / 5, 0, 0.037)
            hole.parent = handguard
        }

        const mat = this.materialGen.createPBRMaterial('hg_mat', {
            ...params,
            color: '#2d2d2d',
            metalness: 0.15,
            roughness: 0.75
        })
        handguard.getChildMeshes().forEach(m => {
            if (!m.material) m.material = mat
        })
        return handguard
    }

    // ==================== 彈匣 ====================
    public createMagazine(type: 'pistol' | 'rifle', params: WeaponParams): Mesh {
        const mag = new Mesh('magazine', this.scene)

        const h = type === 'rifle' ? 0.35 : 0.22
        const w = type === 'rifle' ? 0.065 : 0.035

        // 主體
        const body = MeshBuilder.CreateBox('mag_body', {
            width: w, height: h, depth: 0.08
        }, this.scene)
        body.position.y = -h / 2
        body.parent = mag

        // 底板
        const base = MeshBuilder.CreateBox('baseplate', {
            width: w + 0.01, height: 0.02, depth: 0.09
        }, this.scene)
        base.position.y = -h - 0.01
        base.parent = mag

        // 供彈口
        const lips = MeshBuilder.CreateBox('feedlips', {
            width: w - 0.005, height: 0.015, depth: 0.075
        }, this.scene)
        lips.position.y = 0.008
        lips.parent = mag

        // 防滑紋
        for (let i = 0; i < 3; i++) {
            const ridge = MeshBuilder.CreateBox(`ridge_${i}`, {
                width: w + 0.003, height: 0.008, depth: 0.082
            }, this.scene)
            ridge.position.y = -h * 0.25 - i * h * 0.25
            ridge.parent = mag
        }

        const mat = this.materialGen.createPBRMaterial('mag_mat', {
            ...params,
            color: '#1a1a1a',
            metalness: 0.2,
            roughness: 0.8
        })
        mag.getChildMeshes().forEach(m => {
            if (!m.material) m.material = mat
        })
        return mag
    }

    // ==================== 瞄具 ====================
    public createScope(type: 'iron' | 'red_dot' | 'sniper', params: WeaponParams): Mesh {
        const scope = new Mesh('scope', this.scene)

        if (type === 'iron') {
            // 準星
            const front = MeshBuilder.CreateBox('front_sight', {
                width: 0.008, height: 0.04, depth: 0.015
            }, this.scene)
            front.position.y = 0.02
            front.parent = scope

            // 照門
            const rear = MeshBuilder.CreateBox('rear_sight', {
                width: 0.02, height: 0.035, depth: 0.025
            }, this.scene)
            rear.position = new Vector3(-0.08, 0.018, 0)
            rear.parent = scope

        } else if (type === 'red_dot') {
            // 外殼
            const housing = MeshBuilder.CreateBox('optic_housing', {
                width: 0.07, height: 0.05, depth: 0.06
            }, this.scene)
            housing.position.y = 0.025
            housing.parent = scope

            // 鏡片
            const lens = MeshBuilder.CreateBox('lens', {
                width: 0.001, height: 0.035, depth: 0.045
            }, this.scene)
            lens.position = new Vector3(0.04, 0.025, 0)
            lens.parent = scope

            const glassMat = new StandardMaterial('glass', this.scene)
            glassMat.diffuseColor = new Color3(0.1, 0.2, 0.4)
            glassMat.alpha = 0.4
            lens.material = glassMat

            // 固定座
            const mount = MeshBuilder.CreateBox('mount', {
                width: 0.04, height: 0.015, depth: 0.04
            }, this.scene)
            mount.position.y = -0.008
            mount.parent = scope
        }

        const mat = this.materialGen.createPBRMaterial('scope_mat', {
            ...params,
            color: '#0f0f0f',
            metalness: 0.7,
            roughness: 0.3
        })
        scope.getChildMeshes().forEach(m => {
            if (!m.material) m.material = mat
        })
        return scope
    }

    // ==================== 槍托 ====================
    public createStock(type: 'standard' | 'tactical', params: WeaponParams): Mesh {
        const stock = new Mesh('stock', this.scene)

        if (type === 'tactical') {
            // 緩衝管
            const buffer = MeshBuilder.CreateCylinder('buffer_tube', {
                height: 0.25, diameter: 0.03, tessellation: 12
            }, this.scene)
            buffer.rotation.z = Math.PI / 2
            buffer.position = new Vector3(-0.125, 0.015, 0)
            buffer.parent = stock

            // 槍托主體
            const body = MeshBuilder.CreateBox('stock_body', {
                width: 0.12, height: 0.1, depth: 0.05
            }, this.scene)
            body.position = new Vector3(-0.31, 0.015, 0)
            body.parent = stock

            // 抵肩板
            const buttplate = MeshBuilder.CreateBox('buttplate', {
                width: 0.015, height: 0.12, depth: 0.07
            }, this.scene)
            buttplate.position = new Vector3(-0.38, 0.015, 0)
            buttplate.parent = stock

            // 調節卡槽
            for (let i = 0; i < 5; i++) {
                const notch = MeshBuilder.CreateBox(`notch_${i}`, {
                    width: 0.003, height: 0.032, depth: 0.032
                }, this.scene)
                notch.position = new Vector3(-0.2 + i * 0.035, 0.015, 0)
                notch.parent = stock
            }
        }

        const mat = this.materialGen.createPBRMaterial('stock_mat', {
            ...params,
            color: '#1f1f1f',
            metalness: 0.1,
            roughness: 0.85
        })
        stock.getChildMeshes().forEach(m => {
            if (!m.material) m.material = mat
        })
        return stock
    }
}
