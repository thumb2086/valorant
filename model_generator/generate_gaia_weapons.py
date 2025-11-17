import bpy
import bmesh
from mathutils import Vector, Euler
import math
import os
import bmesh

# --- Scene Setup ---
# A more robust way to clear the scene
if bpy.ops.object.mode_set.poll():
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
# Also clear materials that might be lingering
for material in bpy.data.materials:
    bpy.data.materials.remove(material)

# --- Configuration ---
# Gaia series weapon specifications, replicating in-game parameters and style
GAIA_WEAPONS = {
    'gaia_vandal': {
        'type': 'AR', 'barrel_len': 1.2, 'grip_len': 0.32, 'mag_size': (0.1, 0.2, 0.35),
        'has_scope': True, 'has_silencer': False, 'polys': 50000, 'color_base': (0.1, 0.7, 0.2)
    },
    'gaia_phantom': {
        'type': 'SMG', 'barrel_len': 0.9, 'grip_len': 0.28, 'mag_size': (0.09, 0.18, 0.3),
        'has_scope': False, 'has_silencer': True, 'polys': 35000, 'color_base': (0.05, 0.65, 0.15)
    },
    'gaia_spectre': {
        'type': 'SMG', 'barrel_len': 0.85, 'grip_len': 0.26, 'mag_size': (0.08, 0.15, 0.28),
        'has_scope': False, 'has_silencer': False, 'polys': 32000, 'color_base': (0.15, 0.75, 0.25)
    },
    'gaia_judge': {
        'type': 'SG', 'barrel_len': 0.7, 'grip_len': 0.24, 'mag_size': (0.15, 0.25, 0.25),
        'muzzle_wide': True, 'has_scope': False, 'has_silencer': False, 'polys': 45000, 'color_base': (0.2, 0.6, 0.1)
    },
    'gaia_frenzy': {
        'type': 'Pistol', 'barrel_len': 0.45, 'grip_len': 0.20, 'mag_size': (0.07, 0.12, 0.2),
        'has_scope': False, 'has_silencer': False, 'polys': 20000, 'color_base': (0.0, 0.55, 0.1)
    },
    'gaia_karambit': {  # Bonus melee weapon
        'type': 'Knife', 'blade_len': 0.35, 'handle_len': 0.15, 'polys': 15000,
        'color_base': (0.3, 0.8, 0.4)
    }
}

# --- Helper Functions ---

def create_gaia_material(name, base_color, metallic=0.85, roughness=0.15):
    """Creates a PBR material inspired by the Gaia theme: green/gold metal with organic textures."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")

    # Set base PBR values
    bsdf.inputs['Base Color'].default_value = (*base_color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness

    # --- Node setup for organic, vine-like patterns ---
    # Mix two noise textures for varied patterns
    tex_noise_1 = mat.node_tree.nodes.new('ShaderNodeTexNoise')
    tex_noise_1.inputs['Scale'].default_value = 20.0
    tex_noise_1.inputs['Detail'].default_value = 8.0

    tex_noise_2 = mat.node_tree.nodes.new('ShaderNodeTexVoronoi')
    tex_noise_2.inputs['Scale'].default_value = 10.0

    # Mix the textures
    mix_rgb = mat.node_tree.nodes.new('ShaderNodeMixRGB')
    mat.node_tree.links.new(tex_noise_1.outputs['Fac'], mix_rgb.inputs['Color1'])
    mat.node_tree.links.new(tex_noise_2.outputs['Distance'], mix_rgb.inputs['Color2'])
    mix_rgb.blend_type = 'OVERLAY'
    mix_rgb.inputs['Fac'].default_value = 0.6

    # Use the result to influence the base color for a marbled/vine effect
    mat.node_tree.links.new(mix_rgb.outputs['Color'], bsdf.inputs['Base Color'])

    # --- Normal map for vine/leaf veins ---
    bump_noise = mat.node_tree.nodes.new('ShaderNodeTexNoise')
    bump_noise.inputs['Scale'].default_value = 120.0

    bump_node = mat.node_tree.nodes.new('ShaderNodeBump')
    bump_node.inputs['Strength'].default_value = 0.1
    mat.node_tree.links.new(bump_noise.outputs['Fac'], bump_node.inputs['Height'])
    mat.node_tree.links.new(bump_node.outputs['Normal'], bsdf.inputs['Normal'])

    # --- Emission for glowing mycelium/spores ---
    bsdf.inputs['Emission Strength'].default_value = 2.0
    mat.node_tree.links.new(mix_rgb.outputs['Color'], bsdf.inputs['Emission'])

    return mat

def create_twisted_mesh(primitive_func, twist_angle, **kwargs):
    """Creates a mesh and applies a Simple Deform modifier to twist it, creating a vine-like look."""
    primitive_func(**kwargs)
    obj = bpy.context.active_object

    mod = obj.modifiers.new(name="Twist", type='SIMPLE_DEFORM')
    mod.deform_method = 'TWIST'
    mod.angle = math.radians(twist_angle)

    subsurf = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    subsurf.levels = 2
    subsurf.render_levels = 2

    return obj

def add_vine_curves(obj):
    """Adds decorative curves around an object to simulate vines."""
    # This is a complex task; for a script, a simpler approach is to use another mesh
    bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.01, major_segments=128, minor_segments=32)
    vine = bpy.context.active_object
    vine.name = "Vine_Wrap"
    vine.parent = obj
    vine.location = (0, 0, 0)
    vine.scale *= 1.5
    # Material for vines
    vine.data.materials.append(create_gaia_material("Gaia_Vine", base_color=(0.3, 0.2, 0.1), metallic=0.1, roughness=0.8))


# --- Main Generation Logic ---

def generate_gaia_weapon(name, specs):
    """Generates a single Gaia-themed weapon with armature and animations."""

    # --- Armature ---
    bpy.ops.object.armature_add(enter_editmode=True)
    armature = bpy.context.active_object
    armature.name = f"{name}_Armature"

    bones = armature.data.edit_bones
    root_bone = bones.get('Bone')
    root_bone.name = "Root"

    # Bone structure depends on weapon type
    bone_names = []
    if specs['type'] == 'Knife':
        bone_names = ["Blade", "Handle"]
    else:
        bone_names = ["Barrel", "Body", "Grip", "Magazine"]

    for bone_name in bone_names:
        bone = bones.new(bone_name)
        bone.parent = root_bone
        bone.head = (0,0,0)
        bone.tail = (0,0,0.5)

    bpy.ops.object.mode_set(mode='OBJECT')

    # --- Meshes ---
    parts = []
    main_mat = create_gaia_material(f"Gaia_{name}_Main", specs['color_base'])

    if specs['type'] != 'Knife':
        # 1. Barrel
        barrel = create_twisted_mesh(bpy.ops.mesh.primitive_cylinder_add, 45,
                                     vertices=128, radius=0.03, depth=specs['barrel_len'])
        barrel.location.z = specs['barrel_len'] / 2
        parts.append(barrel)

        # 2. Body
        body = bpy.ops.mesh.primitive_cube_add()
        body = bpy.context.active_object
        body.scale = (0.1, 0.4, 0.6)
        parts.append(body)

        # 3. Grip
        grip = create_twisted_mesh(bpy.ops.mesh.primitive_cylinder_add, 20,
                                   vertices=64, radius=0.04, depth=specs['grip_len'])
        grip.location.y = -0.3
        grip.location.z = -0.1
        parts.append(grip)

        # 4. Magazine (leaf-like shape)
        bpy.ops.mesh.primitive_cube_add()
        magazine = bpy.context.active_object
        magazine.scale = specs['mag_size']
        magazine.location.z = -0.3
        # Deform it to look more organic
        magazine.modifiers.new("Displace", "DISPLACE").strength = 0.1
        parts.append(magazine)

        if specs.get('muzzle_wide'):
            bpy.ops.mesh.primitive_cone_add(radius1=0.08, depth=0.15)
            muzzle = bpy.context.active_object
            muzzle.location.z = specs['barrel_len']
            parts.append(muzzle)

    else: # Karambit knife
        bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.02)
        blade = bpy.context.active_object
        # Cut the torus to make a karambit shape
        bpy.ops.object.mode_set(mode='EDIT')
        bm = bmesh.from_edit_mesh(blade.data)
        bm.verts.ensure_lookup_table()
        for v in bm.verts:
            if v.co.x < 0:
                bm.verts.remove(v)
        bmesh.update_edit_mesh(blade.data)
        bpy.ops.object.mode_set(mode='OBJECT')
        parts.append(blade)

    # --- Assembly and Parenting ---
    for part in parts:
        part.data.materials.append(main_mat)
        # Parent each part to the corresponding bone
        part.parent = armature
        part.parent_type = 'BONE'
        if specs['type'] != 'Knife':
            if 'Cylinder' in part.name: # Barrel and Grip
                part.parent_bone = "Barrel" if part.location.z > 0 else "Grip"
            else: # Body and Mag
                part.parent_bone = "Body" if part.location.z >= 0 else "Magazine"
        else:
            part.parent_bone = "Blade"

    # --- Animations ---
    armature.animation_data_create()

    if specs['type'] != 'Knife':
        # Shooting Animation (pulsing scale)
        shoot_action = bpy.data.actions.new(name=f"{name}_Shoot")
        armature.animation_data.action = shoot_action
        fcurve_scale = shoot_action.fcurves.new(f'pose.bones["Barrel"].scale', index=0) # X scale
        fcurve_scale.keyframe_points.insert(1, 1.0)
        fcurve_scale.keyframe_points.insert(5, 1.15) # Pulse bigger
        fcurve_scale.keyframe_points.insert(10, 1.0)

        # Reload Animation (leaf unfolding)
        reload_action = bpy.data.actions.new(name=f"{name}_Reload")
        # Link this as the main action for now
        armature.animation_data.action = reload_action
        fcurve_rot = reload_action.fcurves.new(f'pose.bones["Magazine"].rotation_euler', index=1) # Y axis rotation
        fcurve_rot.keyframe_points.insert(1, 0)
        fcurve_rot.keyframe_points.insert(20, math.radians(90)) # Unfold
        fcurve_rot.keyframe_points.insert(40, 0)

# --- Execution ---
if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "..", "client", "assets", "models", "weapons")
    os.makedirs(output_dir, exist_ok=True)
    texture_dir = os.path.join(output_dir, "textures")
    os.makedirs(texture_dir, exist_ok=True)

    for weapon_name, weapon_specs in GAIA_WEAPONS.items():
        print(f"--- Generating {weapon_name} ---")
        generate_gaia_weapon(weapon_name, weapon_specs)

        # Exporting (Baking textures is complex and slow for a script, often done manually)
        print(f"Exporting {weapon_name} to GLB...")
        filepath = os.path.join(output_dir, f"{weapon_name}.glb")

        # Select the armature to export the whole hierarchy
        bpy.ops.object.select_all(action='DESELECT')
        bpy.context.view_layer.objects.active = bpy.data.objects[f"{weapon_name}_Armature"]
        bpy.data.objects[f"{weapon_name}_Armature"].select_set(True)

        bpy.ops.export_scene.gltf(
            filepath=filepath,
            use_selection=True,
            export_format='GLB',
            export_animations=True,
            export_materials='EXPORT',
            export_lights=False
        )

        # Clean up for the next weapon
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)

    print("\n✅ Gaia series weapon generation complete!")
    bpy.ops.wm.quit_blender()
