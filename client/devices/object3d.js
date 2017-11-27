(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: object3d must be included after quando_browser')
    }
    var self = quando.object3d = {}
    self.width = screen.width
    self.height = screen.height

    self.setup = () => {
        self.renderer = new THREE.WebGLRenderer()
        self.camera = new THREE.PerspectiveCamera( 45, self.width/self.height, 0.1, 10000 )
        self.scene = new THREE.Scene()
        self.camera.position.z = 300 // pull back camera
        self.renderer.setSize(self.width, self.height) // start the renderer
        // attach the render-supplied DOM element to container
        document.getElementById('quando_image').append(self.renderer.domElement)
        var cube = new THREE.Mesh( new THREE.CubeGeometry( 50, 50, 50 ), new THREE.MeshNormalMaterial() )

        // add an object to the scene
        self.scene.add(cube)

        var pointLight = new THREE.PointLight( 0xFFFFFF )
        pointLight.position.x = 10
        pointLight.position.y = 50
        pointLight.position.z = 130
        self.scene.add(pointLight)
        setInterval(() => {
            self.renderer.render(self.scene, self.camera)
            cube.rotation.x += 0.002
            cube.rotation.y += 0.01
            if (self.z) {
                cube.position.z = self.z
            }
        }, 1000/50)
    }

    self.in_out = function (value) {
        var max=100, min= -150
        self.z = min + (value * (max-min))
console.log(self.z, value)
    }

    setTimeout(self.setup, 0)
}) ()