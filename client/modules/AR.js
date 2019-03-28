(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: AR must be included after quando_browser')
    }
    var self = quando.AR = {}
    self.width = screen.width
    self.height = screen.height

    self.showGLTF = function(modelURL, markerID, flat=true, scale=100, above=false) {
      //handle params
      if (modelURL == null) {
        alert('No model selected!')
      }
      modelURL = '/client/media/' + encodeURI(modelURL)
      
      scale = scale/100; //scale supplied in %
      if (above) { //is model to be on or above marker?
        position = '0 1 0'
      } else {
        position = '0 0 0'
      }

      var scene = document.getElementById('scene')
      if (scene == null) { 
        //if scene doesn't exist
        //init scene
        scene = document.createElement('a-scene');
        scene.setAttribute('arjs', 'debugUIEnabled: false;');
        scene.setAttribute('embedded', '');
        scene.setAttribute('id', 'scene');

        let hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.setAttribute('id', 'hiddenCanvas');
        hiddenCanvas.setAttribute('width', self.width);
        hiddenCanvas.setAttribute('height', self.height);

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
        if (flat == false) {
          model.setAttribute('rotation', '0 0 90')
        }

        //init camera element
        var cam = document.createElement('a-camera-static'); 
        cam.setAttribute('id', 'camera')
        
        //add to heirarchy
        marker.appendChild(model);
        scene.appendChild(marker);
        scene.appendChild(cam);
        scene.appendChild(hiddenCanvas);

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
        if (flat == false) {
          model.setAttribute('rotation', '0 0 90')
        }

        marker.appendChild(model)
        scene.appendChild(marker)

      }
    }

    self.showImage = function(imgURL, markerID, scale=100, orientation) {

      //handle params
      imgURL = '/client/media/' + encodeURI(imgURL)
      scale = scale/100; //scale supplied in %

      var scene = document.getElementById('scene')
      if (scene == null) { 
        //if scene doesn't exist

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

        //init user chosen image
        var img = document.createElement('a-image');
        img.setAttribute('src', imgURL); //id model from url

        //the below width and height settings are not relative, so will display the image in a 1:1 ratio
        img.setAttribute('height', scale.toString());
        img.setAttribute('width', scale.toString());
        if (orientation == 'flat') {
          img.setAttribute('rotation', '-90 0 90');
        } else if (orientation == 'vertical') {
          img.setAttribute('rotation', '0 0 90');
        } else {
          img.setAttribute('rotation', '0 0 90');
          img.setAttribute('look-at', '#player')
        }

        //init camera element
        var cam = document.createElement('a-camera-static'); 
        cam.setAttribute('id', 'camera')
        
        //add to heirarchy
        marker.appendChild(img);
        scene.appendChild(marker);
        scene.appendChild(cam);

        //add to AR element of doc
        document.getElementById('quando_AR').append(scene);

      } else { 
        //scene already exists

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

        //init user chosen image
        var img = document.createElement('a-image');
        img.setAttribute('src', imgURL); //id model from url

        //the below width and height settings are not relative, so will display the image in a 1:1 ratio
        img.setAttribute('height', scale.toString());
        img.setAttribute('width', scale.toString());
        if (orientation == 'flat') {
          img.setAttribute('rotation', '-90 0 90');
        } else if (orientation == 'vertical') {
          img.setAttribute('rotation', '0 0 90');
        } else {
          img.setAttribute('rotation', '0 0 90');
          img.setAttribute('look-at', '#player')
        }

        marker.appendChild(img)
        scene.appendChild(marker)

      }
    }

    self.showVideo = function(vidURL, markerID, scale=100, orientation) {

      //handle params
      vidURL = '/client/media/' + encodeURI(vidURL)
      scale = scale/100; //scale supplied in %

      var scene = document.getElementById('scene')
      if (scene == null) { 
        //if scene doesn't exist

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

        //init user chosen video
        var vid = document.createElement('a-video');
        vid.setAttribute('src', vidURL); //id video from url

        //the below width and height settings are not relative, so will display in a 1:1 ratio
        vid.setAttribute('height', scale.toString());
        vid.setAttribute('width', scale.toString());
        if (orientation == 'flat') {
          vid.setAttribute('rotation', '-90 0 90');
        } else if (orientation == 'vertical') {
          vid.setAttribute('rotation', '0 0 90');
        } else {
          vid.setAttribute('rotation', '0 0 90');
          vid.setAttribute('look-at', '#player')
        }

        //init camera element
        var cam = document.createElement('a-camera-static'); 
        cam.setAttribute('id', 'camera')
        
        //add to heirarchy
        marker.appendChild(vid);
        scene.appendChild(marker);
        scene.appendChild(cam);

        //add to AR element of doc
        document.getElementById('quando_AR').append(scene);

      } else { 
        //scene already exists

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

        //init user chosen video
        var vid = document.createElement('a-video');
        vid.setAttribute('src', vidURL); //id video from url

        //the below width and height settings are not relative, so will display in a 1:1 ratio
        vid.setAttribute('height', scale.toString());
        vid.setAttribute('width', scale.toString());        
        if (orientation == 'flat') {
          vid.setAttribute('rotation', '-90 0 90');
        } else if (orientation == 'vertical') {
          vid.setAttribute('rotation', '0 0 90');
        } else {
          vid.setAttribute('rotation', '0 0 90');
          vid.setAttribute('look-at', '#player')
        }


        marker.appendChild(vid)
        scene.appendChild(marker)

      }
    }

    self.showText = function(text, markerID, scale) {

      //handle params
      scale = scale/10; //scale supplied in %

      var scene = document.getElementById('scene')
      if (scene == null) { 
        //if scene doesn't exist

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

        //init user text
        var textElement = document.createElement('a-text');
        textElement.setAttribute('value', text);

        //the below width and height settings are bad
        textElement.setAttribute('height', scale.toString());
        textElement.setAttribute('width', scale.toString());
        if (orientation == 'flat') {
          textElement.setAttribute('rotation', '-90 0 90');
        } else if (orientation == 'vertical') {
          textElement.setAttribute('rotation', '0 0 90');
        } else {
          textElement.setAttribute('rotation', '0 0 90');
          textElement.setAttribute('look-at', '#player')
        }


        //init camera element
        var cam = document.createElement('a-camera-static'); 
        cam.setAttribute('id', 'camera')
        
        //add to heirarchy
        marker.appendChild(textElement);
        scene.appendChild(marker);
        scene.appendChild(cam);

        //add to AR element of doc
        document.getElementById('quando_AR').append(scene);

      } else { 
        //scene already exists

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

        //init user text
        var textElement = document.createElement('a-text');
        textElement.setAttribute('value', text);

        //the below width and height settings are bad
        textElement.setAttribute('height', scale.toString());
        textElement.setAttribute('width', scale.toString());
        if (orientation == 'flat') {
          textElement.setAttribute('rotation', '-90 0 90');
        } else if (orientation == 'vertical') {
          textElement.setAttribute('rotation', '0 0 90');
        } else {
          textElement.setAttribute('rotation', '0 0 90');
          textElement.setAttribute('look-at', '#player')
        }      

        marker.appendChild(textElement)
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

    //adds event listener to marker that fires when the marker's scanned, executing the 
    //blocks in the box
    self.onScan = function(markerID, fn) {
      var marker = document.getElementById(markerID)
			marker.addEventListener('markerFound', (e)=>{
        fn()
      });
    }

    //adds event listener to marker that fires when the marker's scanned, executing the 
    //blocks in the box
    self.onLoss = function(markerID, delay, fn) {
      var marker = document.getElementById(markerID)
			marker.addEventListener('markerLost', (e)=>{
        fn()
      });
    }


}) ()