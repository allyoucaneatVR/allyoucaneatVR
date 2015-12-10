/**
 * jslint browser: true
 */

/**
 * Creates loader for text resources
 * @class
 * @constructor
 */
ayce.XMLLoader = function () {

};

/**
 * Loads text resources
 * @param {String} url
 * @return {String} response
 */
ayce.XMLLoader.getSourceSynch = function (url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();
    return (request.status == 200) ? request.responseText : null;
};

ayce.XMLLoader.prototype = {

};