import bpy
import bmesh
from mathutils import Vector
import math
import os

# Ensure the script runs in object mode
if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')

# --- Scene Setup ---
# Clear existing objects from the scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# --- Configuration ---
# High-precision specifications for Valorant-style weapons
WEAPONS = {
    'Vandal': {  # Assault Rifle
        'barrel_length': 1.2, 'grip_length': 0.3, 'magazine_size': (0.1, 0.25, 0.3),
        'has_scope': True, 'has_silencer': False, 'poly_count': 25000
    },
    'Phantom': {  # SMG
        'barrel_length': 0.8, 'grip_length': 0.25, 'magazine_size': (0.08, 0.2, 0.28),
        'has_scope': False, 'has_silencer': True, 'poly_count': 18000
    },
    'Operator': {  # Sniper Rifle
        'barrel_length': 2.0, 'grip_length': 0.35, 'magazine_size': (0.12, 0.15, 0.2),
        'has_scope': True, 'has_silencer': False, 'poly_count': 40000
    },
    'Sheriff': {  # Revolver
        'barrel_length': 0.6, 'grip_length': 0.2, 'magazine_size': (0.1, 0.1, 0.1), # Revolver cylinder
        'has_scope': False, 'has_silencer': False, 'poly_count': 12000
    },
    'Classic': {  # Pistol
        'barrel_length': 0.5, 'grip_length': 0.18, 'magazine_size': (0.06, 0.18, 0.22),
        'has_scope': False, 'has_silencer': False, 'poly_count': 8000
    }
}

# --- Helper Functions ---

def create_pbr_material(name, color=(0.8, 0.8, 0.8, 1), metallic=0.8, roughness=0.2):
    """Creates a PBR material with metallic, roughness, and procedural normal map."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")

    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness

        # Add a procedural noise texture for surface detail
        tex_noise = mat.node_tree.nodes.new('ShaderNodeTexNoise')
        tex_noise.inputs['Scale'].default_value = 150.0
        tex_noise.inputs['Detail'].default_value = 16.0

        # Add a bump node to convert noise to normal data
        bump_node = mat.node_tree.nodes.new('ShaderNodeBump')
        bump_node.inputs['Strength'].default_value = 0.05

        # Connect nodes
        mat.node_tree.links.new(tex_noise.outputs['Fac'], bump_node.inputs['Height'])
        mat.node_tree.links.new(bump_node.outputs['Normal'], bsdf.inputs['Normal'])

    return mat

def create_base_mesh(name, mesh_primitive, **kwargs):
    """Creates a mesh primitive, names it, and returns the object."""
    mesh_primitive(**kwargs)
    obj = bpy.context.active_object
    obj.name = name
    return obj

def apply_modifiers(obj, bevel=True, subdivision=1):
    """Applies common modifiers for a high-poly look."""
    if bevel:
        bpy.ops.object.modifier_add(type='BEVEL')
        obj.modifiers["Bevel"].width = 0.005
        obj.modifiers["Bevel"].segments = 3

    if subdivision > 0:
        bpy.ops.object.modifier_add(type='SUBSURF')
        obj.modifiers["Subdivision"].levels = subdivision
        obj.modifiers["Subdivision"].render_levels = subdivision

# --- Main Generation Logic ---

def generate_weapon(name, specs):
    """Generates a complete, high-poly weapon with an armature and animations."""

    # --- Armature Setup ---
    bpy.ops.object.armature_add(enter_editmode=True)
    armature = bpy.context.active_object
    armature.name = f"{name}_Armature"

    # Define bones
    bones = armature.data.edit_bones
    root_bone = bones.get('Bone')
    root_bone.name = "Root"

    barrel_bone = bones.new("Barrel")
    barrel_bone.head = (0, 0, 0)
    barrel_bone.tail = (0, 0, specs['barrel_length'])
    barrel_bone.parent = root_bone

    magazine_bone = bones.new("Magazine")
    magazine_bone.head = (0, -0.1, -0.1)
    magazine_bone.tail = (0, -0.1, -0.3)
    magazine_bone.parent = root_bone

    bpy.ops.object.mode_set(mode='OBJECT')

    # --- Mesh Creation ---
    parts = [] # To join them later

    # 1. Main Body/Receiver (the central part)
    receiver = create_base_mesh(f"{name}_Receiver", bpy.ops.mesh.primitive_cube_add, size=1)
    receiver.scale = (0.1, 0.4, 0.8)
    receiver.location = (0, 0, 0)
    apply_modifiers(receiver)
    parts.append(receiver)

    # 2. Barrel
    barrel = create_base_mesh(f"{name}_Barrel", bpy.ops.mesh.primitive_cylinder_add,
                              vertices=64, radius=0.03, depth=specs['barrel_length'])
    barrel.location = (0, 0, specs['barrel_length'] / 2)
    parts.append(barrel)

    # 3. Grip
    grip = create_base_mesh(f"{name}_Grip", bpy.ops.mesh.primitive_cube_add, size=1)
    grip.scale = (0.08, 0.15, specs['grip_length'])
    grip.location = (0, -0.2, -0.2)
    parts.append(grip)

    # 4. Magazine
    if name == 'Sheriff': # Revolver cylinder
        mag = create_base_mesh(f"{name}_Magazine", bpy.ops.mesh.primitive_cylinder_add,
                               vertices=12, radius=specs['magazine_size'][0], depth=specs['magazine_size'][1])
    else: # Standard magazine
        mag = create_base_mesh(f"{name}_Magazine", bpy.ops.mesh.primitive_cube_add, size=1)
        mag.scale = specs['magazine_size']
    mag.location = (0, -0.15, -0.25)
    parts.append(mag)

    # 5. Optional Scope
    if specs['has_scope']:
        scope_body = create_base_mesh(f"{name}_Scope", bpy.ops.mesh.primitive_cylinder_add,
                                    vertices=32, radius=0.04, depth=0.3)
        scope_body.rotation_euler.x = math.pi / 2
        scope_body.location = (0, 0.15, 0.3)
        parts.append(scope_body)

    # 6. Optional Silencer
    if specs['has_silencer']:
        silencer = create_base_mesh(f"{name}_Silencer", bpy.ops.mesh.primitive_cylinder_add,
                                    vertices=32, radius=0.04, depth=0.25)
        silencer.location = (0, 0, specs['barrel_length'] + 0.125)
        parts.append(silencer)

    # --- Finalize and Parent ---
    # Join all parts into one mesh
    bpy.ops.object.select_all(action='DESELECT')
    for part in parts:
        part.select_set(True)
    bpy.context.view_layer.objects.active = receiver
    bpy.ops.object.join()

    weapon_mesh = receiver
    weapon_mesh.name = f"{name}_Mesh"

    # Parent mesh to armature
    weapon_mesh.parent = armature
    bpy.ops.object.select_all(action='DESELECT')
    weapon_mesh.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')

    # Assign materials
    weapon_mesh.data.materials.append(create_pbr_material("Gun_Metal", color=(0.1, 0.1, 0.1), metallic=0.9, roughness=0.3))
    weapon_mesh.data.materials.append(create_pbr_material("Gun_Plastic", color=(0.05, 0.05, 0.05), metallic=0.1, roughness=0.5))

    # --- Animation ---
    armature.animation_data_create()

    # 1. Shoot Animation (Recoil)
    shoot_action = bpy.data.actions.new(name=f"{name}_Shoot")
    armature.animation_data.action = shoot_action

    fcurve_loc = shoot_action.fcurves.new(f'pose.bones["Root"].location', index=1) # Y-axis location
    fcurve_loc.keyframe_points.insert(frame=1, value=0.0)
    fcurve_loc.keyframe_points.insert(frame=5, value=-0.05) # Recoil kick
    fcurve_loc.keyframe_points.insert(frame=10, value=0.0)

    fcurve_rot = shoot_action.fcurves.new(f'pose.bones["Root"].rotation_euler', index=0) # X-axis rotation
    fcurve_rot.keyframe_points.insert(frame=1, value=0.0)
    fcurve_rot.keyframe_points.insert(frame=5, value=math.radians(-5)) # Kick up
    fcurve_rot.keyframe_points.insert(frame=10, value=0.0)

    # 2. Reload Animation
    reload_action = bpy.data.actions.new(name=f"{name}_Reload")
    # This is a placeholder; real reload is more complex
    fcurve_mag = reload_action.fcurves.new(f'pose.bones["Magazine"].location', index=1) # Y-axis
    fcurve_mag.keyframe_points.insert(frame=1, value=0)
    fcurve_mag.keyframe_points.insert(frame=15, value=-0.3) # Magazine drops down
    fcurve_mag.keyframe_points.insert(frame=45, value=-0.3)
    fcurve_mag.keyframe_points.insert(frame=60, value=0)


# --- Execution ---
if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "..", "client", "assets", "models", "weapons")
    os.makedirs(output_dir, exist_ok=True)

    for weapon_name, weapon_specs in WEAPONS.items():
        print(f"--- Generating {weapon_name} ---")
        generate_weapon(weapon_name, weapon_specs)

        # Export to GLB format
        filepath = os.path.join(output_dir, f"{weapon_name.lower()}.glb")
        bpy.ops.export_scene.gltf(
            filepath=filepath,
            export_format='GLB',
            export_animations=True,
            export_materials='EXPORT',
            use_selection=True # Only export the selected armature and its children
        )

        # Clean up scene for the next weapon
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()

    print("\n✅ High-precision weapon generation complete!")
    bpy.ops.wm.quit_blender()
