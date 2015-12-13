/**
 * jslint browser: true
 */

/**
 * Creates loader for text resources
 * @class
 * @constructor
 */
Ayce.XMLLoader = function () {

};

/**
 * Loads text resources
 * @param {String} url
 * @return {String} response
 */
Ayce.XMLLoader.getSourceSynch = function (url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();
    return (request.status == 200) ? request.responseText : null;
};

Ayce.XMLLoader.prototype = {

};