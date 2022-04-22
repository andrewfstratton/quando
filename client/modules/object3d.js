import * as THREE from 'three'

import { GUI } from 'https://unpkg.com/three@0.139.2/examples/jsm/libs/lil-gui.module.min.js'
import { OrbitControls } from 'https://unpkg.com/three@0.139.2/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.139.2/examples/jsm/loaders/GLTFLoader.js'
import { NRRDLoader } from 'https://unpkg.com/three@0.139.2/examples/jsm/loaders/NRRDLoader.js'
import { VolumeRenderShader1 } from 'https://unpkg.com/three@0.139.2/examples/jsm/shaders/VolumeShader.js'
import WebGL from 'https://unpkg.com/three@0.139.2/examples/jsm/capabilities/WebGL.js'

let quando = window.quando

if (!quando) alert('Fatal Error: object3d must be included after client.js')

let self = quando.object3d = {}
self.width = window.innerWidth
self.height = window.innerHeight
let scene = false
let renderer = false
let camera = false
let object = false
let fixed = false
let animation_id = false 
let canvas = false

// frame throttling variables
let fps = 20
let fpsInterval, now, then, elapsed, pulse
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
    // _clear_volume()
    _clear_fixed()
    _clear_canvas()
}

function _update_object(update, object) {
    if (object) {
        if (update) {
            if (update.z) { object.position.z = update.z; delete update.z }
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
            if (update.z) { volume.position.z = update.z; delete update.z }
            if (update.y) { volume.position.y = update.y; delete update.y }
            if (update.x) { volume.position.x = update.x; delete update.x }
            if (update._roll) { volume.rotation.z = update._roll; delete update._roll }
            if (update._pitch) { volume.rotation.x = update._pitch; delete update._pitch }
            if (update._yaw) { volume.rotation.y = update._yaw; delete update._yaw }
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
function _setup_scene_for_volume() {
    return new Promise((resolve, reject) => {
        if (renderer !== false) reject("Scene already set up")
        scene = new THREE.Scene()
        renderer = new THREE.WebGLRenderer()
        renderer.setPixelRatio( window.devicePixelRatio )
        renderer.setSize( window.innerWidth, window.innerHeight )
        canvas = renderer.domElement
        document.getElementById('quando_3d').append(canvas)

        const aspect = window.innerWidth / window.innerHeight
        const h = 512  // frustum height
        camera = new THREE.OrthographicCamera( - h * aspect / 2, h * aspect / 2, h / 2, - h / 2, 0.1, 100000 )
        camera.position.set( 0, 0, 128*10 ) 
        // camera.position.set( - 64, - 64 / 2, 128*10 ) 
        // TODO: keep the following the same or rotate the data to the right direction?
        camera.up.set( 0, 0, 1 ) // In volume data data, z is up

        const gui = new GUI()
        // The gui for volume interaction
        gui.add( volumeConfig, 'clim1', 0, 1, 0.01 ).onChange( _updateUniforms )
        gui.add( volumeConfig, 'clim2', 0, 1, 0.01 ).onChange( _updateUniforms )
        gui.add( volumeConfig, 'colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( _updateUniforms )
        gui.add( volumeConfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( _updateUniforms ) 
        gui.add( volumeConfig, 'isothreshold', 0, 1000, 0.01 ).onChange( _updateUniforms )

        // Create controls
        let controls = new OrbitControls( camera, renderer.domElement ) 
        controls.addEventListener( 'change', _update_scene ) 
        controls.target.set( 64, 64, 128 ) 
        controls.minZoom = 0.5 
        controls.maxZoom = 4 
        controls.enablePan = false 
        controls.update() 
        
        resolve(renderer)
    })
}

let isoOffset;
let timeFactor = 1000;
let strFactor = 66;
let _pulseIso = (newTime) => {
    isoOffset = (Math.sin(newTime/timeFactor) + 1) * strFactor
    // console.log(isoOffset)
    material.uniforms[ 'u_renderthreshold' ].value = volumeConfig.isothreshold + isoOffset
}

function _update_scene(newTime) {
    animation_id = requestAnimationFrame(_update_scene)
    _update_object(update_object, object)
    _update_object(update_fixed, fixed)
    // _update_volume(update_object, volume)
    console.log(pulse);
    console.log(typeof pulse);
    if (pulse !== "false") _pulseIso(newTime)

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

function _add_volume(vol_mesh) {
    _setup_scene_for_volume()
        .then(() => {
            console.log("scene setup complete")
            _clear_volume()
            // init fps throttling
            fpsInterval = 1000 / fps
            then = window.performance.now()
            // add volume to scene
            volume = vol_mesh
            scene.add(volume)
            const bbox = new THREE.Box3().setFromObject(volume);
            console.log(bbox);
            volume.position.set(
                - (bbox.max.x - bbox.min.x) / 4, 
                - (bbox.max.y - bbox.min.y) / 4,
                - (bbox.max.z - bbox.min.z) / 6
            );
            // begin rendering
            _update_scene()
        })
        .catch(err => console.log(err))
}

self.in_out = (val, mid, range, inverted, fixed=false) => {
    var buffered = fixed?update_fixed:update_object
    mid *= 10; range *= 10 // convert to mm
    buffered.z = quando.convert_linear(val, mid, range, inverted)
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

self.loadVolume = function(filename, defaultIso, requestedPulse) {
    if (!filename) return _clear_volume()
    filename = '/media/' + encodeURI(filename)
    pulse = requestedPulse

    new NRRDLoader().load(filename, (volume) => {
        console.log("NRRD Loaded: ", volume) 
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
                'https://raw.githubusercontent.com/mrdoob/three.js/f9d1f8495f2ca581b2b695288b97c97e030c5407/examples/textures/cm_viridis.png',
                _update_scene
            ),
        } 
        // Instantiate the Volume Render Shader
        const shader = VolumeRenderShader1 
        const uniforms = THREE.UniformsUtils.clone( shader.uniforms ) 
        // init the shader uniforms, (i.e. variables) 
        volumeConfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: Number(defaultIso), colormap: 'viridis' } 
        uniforms[ 'u_data' ].value = texture 
        uniforms[ 'u_size' ].value.set( volume.xLength, volume.yLength, volume.zLength ) 
        uniforms[ 'u_clim' ].value.set( volumeConfig.clim1, volumeConfig.clim2 ) 
        uniforms[ 'u_renderstyle' ].value = volumeConfig.renderstyle == 'mip' ? 0 : 1  // 0: MIP, 1: ISO
        uniforms[ 'u_renderthreshold' ].value = volumeConfig.isothreshold  // For ISO renderstyle
        uniforms[ 'u_cmdata' ].value = colourMapTextures[ volumeConfig.colormap ] 
        // create material
        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.BackSide // The volume shader uses the backface as its "reference point"
        }) 
        // create the box geometry
        const geometry = new THREE.BoxGeometry( volume.xLength, volume.yLength, volume.zLength ) 
        geometry.translate( volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5 ) 
        // assign material to geometry
        const DEBUG_MAT = new THREE.MeshDepthMaterial()
        const mesh = new THREE.Mesh( geometry, material ) 
        // add to scene
        _add_volume(mesh) 
    }, progress => {}, err => console.log("Error loading NRRD:", err)) 
}

/**
 * Update the shader as the volume config changes
 */
function _updateUniforms() {
    material.uniforms[ 'u_clim' ].value.set( volumeConfig.clim1, volumeConfig.clim2 ) 
    material.uniforms[ 'u_renderstyle' ].value = volumeConfig.renderstyle == 'mip' ? 0 : 1  // 0: MIP, 1: ISO
    material.uniforms[ 'u_renderthreshold' ].value = volumeConfig.isothreshold  // For ISO renderstyle
    material.uniforms[ 'u_cmdata' ].value = colourMapTextures[ volumeConfig.colormap ] 

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
