(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: AR must be included after quando_browser')
  }
  let self = quando.ar = {}
  self.width = window.innerWidth
  self.height = window.innerHeight

  self.getScene = () => {
    let scene = document.getElementById('scene')
    if (scene == null) { //if scene DOES NOT exist
      scene = document.createElement('a-scene')
      scene.setAttribute('arjs', 'debugUIEnabled: false')
      scene.setAttribute('embedded', '')
      scene.setAttribute('id', 'scene')
      // setup camera
      let camera = document.createElement('a-camera-static') 
      camera.setAttribute('id', 'camera')
      scene.appendChild(camera)
      document.getElementById('quando_AR').append(scene)
      document.body.append(_createHiddenCanvas())
    }
    return scene
  }

  function _createHiddenCanvas() {
    //init hidden canvas - used for drawing snapshot of webcam feed
    let hiddenCanvas = document.createElement('canvas')
    hiddenCanvas.setAttribute('id', 'hiddenCanvas')
    hiddenCanvas.setAttribute('width', 250)
    hiddenCanvas.setAttribute('height', 200)
    return hiddenCanvas
  }

  function _getMarker(marker_id, scene = null) {
    let marker = document.getElementById(marker_id)
    if (marker == null) { // create marker markup
      marker = document.createElement('a-marker')
      if (marker_id == 'hiro') {
        marker.setAttribute('preset', 'hiro')
        marker.setAttribute('id', marker_id)
      } else { 
        marker.setAttribute('preset', 'custom')
        marker.setAttribute('type', 'pattern')
        marker.setAttribute('id', marker_id)
        marker.setAttribute('emitEvents', true)
        //NOTE: below URLs must be hosted online instead of relatively for some dumb reason
        marker.setAttribute('url', '/client/media/markers/'+marker_id+'.patt')
      }
      if (scene != null) {
        scene.prepend(marker)
      }
    }
    return marker
  }

  self.whenMarker = (marker_id, found_fn, lost_fn) => {
    scene = self.getScene()
    marker = _getMarker(marker_id, scene)
    marker.addEventListener('markerFound', found_fn)
    marker.addEventListener('markerLost', lost_fn)
    quando.destructor.add(() => {
      marker.removeEventListener('markerFound', found_fn)
      marker.removeEventListener('markerLost', lost_fn)
    })
  }

  self.showGLTF = (marker_id, model_URL, scale = 100) => {
    if (model_URL) {
      scene = self.getScene()
      model_URL = '/client/media/' + encodeURI(model_URL)
      let model = document.getElementById(model_URL+marker_id)
      if (model == null) { // model needs displaying, i.e. not currently shown
        let marker = _getMarker(marker_id, scene)
        clearMarkerChildren(marker_id)
        model = document.createElement('a-gltf-model')
        model.setAttribute('gltf-model', 'url('+model_URL+')')
        scale /= 100
        model.setAttribute('scale', scale + ' '+ scale +' '+ scale)
        model.setAttribute('position', '0 0.001 0')
        model.setAttribute('id', (model_URL+marker_id))
        marker.appendChild(model) //add to hierarchy
      } 
    } else {
      clearMarkerChildren(marker_id)
    }
  }

  self.showImage = (marker_id, image_URL, scale = 100) => {
    scale = (scale+5)/100 //scale supplied in %, +5 to overlap the marker
    if (image_URL) {
      scene = self.getScene()
      image_URL = '/client/media/' + encodeURI(image_URL)
      let image = document.getElementById(image_URL+marker_id)
      if (image == null) { // model needs displaying, i.e. not currently shown
        let marker = _getMarker(marker_id, scene)
        clearMarkerChildren(marker_id)
        img = document.createElement('a-image')
        img.setAttribute('src', image_URL) //point at image file
        img.setAttribute('id', image_URL+marker_id) //set image id
        /* the below width and height settings do not retain 
        source aspect ratio, so will display the image in a 1:1 ratio */
        img.setAttribute('height', scale.toString())
        img.setAttribute('width', scale.toString())
        img.setAttribute('rotation', '-90 0 0')
        marker.appendChild(img)
      }
    } else {
      clearMarkerChildren(marker_id)
    }
  }

  self.showVideo = (marker_id, video_URL, scale = 100) => { 
    scale = (scale+5)/100 /* scale supplied in %, 5 added on to give video some
    overlap around the marker, so it's less visible behind the video */
    if (video_URL) {
      scene = self.getScene()
      video_URL = '/client/media/' + encodeURI(video_URL)
      let video = document.getElementById(video_URL+marker_id)
      if (video == null) { //if video DOES NOT already exist
        let marker = _getMarker(marker_id, scene)
        clearMarkerChildren(marker_id)
        // create user chosen video
        video = document.createElement('a-video')
        video.setAttribute('src', video_URL) //id model from url
        video.setAttribute('id', video_URL+marker_id)
        /* the below width and height settings do not retain 
        source aspect ratio, so will display the video in a 1:1 ratio */
        video.setAttribute('height', scale.toString())
        video.setAttribute('width', scale.toString())
        video.setAttribute('rotation', '-90 0 90')
        video.setAttribute('loop', 'false')
        marker.appendChild(video)
      }
    } else {
      clearMarkerChildren(marker_id)
    }
  }

  self.showText = function(marker_id, text, scale) {
    scale *= 4/100 //scale supplied in %, adjusted for x times visibility
    if (text) {
      scene = self.getScene()
      let textElem = document.getElementById(text+marker_id)
      if (textElem == null) {
        let marker = _getMarker(marker_id, scene)
        clearMarkerChildren(marker_id)
        //init user text
        textElem = document.createElement('a-text')
        textElem.setAttribute('value', text)
        textElem.setAttribute('align', 'center')
        textElem.setAttribute('id',text+marker_id)
        //the below width and height settings are bad
        textElem.setAttribute('height', scale.toString())
        textElem.setAttribute('width', scale.toString())
        textElem.setAttribute('position', '0 0.001 0')
        textElem.setAttribute('rotation', '-90 0 0')
        marker.appendChild(textElem)
      }
    } else {
      clearMarkerChildren(marker_id)
    }
  }

  self.clear = function() {
    var arDiv = document.getElementById('quando_AR')

    /*Get all video elements, then delete the one that's
    direct parent is the body.*/
    var videos = document.getElementsByTagName('video')
    for (i=0; i<videos.length; i++){
      if (videos[i].parentNode == body) {
        body.removeChild(videos[i])
      }
    }

    //clear AR div
    while (arDiv.firstChild) {
      arDiv.removeChild(arDiv.firstChild)
    }

    //TODO -- delete VR button w attribute 'AR-injected'
  }

  function clearMarkerChildren(marker_id) {
    let marker_elem = document.getElementById(marker_id)
    while (marker_elem.hasChildNodes()) {
      marker_elem.removeChild(marker_elem.firstChild)
    }
  }
}) ()