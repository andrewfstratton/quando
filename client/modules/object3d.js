import * as THREE from 'three'
import {
	Vector2,
	Vector3
} from 'three'

import { GUI } from 'https://unpkg.com/three@0.139.2/examples/jsm/libs/lil-gui.module.min.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.139.2/examples/jsm/loaders/GLTFLoader.js'
import { NRRDLoader } from 'https://unpkg.com/three@0.139.2/examples/jsm/loaders/NRRDLoader.js'

let quando = window.quando
if (!quando) alert('Fatal Error: object3d must be included after client.js')

let self = quando.object3d = {}
self.width = window.innerWidth
self.height = window.innerHeight
let scene = false
let renderer = false
let camera = false
let camZ = 300
let object = false
let fixed = false
let animation_id = false
let canvas = false

// frame throttling variables
let fps = 20
let fpsInterval, now, then, elapsed
let pulse = false
// volume rendering variables
let volume = false
let volumeConfig, material, colourMapTextures

// hold the buffered updates...
let update_object = {}
let update_fixed = {}

function _clear_object() {
    if (object) {
        scene.remove(object)
        object = false
    }
}
function _clear_fixed() {
    if (fixed) {
        scene.remove(fixed)
        fixed = false
    }
}
function _clear_volume() {
    if (volume) {
        scene.remove(volume)
        volume = false
        // scene = false
        // renderer = false
        // camera = false
        // object = false
        // animation_id = false 
        // canvas = false
    }
}
function _clear_canvas() {
    if (canvas) {
        document.getElementById('quando_3d').removeChild(canvas)
        canvas = false
    }
    if (animation_id) {
        cancelAnimationFrame( animation_id )
        animation_id = false
    }
}

self.clear = function() {
    _clear_object()
    _clear_volume()
    _clear_fixed()
    _clear_canvas()
}

function _update_object(update, object) {
    if (object) {
        if (update) {
            if (update.scaleZ) { 
                object.scale.set(object.scale.x, object.scale.y, update.scaleZ)
                delete update.scaleZ
            }
            if (update.scaleX) { 
                object.scale.set(update.scaleX, object.scale.y, object.scale.z)
                delete update.scaleX
            }
            if (update.scaleY) { 
                object.scale.set(object.scale.x, update.scaleY, object.scale.z)
                delete update.scaleY
            }
            if (update.zoom) {
                const zoomFactor = Math.max(0, 1 + (update.zoom / 100))
                object.scale.set(
                    object.scale.x * zoomFactor, 
                    object.scale.y * zoomFactor, 
                    object.scale.z * zoomFactor
                )
                delete update.zoom
            }
            if (update.y) { object.position.y = update.y; delete update.y }
            if (update.x) { object.position.x = update.x; delete update.x }
            if (update._roll) { object.rotation.z = update._roll; delete update._roll }
            if (update._pitch) { object.rotation.x = update._pitch; delete update._pitch }
            if (update._yaw) { object.rotation.y = update._yaw; delete update._yaw }
        }
    }
}

// TODO: check axes here this dont work right
function _update_volume(update, volume) {
    if (volume) {
        if (update) {
            if (update.scaleZ) { 
                volume.scale.set(volume.scale.x, volume.scale.y, update.scaleZ)
                delete update.scaleZ
            }
            if (update.scaleX) { 
                volume.scale.set(update.scaleX, volume.scale.y, volume.scale.z)
                delete update.scaleX
            }
            if (update.scaleY) { 
                volume.scale.set(volume.scale.x, update.scaleY, volume.scale.z)
                delete update.scaleY
            }
            if (update.zoom) {
                const zoomFactor = Math.max(0, 1 + (update.zoom / 100))
                volume.scale.set(
                    volume.scale.x * zoomFactor, 
                    volume.scale.y * zoomFactor, 
                    volume.scale.z * zoomFactor
                )
                delete update.zoom
            }
            if (update.y) { volume.position.y = update.y; delete update.y }
            if (update.x) { volume.position.x = update.x; delete update.x }
            if (update._roll) { volume.rotation.y = update._roll; delete update._roll }
            if (update._pitch) { volume.rotation.x = -update._pitch; delete update._pitch }
            if (update._yaw) { volume.rotation.z = update._yaw; delete update._yaw }
        }
    }
}

function _setup_scene_for_object() {
    if (renderer == false) {
        renderer = new THREE.WebGLRenderer()
        camera = new THREE.PerspectiveCamera( 25, self.width/self.height, 0.0001, 1000000 )
        camera.position.z = 100 // pull back camera
        camera.up = new THREE.Vector3(0,1,0)
        camera.lookAt(new THREE.Vector3(0,0,0))
        scene = new THREE.Scene()
        renderer.setSize(self.width, self.height) // start the renderer
        // attach the render-supplied DOM element to container
        canvas = renderer.domElement
        document.getElementById('quando_3d').append(canvas)
        let pointLight = new THREE.PointLight( 0xFFFFFF )
        pointLight.position.set(10, 50, 230)
        scene.add(pointLight)
        let light = new THREE.AmbientLight( 0xAAAAAA )
        scene.add( light )
        // init fps throttling
        fpsInterval = 1000 / fps
        then = window.performance.now()
    }
}

function _get_object3D_center(obj) {
    obj.geometry.computeBoundingBox();
    console.log(obj);
    let bounds;
    if (obj.geometry.boundingBox) {
        bounds = obj.geometry.boundingBox
        return {
            x: (bounds.max.x - bounds.min.x) / 2,
            y: (bounds.max.y - bounds.min.y) / 2,
            z: (bounds.max.z - bounds.min.z) / 2,
        }
    } else {
        bounds = obj.geometry.boundingSphere
        return {
            x: bounds.center.x / 2,
            y: bounds.center.y / 2,
            z: bounds.center.z / 2,
        }
    }    
}

// TODO: rename promise to reflect its resolve data
function _setup_scene_for_volume(vol_mesh, showGUI) {
    return new Promise((resolve, reject) => {

        if (renderer === false) {
            scene = new THREE.Scene()
            renderer = new THREE.WebGLRenderer()
            renderer.setPixelRatio( window.devicePixelRatio )
            renderer.setSize( window.innerWidth, window.innerHeight )
            canvas = renderer.domElement
            document.getElementById('quando_3d').append(canvas)
            // -- configure camera
            const aspect = window.innerWidth / window.innerHeight
            // frustum height
            const h = 512  
            let ortho = true;
            // camera z position must be far back to mitigate clipping errors
            if (ortho) {
                camera = new THREE.OrthographicCamera(
                    - h * aspect / 2, 
                    h * aspect / 2, 
                    h / 2, 
                    - h / 2, 
                    0.1, 
                    10000 
                );
                camZ = 1000;
            }
            if (!ortho) camera = new THREE.PerspectiveCamera(90, aspect, 0.1, 10000 )
        }

        if (showGUI) _showGUI()

        // set camera to look at volume center
        let vol_center = _get_object3D_center(vol_mesh)
        camera.position.set(vol_center.x, vol_center.y, camZ)
        camera.lookAt(vol_center.x, vol_center.y, 0)
        camera.up.set( 0, 0, 1 ) // In volume data data, z is up
        
        resolve(vol_center)
    })
}

const _showGUI = () => {
    const gui = new GUI()
    const CLIM_MAX = 504800;
    const ISO_MAX = 100000;
    // The gui for volume interaction
    gui.add( volumeConfig, 'clim1', 0, CLIM_MAX, 0.01 ).onChange( _updateUniforms )
    gui.add( volumeConfig, 'clim2', 0, CLIM_MAX, 0.01 ).onChange( _updateUniforms )
    gui.add( volumeConfig, 'mask_clim1', 0, CLIM_MAX, 0.01 ).onChange( _updateUniforms )
    gui.add( volumeConfig, 'mask_clim2', 0, CLIM_MAX, 0.01 ).onChange( _updateUniforms )
    gui.add( volumeConfig, 'mixamount', 0.0, 1.0, 0.01 ).onChange( _updateUniforms )
    gui.add( volumeConfig, 'colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( _updateUniforms )
    gui.add( volumeConfig, 'mask_colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( _updateUniforms )
    gui.add( volumeConfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( _updateUniforms ) 
    gui.add( volumeConfig, 'isothreshold', 0, ISO_MAX, 0.01 ).onChange( _updateUniforms )
}

let isoOffset;
let timeFactor = 1000;
let strFactor = 66;
let _pulseIso = (newTime) => {
    isoOffset = (Math.sin(newTime/timeFactor) + 1) * strFactor
    material.uniforms[ 'u_renderthreshold' ].value = volumeConfig.isothreshold + isoOffset
}

function _update_scene(newTime) {
    animation_id = requestAnimationFrame(_update_scene)
    _update_object(update_object, object)
    _update_object(update_fixed, fixed)
    _update_volume(update_object, volume)
    if (pulse === "true") _pulseIso(newTime)

    // throttle rerenders to specific fps value
    now = newTime 
    elapsed = now - then
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval)
        renderer.render(scene, camera)
    }
}

function _add_object(obj) {
    _setup_scene_for_object()
    _clear_object()
    object = obj
    // add an object to the scene
    object.rotation.order='ZXY'
    scene.add(object)
    console.log(scene)
    _update_scene()
}

function _add_fixed_object(_fixed) {
    _setup_scene_for_object()
    _clear_fixed()
    fixed = _fixed
    scene.add(fixed)
    _update_scene()
}

function _add_volume(vol_mesh, showGUI) {
    _clear_volume()
    _setup_scene_for_volume(vol_mesh, showGUI)
        .then(vol_center => {
            // create parent empty for volume rotation
            let rotationParent = new THREE.Object3D()
            volume = rotationParent
            // set parent at volume center
            rotationParent.position.set(vol_center.x, vol_center.y, vol_center.z)
            rotationParent.add(vol_mesh) 
            // move volume mesh to parent point
            vol_mesh.translateX(-vol_center.x)
            vol_mesh.translateY(-vol_center.y)
            vol_mesh.translateZ(-vol_center.z)
            // add parent to scene
            scene.add(rotationParent)
            // begin rendering
            // init fps throttling
            fpsInterval = 1000 / fps
            then = window.performance.now()
            _update_scene()
        })
        .catch(err => console.log(err))
}

self.in_out = (val, mid, range, inverted, fixed=false) => {
    var buffered = fixed?update_fixed:update_object
    mid *= 10; range *= 10 // convert to mm
    buffered.zoom = quando.convert_linear(val, mid, range, inverted)
}

self.left_right = (val, mid, range, inverted, fixed=false) => {
    inverted = !inverted
    let buffered = fixed?update_fixed:update_object
    mid *= 10; range *= 10 // convert to mm
    buffered.x = quando.convert_linear(val, mid, range, !inverted) // yes - inverted must be inverted...
}

self.up_down = (val, mid, range, inverted, fixed=false) => {
    let buffered = fixed?update_fixed:update_object
    mid *= 10; range *= 10 // convert to mm
    buffered.y = quando.convert_linear(val, mid, range, inverted)
}

self.roll = function (val, mid, range, inverted, fixed=false) {
    var buffered = fixed?update_fixed:update_object
    buffered._roll = quando.convert_angle(val, mid, range, inverted)
}

self.pitch = function (val, mid, range, inverted, fixed=false) {
    var buffered = fixed?update_fixed:update_object
    buffered._pitch = quando.convert_angle(val, mid, range, inverted)
}

self.yaw = function (val, mid, range, inverted, fixed=false) {
    var buffered = fixed?update_fixed:update_object
    buffered._yaw = quando.convert_angle(val, mid, range, inverted)
}

self.scale = function (val, axis, mid, range, inverted, fixed=false, pct) {
    let buffered = fixed?update_fixed:update_object
    switch (axis) {
        case "x":
            buffered.scaleX = quando.convert_linear(val, mid, range, inverted)
            if (pct) buffered.scaleX = pct / 100
            break;
        case "y":
            buffered.scaleY = quando.convert_linear(val, mid, range, inverted)
            if (pct) buffered.scaleY = pct / 100
            break;
        case "z":
            buffered.z = quando.convert_linear(val, mid, range, inverted)
            if (pct) buffered.z = pct / 100
            break;
        default:
            break;
    }
}

function _load_obj(loader, path, obj) {
    loader.setPath(path)
    loader.load(obj, function(result) {
        _add_object(result)
    })
}

self.loadOBJ = function (path, obj) {
    // N.B. Assumes that the <filename>.obj has an associated <filename>.mtl and
    // that textures are in the same folder
    // TODO needs to handle images inside folders
    var mtl = obj.substr(0, obj.length-3) + 'mtl'
    var mtlLoader = new THREE.MTLLoader()
    mtlLoader.setPath(path)
    var loader = new THREE.OBJLoader()
    mtlLoader.load( mtl, function( materials ) {
        materials.preload()
        var loader = new THREE.OBJLoader()
        loader.setMaterials(materials)
        _load_obj(loader, path, obj)
    }, null, function() {
        _load_obj(loader, path, obj)
    })
}

self.loadGLTF = function(filename, fixed=false) {
    if (filename) {
        filename = '/media/' + encodeURI(filename)
        let loader = new GLTFLoader()
        loader.load(filename, function ( gltf ) {
            if (fixed) {
                _add_fixed_object(gltf.scene)
            } else {
                _add_object(gltf.scene)
            }
        })
    } else {
        if (fixed) {
            _clear_fixed()
        } else {
            _clear_object()
        }
    }
}

self.loadObject = (filename, fixed) => {
    if (filename.includes(".gltf")) return self.loadGLTF(filename, fixed)
    if (filename.includes(".nrrd")) return self.loadVolume(filename, true, 100, false, '')
    // as fallback assume gltf
    return self.loadGLTF(filename, fixed)
}

self.loadVolume = async function(
    filename, showGUI, 
    defaultIso, pulseRequired = false, 
    maskFilename, 
    clim1, clim2,
    mask_clim1, mask_clim2,
    mixamount,
    renderstyle,
    colormap, mask_colormap,
) {
    if (!filename) return _clear_volume()
    filename = '/media/' + encodeURI(filename)
    if (maskFilename.length > 0) maskFilename = '/media/' + encodeURI(maskFilename)
    pulse = pulseRequired

    // if mask 
    console.log(maskFilename.length)
    if (maskFilename.length > 0) {
        // load mask data
        console.log("mask loading")
        new NRRDLoader().load(maskFilename, (maskVolume) => {
            new NRRDLoader().load(filename, (volume) => {
                // Texture to hold the volume. We have scalars, so we put our data in the red channel.
                // THREEJS will select R32F (33326) based on the THREE.RedFormat and THREE.FloatType.
                // Also see https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
                let mainTexture = new THREE.Data3DTexture( 
                    _ensureCorrectDataType(volume.data), volume.xLength, volume.yLength, volume.zLength 
                )
                mainTexture.format = THREE.RedFormat 
                mainTexture.type = THREE.FloatType 
                mainTexture.minFilter = mainTexture.magFilter = THREE.LinearFilter 
                mainTexture.unpackAlignment = 1 
                mainTexture.needsUpdate = true 
                let maskTexture = new THREE.Data3DTexture( 
                    _ensureCorrectDataType(maskVolume.data), maskVolume.xLength, maskVolume.yLength, maskVolume.zLength 
                )
                maskTexture.format = THREE.RedFormat 
                maskTexture.type = THREE.FloatType 
                maskTexture.minFilter = maskTexture.magFilter = THREE.LinearFilter 
                maskTexture.unpackAlignment = 1 
                maskTexture.needsUpdate = true 
                console.log("mask texture", maskTexture);

                // Colormap textures
                // TODO: bring these to client
                colourMapTextures = {
                    viridis: new THREE.TextureLoader().load( 
                        // 'https://raw.githubusercontent.com/mrdoob/three.js/f9d1f8495f2ca581b2b695288b97c97e030c5407/examples/textures/cm_gray.png',
                        'https://raw.githubusercontent.com/mrdoob/three.js/f9d1f8495f2ca581b2b695288b97c97e030c5407/examples/textures/cm_viridis.png',
                        _update_scene
                    ),
                    gray: new THREE.TextureLoader().load( 
                        'https://raw.githubusercontent.com/mrdoob/three.js/f9d1f8495f2ca581b2b695288b97c97e030c5407/examples/textures/cm_gray.png',
                        _update_scene
                    ),
                } 
                // Instantiate the Volume Render Shader
                const shader = VolumeRenderShader1 
                const uniforms = THREE.UniformsUtils.clone( shader.uniforms ) 
                // init the shader uniforms, (i.e. variables) 
                volumeConfig = { 
                    clim1, 
                    clim2, 
                    mask_clim1, 
                    mask_clim2,
                    mixamount, 
                    renderstyle, 
                    isothreshold: defaultIso, 
                    colormap,
                    mask_colormap,
                } 
                uniforms[ 'u_data' ].value = mainTexture 
                uniforms[ 'u_mask_data' ].value = maskTexture 
                uniforms[ 'u_size' ].value.set( volume.xLength, volume.yLength, volume.zLength ) 
                uniforms[ 'u_clim' ].value.set( volumeConfig.clim1, volumeConfig.clim2 ) 
                uniforms[ 'u_mask_clim' ].value.set( volumeConfig.mask_clim1, volumeConfig.mask_clim2 ) 
                uniforms[ 'u_mixamount' ].value = volumeConfig.mixamount
                uniforms[ 'u_renderstyle' ].value = volumeConfig.renderstyle === 'mip' ? 0 : 1  // 0: MIP, 1: ISO
                uniforms[ 'u_renderthreshold' ].value = volumeConfig.isothreshold  // For ISO renderstyle
                uniforms[ 'u_cmdata' ].value = colourMapTextures[ volumeConfig.colormap ] 
                uniforms[ 'u_mask_cmdata' ].value = colourMapTextures[ volumeConfig.mask_colormap ] 
                // create material
                material = new THREE.ShaderMaterial({
                    uniforms: uniforms,
                    vertexShader: shader.vertexShader,
                    fragmentShader: shader.fragmentShader,
                    side: THREE.BackSide // The volume shader uses the backface as its "reference point"
                }) 
                // create the box geometry to render the volume within
                const geometry = new THREE.BoxGeometry( volume.xLength, volume.yLength, volume.zLength ) 
                geometry.translate( volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5 )
                // assign material to geometry
                const mesh = new THREE.Mesh( geometry, material )
                // add to scene
                _add_volume(mesh, showGUI) 
            }, progress => {}, err => console.log("Error loading NRRD:", err)) 
        }, progress => {}, err => console.log("Error loading mask:", err)) 
    } else {
        new NRRDLoader().load(filename, (volume) => {
            // load mask data
            // Texture to hold the volume. We have scalars, so we put our data in the red channel.
            // THREEJS will select R32F (33326) based on the THREE.RedFormat and THREE.FloatType.
            // Also see https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
            let currentDataType = volume.header.type
            let texture = new THREE.Data3DTexture( 
                _ensureCorrectDataType(volume.data), volume.xLength, volume.yLength, volume.zLength 
            )
            texture.format = THREE.RedFormat 
            texture.type = THREE.FloatType 
            texture.minFilter = texture.magFilter = THREE.LinearFilter 
            texture.unpackAlignment = 1 
            texture.needsUpdate = true 
            // Colormap textures
            // TODO: bring these to client
            colourMapTextures = {
                viridis: new THREE.TextureLoader().load( 
                    // 'https://raw.githubusercontent.com/mrdoob/three.js/f9d1f8495f2ca581b2b695288b97c97e030c5407/examples/textures/cm_gray.png',
                    'https://raw.githubusercontent.com/mrdoob/three.js/f9d1f8495f2ca581b2b695288b97c97e030c5407/examples/textures/cm_viridis.png',
                    _update_scene
                ),
                gray: new THREE.TextureLoader().load( 
                    'https://raw.githubusercontent.com/mrdoob/three.js/f9d1f8495f2ca581b2b695288b97c97e030c5407/examples/textures/cm_gray.png',
                    _update_scene
                ),
            } 
            // Instantiate the Volume Render Shader
            const shader = VolumeRenderShader1 
            const uniforms = THREE.UniformsUtils.clone( shader.uniforms ) 
            // init the shader uniforms, (i.e. variables) 
            volumeConfig = { 
                clim1, 
                clim2, 
                mask_clim1, 
                mask_clim2,
                mixamount, 
                renderstyle, 
                isothreshold: defaultIso, 
                colormap,
                mask_colormap,
            } 
            uniforms[ 'u_data' ].value = texture 
            uniforms[ 'u_size' ].value.set( volume.xLength, volume.yLength, volume.zLength ) 
            uniforms[ 'u_mask_clim' ].value.set( volumeConfig.mask_clim1, volumeConfig.mask_clim2 ) 
            uniforms[ 'u_clim' ].value.set( volumeConfig.clim1, volumeConfig.clim2 ) 
            uniforms[ 'u_mixamount' ].value = volumeConfig.mixamount
            uniforms[ 'u_renderstyle' ].value = volumeConfig.renderstyle === 'mip' ? 0 : 1  // 0: MIP, 1: ISO
            uniforms[ 'u_renderthreshold' ].value = volumeConfig.isothreshold  // For ISO renderstyle
            uniforms[ 'u_mask_cmdata' ].value = colourMapTextures[ volumeConfig.colormap ] 
            uniforms[ 'u_cmdata' ].value = colourMapTextures[ volumeConfig.mask_colormap ] 
            // create material
            material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader,
                side: THREE.BackSide // The volume shader uses the backface as its "reference point"
            }) 
            // create the box geometry to render the volume within
            const geometry = new THREE.BoxGeometry( volume.xLength, volume.yLength, volume.zLength ) 
            geometry.translate( volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5 )
            // assign material to geometry
            const mesh = new THREE.Mesh( geometry, material )
            // add to scene
            _add_volume(mesh, showGUI) 
        }, progress => {}, err => console.log("Error loading NRRD:", err)) 
    }
}


/**
 * Update the shader as the volume config changes
 */
function _updateUniforms() {
    material.uniforms[ 'u_mask_clim' ].value.set( volumeConfig.mask_clim1, volumeConfig.mask_clim2 ) 
    material.uniforms[ 'u_clim' ].value.set( volumeConfig.clim1, volumeConfig.clim2 ) 
    material.uniforms[ 'u_mixamount' ].value = volumeConfig.mixamount
    material.uniforms[ 'u_renderstyle' ].value = volumeConfig.renderstyle == 'mip' ? 0 : 1  // 0: MIP, 1: ISO
    material.uniforms[ 'u_renderthreshold' ].value = volumeConfig.isothreshold  // For ISO renderstyle
    material.uniforms[ 'u_cmdata' ].value = colourMapTextures[ volumeConfig.colormap ] 
    material.uniforms[ 'u_mask_cmdata' ].value = colourMapTextures[ volumeConfig.mask_colormap ] 

    _update_scene() 
}

function _ensureCorrectDataType(data) {
    // TODO: check type of array
    try {
        return Float32Array.from(data) 
    } catch (err) {
        console.log("error converting data to Float32Array")
    }
}

// TODO: test this
function _onWindowResize() {
    renderer.setSize( window.innerWidth, window.innerHeight )
    const aspect = window.innerWidth / window.innerHeight
    const frustumHeight = camera.top - camera.bottom
    camera.left = -frustumHeight * aspect / 2
    camera.right = frustumHeight * aspect / 2
    camera.updateProjectionMatrix()
    _update_scene()
}

const VolumeRenderShader1 = {
	uniforms: {
		'u_size': { value: new Vector3( 1, 1, 1 ) },
		'u_renderstyle': { value: 0 },
		'u_renderthreshold': { value: 0.5 },
		'u_clim': { value: new Vector2( 1, 1 ) },
		'u_mask_clim': { value: new Vector2( 1, 1 ) },
        'u_mixamount' : { value: 0.42 },
		'u_data': { value: null },
		'u_mask_data': { value: null },
		'u_cmdata': { value: null },
		'u_mask_cmdata': { value: null },
	},

	vertexShader: /* glsl */`
		varying vec4 v_nearpos;
		varying vec4 v_farpos;
		varying vec3 v_position;

		void main() {
            // Prepare transforms to map to "camera view". See also:
            // https://threejs.org/docs/#api/renderers/webgl/WebGLProgram
            mat4 viewtransformf = modelViewMatrix;
            mat4 viewtransformi = inverse(modelViewMatrix);

            // Project local vertex coordinate to camera position. Then do a step
            // backward (in cam coords) to the near clipping plane, and project back. Do
            // the same for the far clipping plane. This gives us all the information we
            // need to calculate the ray and truncate it to the viewing cone.
            vec4 position4 = vec4(position, 1.0);
            vec4 pos_in_cam = viewtransformf * position4;

            // Intersection of ray and near clipping plane (z = -1 in clip coords)
            pos_in_cam.z = -pos_in_cam.w;
            v_nearpos = viewtransformi * pos_in_cam;

            // Intersection of ray and far clipping plane (z = +1 in clip coords)
            pos_in_cam.z = pos_in_cam.w;
            v_farpos = viewtransformi * pos_in_cam;

            // Set varyings and output pos
            v_position = position;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * position4;
		}`,

	fragmentShader: /* glsl */`
        precision highp float;
        precision mediump sampler3D;

        uniform vec3 u_size;
        uniform int u_renderstyle;
        uniform float u_renderthreshold;
        uniform vec2 u_clim;
        uniform vec2 u_mask_clim;
        uniform float u_mixamount;

        uniform sampler3D u_data;
        uniform sampler3D u_mask_data;
        uniform sampler2D u_cmdata;
        uniform sampler2D u_mask_cmdata;

        varying vec3 v_position;
        varying vec4 v_nearpos;
        varying vec4 v_farpos;

        // The maximum distance through our rendering volume is sqrt(3).
        const int MAX_STEPS = 887;	// 887 for 512^3, 1774 for 1024^3
        const int REFINEMENT_STEPS = 4;
        const float relative_step_size = 1.0;
        const vec4 ambient_color = vec4(0.2, 0.4, 0.2, 1.0);
        const vec4 diffuse_color = vec4(0.8, 0.2, 0.2, 1.0);
        const vec4 specular_color = vec4(1.0, 1.0, 1.0, 1.0);
        const float shininess = 40.0;

        void cast_mip(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray);
        void cast_iso(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray);

        float sample1(vec3 texcoords);
        vec4 apply_colormap(float val);
        vec4 add_lighting(float val, vec3 loc, vec3 step, vec3 view_ray);


        void main() {
            // Normalize clipping plane info
            vec3 farpos = v_farpos.xyz / v_farpos.w;
            vec3 nearpos = v_nearpos.xyz / v_nearpos.w;

            // Calculate unit vector pointing in the view direction through this fragment.
            vec3 view_ray = normalize(nearpos.xyz - farpos.xyz);

            // Compute the (negative) distance to the front surface or near clipping plane.
            // v_position is the back face of the cuboid, so the initial distance calculated in the dot
            // product below is the distance from near clip plane to the back of the cuboid
            float distance = dot(nearpos - v_position, view_ray);
            distance = max(distance, min((-0.5 - v_position.x) / view_ray.x,
                                                                    (u_size.x - 0.5 - v_position.x) / view_ray.x));
            distance = max(distance, min((-0.5 - v_position.y) / view_ray.y,
                                                                    (u_size.y - 0.5 - v_position.y) / view_ray.y));
            distance = max(distance, min((-0.5 - v_position.z) / view_ray.z,
                                                                    (u_size.z - 0.5 - v_position.z) / view_ray.z));

            // Now we have the starting position on the front surface
            vec3 front = v_position + view_ray * distance;

            // Decide how many steps to take
            int nsteps = int(-distance / relative_step_size + 0.5);
            if ( nsteps < 1 )
                    discard;

            // Get starting location and step vector in texture coordinates
            vec3 step = ((v_position - front) / u_size) / float(nsteps);
            vec3 start_loc = front / u_size;

            // For testing: show the number of steps. This helps to establish
            // whether the rays are correctly oriented
            //'gl_FragColor = vec4(0.0, float(nsteps) / 1.0 / u_size.x, 1.0, 1.0);
            //'return;

            if (u_renderstyle == 0)
                    cast_mip(start_loc, step, nsteps, view_ray);
            else if (u_renderstyle == 1)
                    cast_iso(start_loc, step, nsteps, view_ray);

            if (gl_FragColor.a < 0.05)
                    discard;
        }


        float sample1(vec3 texcoords) {
            /* Sample float value from a 3D texture. Assumes intensity data. */
            return texture(u_data, texcoords.xyz).r;
        }

        float sample1_MASK(vec3 texcoords) {
            /* Sample float value from a 3D texture. Assumes intensity data. */
            return texture(u_mask_data, texcoords.xyz).r;
        }


        vec4 apply_colormap(float val) {
            val = (val - u_clim[0]) / (u_clim[1] - u_clim[0]);
            return texture2D(u_cmdata, vec2(val, 0.5));
        }
        vec4 apply_mask_colormap(float val) {
            val = (val - u_mask_clim[0]) / (u_mask_clim[1] - u_mask_clim[0]);
            return texture2D(u_mask_cmdata, vec2(val, 0.5));
        }


        void cast_mip(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray) {
            float max_val = -1e6;
            int max_i = 100;
            vec3 loc = start_loc;
            bool masked = false;

            // Enter the raycasting loop. In WebGL 1 the loop index cannot be compared with
            // non-constant expression. So we use a hard-coded max, and an additional condition
            // inside the loop.
            for (int iter=0; iter<MAX_STEPS; iter++) {
                    if (iter >= nsteps)
                            break;
                    // Sample from the 3D texture
                    float val = sample1(loc);
                    // Sample from the 3D texture MASK
                    float mask_val = sample1_MASK(loc);
                    // Apply MIP operation
                    if (val > max_val) {
                        max_val = val;
                        max_i = iter;
                        // if the mask value at this location is present
                        if (mask_val > 0.05f) {
                            masked = true;
                        }
                    }
                    // Advance location deeper into the volume
                    loc += step;
            }

            // Refine location, gives crispier images
            vec3 iloc = start_loc + step * (float(max_i) - 0.5);
            vec3 istep = step / float(REFINEMENT_STEPS);
            for (int i=0; i<REFINEMENT_STEPS; i++) {
                max_val = max(max_val, sample1(iloc));
                iloc += istep;
            }

            if (masked) {
                // Resolve masked color
                gl_FragColor = apply_mask_colormap(max_val);
            } else {
                // Resolve final color
                gl_FragColor = apply_colormap(max_val);
            }
        }


        void cast_iso(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray) {

            gl_FragColor = vec4(0.0);	// init transparent
            vec4 color_by_val = vec4(0.0);	// colour dependant on value
            vec4 color_by_colormap_val = vec4(0.0);	// colour dependant on value
            vec4 color_by_lighting = vec4(0.0);	// colour dependant on value
            vec3 dstep = 1.5 / u_size;	// step to sample derivative
            vec3 loc = start_loc;

            float low_threshold = u_renderthreshold - 0.02 * (u_clim[1] - u_clim[0]);

            float norm_val = 0.0;

            // Enter the raycasting loop. In WebGL 1 the loop index cannot be compared with
            // non-constant expression. So we use a hard-coded max, and an additional condition
            // inside the loop.
            for (int iter=0; iter<MAX_STEPS; iter++) {
                if (iter >= nsteps)
                    break;

                // Sample from the 3D texture
                float val = sample1(loc);

                if (val > low_threshold) {
                    // Take the last interval in smaller steps
                    vec3 iloc = loc - 0.5 * step;
                    vec3 istep = step / float(REFINEMENT_STEPS);
                    for (int i=0; i<REFINEMENT_STEPS; i++) {
                        val = sample1(iloc);
                        if (val > u_renderthreshold) {
                            //norm_val = val/u_clim[1];
                            norm_val = val/u_renderthreshold;

                            // calculate colour using value, full alpha
                            color_by_val = vec4(vec3(norm_val,norm_val,norm_val),0.5);
                            color_by_colormap_val = apply_colormap(val);
                            color_by_lighting = add_lighting(val, iloc, dstep, view_ray);
                            gl_FragColor = mix(color_by_val, color_by_lighting, u_mixamount);
                            // gl_FragColor = mix(color_by_val, color_by_colormap_val, u_mixamount);
                            gl_FragColor = mix(gl_FragColor, color_by_colormap_val, u_mixamount);

                            
                            //gl_FragColor = color_by_lighting;
                            return;
                        }
                        iloc += istep;
                    }
                }

                // Advance location deeper into the volume
                loc += step;
            }
    }


        vec4 add_lighting(float val, vec3 loc, vec3 step, vec3 view_ray)
        {
            // Calculate color by incorporating lighting

                // View direction
                vec3 V = normalize(view_ray);

                // calculate normal vector from gradient
                vec3 N;
                float val1, val2;
                val1 = sample1(loc + vec3(-step[0], 0.0, 0.0));
                val2 = sample1(loc + vec3(+step[0], 0.0, 0.0));
                N[0] = val1 - val2;
                val = max(max(val1, val2), val);
                val1 = sample1(loc + vec3(0.0, -step[1], 0.0));
                val2 = sample1(loc + vec3(0.0, +step[1], 0.0));
                N[1] = val1 - val2;
                val = max(max(val1, val2), val);
                val1 = sample1(loc + vec3(0.0, 0.0, -step[2]));
                val2 = sample1(loc + vec3(0.0, 0.0, +step[2]));
                N[2] = val1 - val2;
                val = max(max(val1, val2), val);

                float gm = length(N); // gradient magnitude
                N = normalize(N);

                // Flip normal so it points towards viewer
                float Nselect = float(dot(N, V) > 0.0);
                N = (2.0 * Nselect - 1.0) * N;	// ==	Nselect * N - (1.0-Nselect)*N;

                // Init colors
                vec4 ambient_color = vec4(0.0, 0.0, 0.0, 0.0);
                vec4 diffuse_color = vec4(0.0, 0.0, 0.0, 0.0);
                vec4 specular_color = vec4(0.0, 0.0, 0.0, 0.0);

                // note: could allow multiple lights
                for (int i=0; i<1; i++)
                {
                    // Get light direction (make sure to prevent zero devision)
                    vec3 L = normalize(view_ray);	//lightDirs[i];
                    float lightEnabled = float( length(L) > 0.0 );
                    L = normalize(L + (1.0 - lightEnabled));

                    // Calculate lighting properties
                    float lambertTerm = clamp(dot(N, L), 0.0, 1.0);
                    vec3 H = normalize(L+V); // Halfway vector
                    float specularTerm = pow(max(dot(H, N), 0.0), shininess);

                    // Calculate mask
                    float mask1 = lightEnabled;

                    // Calculate colors
                    ambient_color += mask1 * ambient_color;	// * gl_LightSource[i].ambient;
                    diffuse_color += mask1 * lambertTerm;
                    specular_color += mask1 * specularTerm * specular_color;
                }

                // Calculate final color by componing different components
                vec4 final_color;
                vec4 color = apply_colormap(val);
                final_color = color * (ambient_color + diffuse_color) + specular_color;
                final_color.a = color.a;
                return final_color;
        }`

};