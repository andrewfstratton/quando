(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: object3d must be included after quando_browser')
    }
    var self = quando.object3d = {}
    self.width = screen.width
    self.height = screen.height

    _add_object_to_scene = (obj) => {
        renderer = new THREE.WebGLRenderer()
        camera = new THREE.PerspectiveCamera( 25, self.width/self.height, 0.1, 10000 )
        scene = new THREE.Scene()
        camera.position.z = 100 // pull back camera
        camera.up = new THREE.Vector3(0,1,0)
        camera.lookAt(new THREE.Vector3(0,0,0))
        renderer.setSize(self.width, self.height) // start the renderer
        // attach the render-supplied DOM element to container
        document.getElementById('quando_image').append(renderer.domElement)

        // add an object to the scene
        scene.add(obj)
        var pointLight = new THREE.PointLight( 0xFFFFFF )
        pointLight.position.set(10, 50, 230)
        scene.add(pointLight)
        var light = new THREE.AmbientLight( 0xAAAAAA )
        scene.add( light )
        function update(renderer, scene, camera) {
            if (self.z) { obj.position.z = self.z; delete self.z }
            if (self.y) { obj.position.y = self.y; delete self.y }
            if (self.x) { obj.position.x = self.x; delete self.x }
            if (self._roll) { obj.rotation.z = self._roll; delete self._roll }
            if (self._pitch) { obj.rotation.x = self._pitch; delete self._pitch }
            if (self._yaw) { obj.rotation.y = self._yaw; delete self._yaw }
            // camera.lookAt(obj.position)
            renderer.render(scene, camera)
            requestAnimationFrame(function() {
                update(renderer, scene, camera)
            })
        }
        update(renderer, scene, camera)
    }

    function _degrees_to_radians (degrees) {
        var radians = Math.PI * degrees / 180
        return radians
    }

    function _convert_linear(val, extras) {
        if (val === false) { val = 0.5 }
        return extras.min + (val * (extras.max-extras.min))
    }

    self.in_out = function (val, extras) {
        self.z = _convert_linear(val, extras)
    }

    self.left_right = function (val, extras) {
        self.x = _convert_linear(val, extras)
    }

    self.up_down = function (val, extras) {
        self.y = _convert_linear(val, extras)
    }

    function _convert_angle(val, extras) {
        if (val === false) { val = 0.5 }
        var min = _degrees_to_radians(extras.min)
        var max = _degrees_to_radians(extras.max)
        return min + (val * (max-min))
    }

    self.roll = function (val, extras) {
        self._roll = _convert_angle(val, extras)
    }

    self.pitch = function (val, extras) {
        self._pitch = _convert_angle(val, extras)
    }

    self.yaw = function (val, extras) {
        self._yaw = _convert_angle(val, extras)
    }

    function _load_obj(loader, path, obj) {
        loader.setPath(path)
        loader.load(obj, function(result) {
            _add_object_to_scene(result)
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

    self.loadGLTF = function(filename) {
        let loader = new THREE.GLTFLoader()
        loader.load(filename,
            function ( gltf ) {
                _add_object_to_scene(gltf.scene)
        })
    }

}) ()