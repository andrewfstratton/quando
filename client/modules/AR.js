(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: AR must be included after quando_browser')
    }

    self.showGLTF = function(modelURL, marker, scale=100, above=false) {

      //handle params
      modelURL = '/client/media/' + encodeURI(modelURL)
      scale = scale/100; //scale supplied in %
      if (above) { //is model to be on or above marker?
        position = '0 1 0'
      } else {
        position = '0 0 0'
      }

      //initialize scene
      var scene = document.createElement('a-scene');
      scene.setAttribute('arjs', 'debugUIEnabled: false;');
      scene.setAttribute('embedded', '');

      //camera element
      var cam = document.createElement('a-marker-camera');  //a-marker doesn't work 

      if (marker == 'hiro') {
        cam.setAttribute('preset', 'hiro');
      } else if (marker == 'scan me') {
      } else { //only remaining options are the numbered markers
        cam.setAttribute('preset', 'custom');
        cam.setAttribute('type', 'pattern');
        //NOTE: below URL must be hosted online instead of relatively for some dumb reason
        alert( 'https://raw.githubusercontent.com/andrewfstratton/quando/adventureGame2/client/media/'+marker+'.patt')
        cam.setAttribute('url', 'https://raw.githubusercontent.com/andrewfstratton/quando/adventureGame2/client/media/'+marker+'.patt');
      }
      //cam.setAttribute('emitevents', 'true');
      //cam.setAttribute('registerevents', 'true');

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
        arDiv.removeChild(arDiv.firstChild);
      }

      //TODO -- delete VR button w attribute 'AR-injected'
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