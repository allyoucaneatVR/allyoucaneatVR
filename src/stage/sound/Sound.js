/**
 * Loads an audio file and provides several playback options.
 * @param {String} audioPath
 * @class
 * @constructor
 */
Ayce.Sound = function(audioPath) {

    var scope = this;
    this.soundLoaded = false;
    this.position = new Ayce.Vector3(0,0,0);
    this.orientationFront = new Ayce.Vector3(0,0,0);
    this.orientationUp = new Ayce.Vector3(0,1,0);
    this.listenerPosition = new Ayce.Vector3(0,0,0);
    this.listenerOrientationFront = new Ayce.Vector3(0,0,0);
    this.listenerOrientationUp = new Ayce.Vector3(0,1,0);
    this.loop = true;
    this.is3D = true;
    this.volume = 1;
    this.isPlaying = false;

    var context;
    var panner;
    var source;
    var buffer;

    var gainNode;
    var startTime;
    var pauseTime = 0;

    /**
     * Loads audio file
     * @param {Ayce.AudioContext} audioContext
     */
    this.init = function(audioContext){
        context = audioContext.audioContext;

        var request = new XMLHttpRequest();
        request.open("GET", audioPath, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            context.decodeAudioData(this.response, function(data) {
                buffer = data;
                scope.soundLoaded = true;
            }, function onFailure() {
                alert("Decoding the audio buffer failed");
            });
        };
        request.send();
    };

    /**
     * Updates audio file parameters
     */
    this.update = function () {
        if(scope.soundLoaded&&scope.isPlaying) {
            if(scope.is3D) {
                panner.setPosition(
                    scope.position.x,
                    scope.position.y,
                    scope.position.z);
                panner.panningModel = "HRTF";
                panner.distanceModel = "linear";
                context.listener.setOrientation(
                    -scope.listenerOrientationFront.x,
                    -scope.listenerOrientationFront.y,
                    scope.listenerOrientationFront.z,
                    scope.listenerOrientationUp.x,
                    scope.listenerOrientationUp.y,
                    -scope.listenerOrientationUp.z);
                context.listener.setPosition(
                    -scope.listenerPosition.x,
                    -scope.listenerPosition.y,
                    -scope.listenerPosition.z);
            }
            gainNode.gain.value = this.volume;
            source.loop = this.loop;
        }
    };

    /**
     * Initializes and plays audio file
     */
    this.play = function(){
        if(scope.soundLoaded) {
            source = context.createBufferSource();
            source.buffer = buffer;

            gainNode = context.createGain();

            if(this.is3D) {
                panner = context.createPanner();
                source.connect(panner);
                panner.connect(gainNode);
                panner.panningModel = "HRTF";
                panner.distanceModel = "linear";
            }else{
                source.connect(gainNode);
            }
            gainNode.connect(context.destination);
            scope.update();
            source.start(pauseTime);
            startTime = Date.now();
            this.isPlaying = true;
        }else{
            console.error("The audio file is not done loading.")
        }
    };

    /**
     * Pauses audio playback
     */
    this.pause = function(){
        if(scope.soundLoaded) {
            source.stop();
            this.isPlaying = false;
            pauseTime = ((Date.now()-startTime)%Math.floor(buffer.duration*1000))/1000;
        }else{
            console.error("The audio file is not done loading.")
        }
    };

    /**
     * Stops audio playback
     */
    this.stop = function(){
        if(scope.soundLoaded) {
            source.stop();
            this.isPlaying = false;
            pauseTime = 0;
        }else{
            console.error("The audio file is not done loading.")
        }
    }
};