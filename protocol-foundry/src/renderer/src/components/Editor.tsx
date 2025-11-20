import React from 'react'
import MonacoEditor from '@monaco-editor/react'

const Editor: React.FC = () => {
    const handleEditorChange = (value: string | undefined) => {
        console.log('Code changed:', value)
    }

    return (
        <MonacoEditor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Write your skin logic here...
// Example:
// mesh.scaling.x = 1.5;"
            theme="vs-dark"
            onChange={handleEditorChange}
            loading={<div className="text-white p-4">Loading Editor Resources...</div>}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true
            }}
        />
    )
}

export default Editor
