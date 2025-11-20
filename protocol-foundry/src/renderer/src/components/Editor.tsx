import React, { useEffect, useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useWeaponStore, WeaponType } from '../store'

// Explicitly configure Monaco to use local package
loader.config({ monaco })

const PROTOCOL_TEMPLATES: Record<WeaponType, object> = {
  knife: {
    protocol_version: "1.0",
    weapon_id: "tactical_knife_001",
    metadata: {
      name: "Combat Knife",
      author: "System",
      created_at: new Date().toISOString()
    },
    parts: {
      blade: {
        type: "knife_blade",
        length: 1.0,
        material: "steel",
        finish: "satin"
      },
      handle: {
        type: "polymer_grip",
        texture: "diamond_knurl"
      }
    }
  },
  pistol: {
    protocol_version: "1.0",
    weapon_id: "sidearm_001",
    metadata: {
      name: "Standard Sidearm",
      author: "System",
      created_at: new Date().toISOString()
    },
    parts: {
      frame: { type: "pistol_frame", material: "polymer" },
      slide: { type: "pistol_slide", material: "steel" },
      barrel: { type: "pistol_barrel", length: 0.8 },
      magazine: { type: "pistol_mag", capacity: 12 }
    }
  },
  rifle: {
    protocol_version: "1.0",
    weapon_id: "assault_rifle_001",
    metadata: {
      name: "Assault Rifle",
      author: "System",
      created_at: new Date().toISOString()
    },
    parts: {
      receiver: { type: "rifle_receiver", material: "aluminum" },
      barrel: { type: "rifle_barrel", length: 1.2, rifling: "1:7" },
      handguard: { type: "rail_system", length: 1.0 },
      magazine: { type: "rifle_mag", capacity: 30 },
      stock: { type: "adjustable_stock" },
      optic: { type: "red_dot_sight" }
    }
  }
}

const Editor: React.FC = () => {
  const { weaponType } = useWeaponStore()
  const [code, setCode] = useState('')

  useEffect(() => {
    const template = PROTOCOL_TEMPLATES[weaponType]
    setCode(JSON.stringify(template, null, 2))
  }, [weaponType])

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="json"
      value={code}
      onChange={(value) => setCode(value || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 12,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        readOnly: false,
        wordWrap: 'on'
      }}
    />
  )
}

export default Editor
