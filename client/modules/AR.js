(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: AR must be included after quando_browser')
    }
    var self = quando.AR = {}
    self.width = screen.width
    self.height = screen.height

    self.showGLTFold = function(modelURL, markerChoice, scale=100, above=false) {

      //handle params
      modelURL = '/client/media/' + encodeURI(modelURL)
      scale = scale/100; //scale supplied in %
      if (above) { //is model to be on or above marker?
        position = '0 1 0'
      } else {
        position = '0 0 0'
      }

      //initialize scene
      var scene = document.getElementById('scene')
      if (scene == null) {
        var scene = document.createElement('a-scene');
        scene.setAttribute('arjs', 'debugUIEnabled: false;');
        scene.setAttribute('embedded', '');
        scene.setAttribute('id', 'scene');
      }

      //camera element
      var marker = document.createElement('a-marker-camera'); //a-marker doesn't work 
      //var marker = document.createElement('a-marker'); //a-marker doesn't work 
      //var cam = document.createElement('a-camera-static'); //a-marker doesn't work 

      if (markerChoice == 'hiro') {
        marker.setAttribute('preset', 'hiro');
        marker.setAttribute('id', 'hiro');
      } else if (markerChoice == 'scan me') {

      } else { 
        //only remaining options are the lettered markers
        marker.setAttribute('preset', 'custom');
        marker.setAttribute('type', 'pattern');
        marker.setAttribute('id', markerChoice);
        //NOTE: below URLs must be hosted online instead of relatively for some dumb reason
        marker.setAttribute('url', 'https://raw.githubusercontent.com/andrewfstratton/quando/adventureGame2/client/media/letters/'+markerChoice+'.patt');
      }

      //user chosen model - GLTF 2.0 - uncompressed
      var model = document.createElement('a-gltf-model');
      model.setAttribute('gltf-model', 'url('+modelURL+')'); //id model from url
      model.setAttribute('scale', scale.toString() + ' '+ scale.toString() +' '+ scale.toString());
      model.setAttribute('position', position);
      
      //add to heirarchy
      scene.appendChild(marker);
      scene.appendChild(model);
      //scene.appendChild(cam);

      //add to AR element of doc
      document.getElementById('quando_AR').append(scene);
    }

    self.showGLTF = function(modelURL, markerID, scale=100, above=false) {

      //handle params
      modelURL = '/client/media/' + encodeURI(modelURL)
      scale = scale/100; //scale supplied in %
      if (above) { //is model to be on or above marker?
        position = '0 1 0'
      } else {
        position = '0 0 0'
      }

      var scene = document.getElementById('scene')
      if (scene == null) { //if scene doesn't exist

        //init scene
        scene = document.createElement('a-scene');
        scene.setAttribute('arjs', 'debugUIEnabled: false;');
        scene.setAttribute('embedded', '');
        scene.setAttribute('id', 'scene');

        //init marker
        var marker = document.createElement('a-marker');
        if (markerID == 'hiro') {
          marker.setAttribute('preset', 'hiro');
          marker.setAttribute('id', 'hiro');
        } else { 
          marker.setAttribute('preset', 'custom');
          marker.setAttribute('type', 'pattern');
          marker.setAttribute('id', markerID);
          //NOTE: below URLs must be hosted online instead of relatively for some dumb reason
          marker.setAttribute('url', 'https://raw.githubusercontent.com/andrewfstratton/quando/adventureGame2/client/media/letters/'+markerID+'.patt');
        }

        //init user chosen model - GLTF 2.0 - uncompressed
        var model = document.createElement('a-gltf-model');
        model.setAttribute('gltf-model', 'url('+modelURL+')'); //id model from url
        model.setAttribute('scale', scale.toString() + ' '+ scale.toString() +' '+ scale.toString());
        model.setAttribute('position', position);

        //init camera element
        var cam = document.createElement('a-camera-static'); 
        cam.setAttribute('id', 'camera')
        
        //add to heirarchy
        marker.appendChild(model);
        scene.appendChild(marker);
        scene.appendChild(cam);

        //add to AR element of doc
        document.getElementById('quando_AR').append(scene);

      } else { //scene already exists

        //init marker
        var marker = document.createElement('a-marker');
        if (markerID == 'hiro') {
          marker.setAttribute('preset', 'hiro');
          marker.setAttribute('id', 'hiro');
        } else { 
          marker.setAttribute('preset', 'custom');
          marker.setAttribute('type', 'pattern');
          marker.setAttribute('id', markerID);
          //NOTE: below URLs must be hosted online instead of relatively for some dumb reason
          marker.setAttribute('url', 'https://raw.githubusercontent.com/andrewfstratton/quando/adventureGame2/client/media/letters/'+markerID+'.patt');
        }

        //user chosen model - GLTF 2.0 - uncompressed
        var model = document.createElement('a-gltf-model');
        model.setAttribute('gltf-model', 'url('+modelURL+')'); //id model from url
        model.setAttribute('scale', scale.toString() + ' '+ scale.toString() +' '+ scale.toString());
        model.setAttribute('position', position);

        marker.appendChild(model)
        scene.appendChild(marker)

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
        arDiv.removeChild(arDiv.firstChild);
      }

      //TODO -- delete VR button w attribute 'AR-injected'
    }

    //test method adding event listener to marker that fires when the marker's scanned
    self.onScan = function(markerID, fn) {

      var marker = document.getElementById(markerID)
      alert('listening for marker: ' + marker.id)
			marker.addEventListener('markerFound', (e)=>{
				alert('marker found')
        fn()
      });
      
    }

}) ()