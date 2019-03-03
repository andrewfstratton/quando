(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: augReality must be included after quando_browser')
    }
    var self = quando.augReality = {}
    self.width = screen.width
    self.height = screen.height

    self.showGLTF = function(fileURL, scale=100, above=false) {
      //handle params
      fileURL = '/client/media/' + encodeURI(fileURL)
      scale = scale/100; //scale supplied in %
      if (above) { //is model to be on or above marker?
        position = '0 1 0'
      } else {
        position = '0 0 0'
      }

      //initialize scene
      var scene = document.createElement('a-scene');
      scene.setAttribute('arjs', '');
      scene.setAttribute('embedded', '');

      //camera element - SINGLE HIRO MARKER
      var cam = document.createElement('a-marker');
      cam.setAttribute('preset', 'hiro');
      cam.setAttribute('id', 'hiro');
      cam.setAttribute('registerevents', '');

      //user chosen model - GLTF 2.0 - uncompressed
      var model = document.createElement('a-gltf-model');
      model.setAttribute('gltf-model', 'url('+fileURL+')'); //id model from url
      model.setAttribute('scale', scale.toString() + ' '+ scale.toString() +' '+ scale.toString());
      model.setAttribute('position', position);
      
      //add to heirarchy
      scene.appendChild(model);
      scene.appendChild(cam);

      //add to AR element of doc
      document.getElementById('quando_AR').append(scene);
    }

    self.showGLTF_TEST = function(modelURL, markerURL, scale=100, above=false) {
      //handle params
      modelURL = '/client/media/' + encodeURI(modelURL)
      markerURL = '/client/media/' + encodeURI(markerURL)
      scale = scale/100; //scale supplied in %
      if (above) { //is model to be on or above marker?
        position = '0 1 0'
      } else {
        position = '0 0 0'
      }

      //initialize scene
      var scene = document.createElement('a-scene');
      scene.setAttribute('arjs', '');
      scene.setAttribute('embedded', '');

      //camera element
      var cam = document.createElement('a-marker');
      cam.setAttribute('preset', 'custom');
      cam.setAttribute('type', 'pattern');
      cam.setAttribute('patternUrl', markerURL);
      cam.setAttribute('emitevents', 'true');
      cam.setAttribute('registerevents', 'true');


      //user chosen model - GLTF 2.0 - uncompressed
      var model = document.createElement('a-gltf-model');
      model.setAttribute('gltf-model', 'url('+modelURL+')'); //id model from url
      model.setAttribute('scale', scale.toString() + ' '+ scale.toString() +' '+ scale.toString());
      model.setAttribute('position', position);
      
      //add to heirarchy
      scene.appendChild(model);
      scene.appendChild(cam);

      //add to AR element of doc
      document.getElementById('quando_AR').append(scene);
    }

    self.clear = function() {
      var arDiv = document.getElementById('quando_AR')
      var aScene = document.getElementById('a-scene')
      var arDebug = document.getElementById('arjsDebugUIContainer')

      /*Get all video elements, then delete the one that's
      direct parent is the body.*/
      var videos = document.getElementsByTagName('video')

      for (i=0; i<videos.length; i++){
        if (videos[i].parentNode == body) {
          body.removeChild(videos[i])
        }
      }

      //clear AR div
      if (aScene != null) {
        arDiv.removeChild(aScene)
      }

      //clear AR.js debug container - TEMP, SHOULDN'T BE THERE ANYWAY
      if (arDebug != null) {
        body.removeChild(arDebug)
      }
    }

    self.onScan = function(fn) {
      var marker = document.getElementById('hiro')
			marker.addEventListener('markerFound', function() {
				var markerId = marker.id;
				alert('NICE')
        fn()
			});
    }

}) ()