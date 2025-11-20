import React from 'react'
import Editor from './components/Editor'
import Scene from './components/Scene'

function App(): JSX.Element {
    return (
        <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden">
            {/* Left Panel: Editor */}
            <div className="w-1/3 border-r border-gray-700 flex flex-col">
                <div className="p-2 bg-gray-800 font-bold text-sm border-b border-gray-700">
                    SCRIPT EDITOR
                </div>
                <div className="flex-1 relative">
                    <Editor />
                </div>
            </div>

            {/* Center Panel: 3D Scene */}
            <div className="flex-1 relative bg-black">
                <Scene />
                <div className="absolute top-4 left-4 text-xs text-gray-500 pointer-events-none">
                    PROTOCOL: FOUNDRY // PREVIEW
                </div>
            </div>

            {/* Right Panel: Inspector */}
            <div className="w-1/4 border-l border-gray-700 flex flex-col bg-gray-800">
                <div className="p-2 bg-gray-800 font-bold text-sm border-b border-gray-700">
                    INSPECTOR
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">STATUS</label>
                        <div className="text-green-400 text-sm">● SYSTEM ONLINE</div>
                    </div>
                    {/* Placeholders for future controls */}
                    <div className="p-4 border border-dashed border-gray-600 rounded opacity-50 text-center text-xs">
                        SIMULATION CONTROLS COMING SOON
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
