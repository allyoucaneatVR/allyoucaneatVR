var Ayce = {};

//for node.js
if(typeof module !== 'undefined')module.exports = Ayce;
if(typeof navigator === 'undefined')navigator = {};


Ayce.requestAnimFrame = function(func){
    var req = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
            window.setTimeout(callback, 1000/60);
        };
    req.call(window, func);
};