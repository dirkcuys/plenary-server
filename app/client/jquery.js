// Require jquery, attach it to the window, and require any associated plugins.
window.$ = window.jQuery = require('jquery');
require('verto/src/jquery.verto.js');
require('verto/src/jquery.FSRTC.js');
require('verto/src/jquery.jsonrpcclient.js');

$.toJSON = function(obj) {
  return JSON.stringify(obj);
}

module.exports = $;
