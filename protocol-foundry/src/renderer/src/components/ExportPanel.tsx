import React from 'react'
import { useWeaponStore } from '../store'

const ExportPanel: React.FC = () => {
    const { weaponType, params } = useWeaponStore()

    const getProtocolJson = () => {
        return {
            protocol_version: "1.0",
            weapon_id: `custom_${weaponType}_${Date.now().toString().slice(-6)}`,
            metadata: {
                name: `Custom ${weaponType.charAt(0).toUpperCase() + weaponType.slice(1)}`,
                created_at: new Date().toISOString()
            },
            configuration: {
                type: weaponType,
                parameters: params
            }
        }
    }

    const handleExportProtocol = () => {
        const protocol = getProtocolJson()
        const blob = new Blob([JSON.stringify(protocol, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `protocol_${weaponType}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto flex flex-col">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Protocol Export
            </div>

            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded space-y-2">
                <div className="text-xs text-gray-400">CURRENT CONFIGURATION</div>
                <div className="font-mono text-xs text-blue-300 break-all">
                    ID: custom_{weaponType}_{Date.now().toString().slice(-6)}
                </div>
                <div className="flex gap-2 text-[10px] text-gray-500">
                    <span>PARAMS: {Object.keys(params).length}</span>
                    <span>•</span>
                    <span>VALID: TRUE</span>
                </div>
            </div>

            {/* Live Code Preview */}
            <div className="flex-1 min-h-[200px] bg-gray-950 border border-gray-800 rounded p-2 overflow-hidden flex flex-col">
                <div className="text-[10px] text-gray-500 font-mono mb-2 border-b border-gray-800 pb-1">PREVIEW: protocol.json</div>
                <pre className="flex-1 overflow-auto text-[10px] font-mono text-green-400/80 leading-relaxed scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {JSON.stringify(getProtocolJson(), null, 2)}
                </pre>
            </div>

            <div className="space-y-2 mt-auto pt-4">
                <button
                    onClick={handleExportProtocol}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <span>DOWNLOAD PROTOCOL (.JSON)</span>
                </button>

                <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-colors opacity-50 cursor-not-allowed">
                    <span>EXPORT 3D MODEL (.GLB)</span>
                </button>
            </div>
        </div>
    )
}

export default ExportPanel
