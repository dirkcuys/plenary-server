import ReactDOM from 'react-dom';
import React from 'react';
import queryString from 'query-string';
import * as videocall from './components/VideoCall';
// Keep this mutable so hot reloading can work.
let VideoCall = videocall.VideoCall;

// Parameters from the query string
const QUERY_STRING = queryString.parse(location.search);

/**
 * Bootstrap verto and react UI.
 */
export const renderPlenaryVideo = function(options) {
  const defaults = {
    displayName: "Anonymous",
    maxVideoParams: {
      maxWidth: 640, maxHeight: 480,
      minWidth: 160, minHeight: 120,
      minFrameRate: 15,
      vertoBestFramerate: 30
    }
  }
  let conf = Object.assign(defaults, QUERY_STRING, options)

  // Indirection for HMR.
  let _videoCall;
  const _renderPlenaryVideo = function() {
    let state = _videoCall ? _videoCall.state : undefined;
    _videoCall = <VideoCall conf={conf} />;
    if (state) {
      _videoCall.setState(state);
    }
    ReactDOM.render(_videoCall, document.getElementById(conf.tag));
  }
  _renderPlenaryVideo();
  if (module.hot) {
    module.hot.accept([
      './components/VideoCall.js',
      './components/controls.js',
      './components/Status.js'
    ], () => {
      ({VideoCall} = require('./components/VideoCall'));
      _renderPlenaryVideo();
    })
  }
}
window.renderPlenaryVideo = renderPlenaryVideo;
