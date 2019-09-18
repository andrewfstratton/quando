(function () {
    let quando = this['quando']
    if (!quando) {
      alert('Fatal Error: object3d must be included after client.js')
    }
    let self = quando.object3d = {}
    self.width = screen.width
    self.height = screen.height
    let scene = false
    let renderer = false
    let camera = false
    let object = false
    let fixed = false
    let animation_id = false 
    let canvas = false
    // hold the buffered updates...
    var update_object = {}
    var update_fixed = {}

    function _clear_object() {
        if (object) {
            scene.remove(object)
            object = false
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

    function _clear_fixed() {
        if (fixed) {
            scene.remove(fixed)
            fixed = false
        }
    }

    self.clear = function() {
        _clear_object()
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

    function _setup_scene() {
        if (renderer == false) {
            renderer = new THREE.WebGLRenderer()
            camera = new THREE.PerspectiveCamera( 25, self.width/self.height, 0.1, 10000 )
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
        }
    }

    function _update_scene() {
        animation_id = requestAnimationFrame(() => {
            _update_scene()
            console.log("Frame tick...")
        })
        _update_object(update_object, object)
        _update_object(update_fixed, fixed)
        renderer.render(scene, camera)
    }

    function _add_object(obj) {
        _setup_scene()
        _clear_object()
        object = obj
        // add an object to the scene
        object.rotation.order='ZXY'
        scene.add(object)
        _update_scene()
    }

    function _add_fixed_object(_fixed) {
        _setup_scene()
        _clear_fixed()
        fixed = _fixed
        scene.add(fixed)
        _update_scene()
    }

    function _convert_linear(val, mid, range, inverted) {
        if (val === false) { val = 0.5 }
        if (inverted) { val = 1 - val }
        let min = 10 * (mid - range)
        let max = 10 * (mid + range)
        return min + (val * (max-min))
    }

    self.in_out = function (val, mid, range, inverted, fixed=false) {
        var buffered = fixed?update_fixed:update_object
        buffered.z = _convert_linear(val, mid, range, inverted)
    }

    self.left_right = function (val, mid, range, inverted, fixed=false) {
        var buffered = fixed?update_fixed:update_object
        buffered.x = _convert_linear(val, mid, range, !inverted) // yes - inverted must be inverted...
    }

    self.up_down = function (val, mid, range, inverted, fixed=false) {
        var buffered = fixed?update_fixed:update_object
        buffered.y = _convert_linear(val, mid, range, inverted)
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
            filename = '/client/media/' + encodeURI(filename)
            let loader = new THREE.GLTFLoader()
            loader.load(filename,
                function ( gltf ) {
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

}) ()