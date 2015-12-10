var ayce = {};

//for node.js
if(typeof module !== 'undefined')module.exports = ayce;
if(typeof navigator === 'undefined')navigator = {};


ayce.requestAnimFrame = function(func){
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