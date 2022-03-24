import * as destructor from "./destructor.js";

const quando = window['quando']
const document = window['document']
  if (!quando) {
    alert('Fatal Error: AR must be included after quando_browser')
  }
  THREEx.ArToolkitContext.baseURL = '/client/extlib/data/';
  let self = quando.ar = {}
  self.width = window.innerWidth
  self.height = window.innerHeight

  self.getScene = () => {
    let scene = document.getElementById('quando_AR_js_scene')
    if (scene == null) {
      scene = document.createElement('a-scene')
      scene.setAttribute('arjs', 'debugUIEnabled: false')
      scene.setAttribute('embedded', '')
      scene.setAttribute('id', 'quando_AR_js_scene')
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
    // used for drawing snapshot of webcam feed
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
        marker.setAttribute('url', '/client/media/markers/'+marker_id+'.patt')
      }
    }
    if (scene != null && scene.hasChildNodes() && (scene.children[0] != marker)) {
        scene.prepend(marker)
      }
    return marker
  }

  function _setupARRotation(marker) {
    let elem = marker.children[0]
    setTimeout(() => {
      let rot = elem.object3D.rotation
      // console.log(" "+rot)
      rot.set(rot.x, rot.y, rot.z)
    }, 0);
  }

  self.whenMarker = (marker_id, found_fn, lost_fn) => {
    const scene = self.getScene()
    let marker = _getMarker(marker_id, scene)
    marker.addEventListener('markerFound', found_fn)
    marker.addEventListener('markerLost', lost_fn)
    destructor.add(() => {
      marker.removeEventListener('markerFound', found_fn)
      marker.removeEventListener('markerLost', lost_fn)
    })
  }

  const QUANDO_3DOBJECT_AR_PREFIX = 'quando_3dobject_'
  self.showGLTF = (marker_id, model_URL) => {
    if (model_URL) {
      const scene = self.getScene()
      model_URL = '/client/media/' + encodeURI(model_URL)
      let model = document.getElementById(QUANDO_3DOBJECT_AR_PREFIX + marker_id)
      if (model == null) { // model needs displaying, i.e. not currently shown
        clearMarkerChildren(marker_id)
        model = document.createElement('a-gltf-model')
        model.setAttribute('scale', '1.05 1.05 1.05')
        model.setAttribute('position', '0 0.001 0')
        model.setAttribute('id', QUANDO_3DOBJECT_AR_PREFIX + marker_id)
        _getMarker(marker_id, scene).appendChild(model) //add to hierarchy
      }
      if (model.getAttribute('gltf-model') != model_URL) {
        model.setAttribute('gltf-model', model_URL)
      }
    } else {
      clearMarkerChildren(marker_id)
    }
  }

  const QUANDO_IMAGE_AR_PREFIX = 'quando_image_'
  self.showImage = (marker_id, image_URL) => {
    if (image_URL) {
      const scene = self.getScene()
      image_URL = '/client/media/' + encodeURI(image_URL)
      let image = document.getElementById(QUANDO_IMAGE_AR_PREFIX + marker_id)
      if (image == null) { // model needs displaying, i.e. not currently shown
        clearMarkerChildren(marker_id)
        image = document.createElement('a-image')
        image.setAttribute('id', QUANDO_IMAGE_AR_PREFIX + marker_id) //set image id
        /* the below width and height settings do not retain 
        source aspect ratio, so will display the image in a 1:1 ratio */
        image.setAttribute('height', 1.05)
        image.setAttribute('width', 1.05)
        let marker = _getMarker(marker_id, scene)
        marker.appendChild(image)
        _setupARRotation(marker)
      }
      if (image.getAttribute('src') != image_URL) {
        image.setAttribute('src', image_URL)
      }
    } else {
      clearMarkerChildren(marker_id)
    }
  }

  self.showVideo = (marker_id, video_URL) => { 
    if (video_URL) {
      const scene = self.getScene()
      video_URL = '/client/media/' + encodeURI(video_URL)
      let video = document.getElementById(video_URL+marker_id)
      if (video == null) {
        clearMarkerChildren(marker_id)
        video = document.createElement('a-video')
        video.setAttribute('src', video_URL)
        video.setAttribute('id', video_URL+marker_id)
        /* the below width and height settings do not retain 
        source aspect ratio, so will display the video in a 1:1 ratio */
        video.setAttribute('height', 1.05)
        video.setAttribute('width', 1.05)
        video.setAttribute('loop', 'false')
        _getMarker(marker_id, scene).appendChild(video)
      }
    } else {
      clearMarkerChildren(marker_id)
    }
  }

  const QUANDO_TEXT_AR_PREFIX = 'quando_text_'
  self.showText = (marker_id, text, append=false) => {
    if (text) {
      const scene = self.getScene()
      let textElem = document.getElementById(QUANDO_TEXT_AR_PREFIX + marker_id)
      if (textElem == null) {
        clearMarkerChildren(marker_id)
        textElem = document.createElement('a-text')
        textElem.setAttribute('align', 'center')
        textElem.setAttribute('id', QUANDO_TEXT_AR_PREFIX + marker_id)
        //the below width and height settings need attention
        textElem.setAttribute('height', 1.05)
        textElem.setAttribute('width', 1.05)
        textElem.setAttribute('position', '0 0.001 0')
        let marker = _getMarker(marker_id, scene)
        marker.appendChild(textElem)
        _setupARRotation(marker)
      }
      if (append && textElem.getAttribute('value')) {
        text = textElem.getAttribute('value') + text
      }
      textElem.setAttribute('value', text)
    } else {
      clearMarkerChildren(marker_id)
    }
  }

  function _rotate(marker_id, val, mid, range, inverted, fn) {
    let rad = quando.convert_angle(val, mid, range, inverted)
    let marker = _getMarker(marker_id)
    if (marker.hasChildNodes()) {
      let elem = marker.children[0]
      let rot = elem.object3D.rotation
      fn(rad, rot)
    }
  }

  const HalfPi = Math.PI/2
  self.roll = (marker_id, val, mid, range, inverted) => {
    _rotate(marker_id, val, mid, range, !inverted, (rad, rot) => { rot.set(rot.x, rot.y, rad) })
  }

  self.pitch = (marker_id, val, mid, range, inverted) => {
    _rotate(marker_id, val, mid, range, !inverted, (rad, rot) => { rot.set(rad - HalfPi, rot.y, rot.z) })
  }

  self.yaw = (marker_id, val, mid, range, inverted) => {
    _rotate(marker_id, val, mid, range, inverted, (rad, rot) => { rot.set(rot.x, rad, rot.z) })
  }

  self.zoom = (marker_id, val, min, max, inverted) => {
    if (val === false) {
        val = 0; // this forces the minimum value - not the middle
    }
    min /= 100
    max /= 100
    let mid = (min + max) /2
    let range = (max - min) / 2
    let scale = quando.convert_linear(val, mid, range, inverted)
    let marker = _getMarker(marker_id)
    if (marker.hasChildNodes()) {
      let elem = marker.children[0]
      elem.object3D.scale.set(scale, scale, scale)
    }

  }
  
  self.clear = () => {
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
    if (marker_elem != null) {
      while (marker_elem.hasChildNodes()) {
        marker_elem.removeChild(marker_elem.firstChild)
      }
    }
  }