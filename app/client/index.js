import ReactDOM from 'react-dom';
import React from 'react';
import queryString from 'query-string';
import * as videocall from './components/VideoCall';
import * as videoplayer from './components/VideoPlayer';

// Keep these mutable so hot reloading can work.
let VideoCall = videocall.VideoCall;
let VideoPlayer = videoplayer.VideoPlayer;

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
      vertoBestFrameRate: 30
    }
  }
  let conf = Object.assign(defaults, QUERY_STRING, options)

  // Indirection for HMR.
  let _videoCall;
  const _renderPlenaryVideo = function() {
    let state = _videoCall ? _videoCall.state : undefined;
    if (options.mode === "listen") {
      //_videoCall = <VideoPlayer conf={conf} />;
      _videoCall = <VideoCall conf={conf} />;
    } else {
      _videoCall = <VideoCall conf={conf} />;
    }
    if (state) {
      _videoCall.setState(state);
    }
    ReactDOM.render(_videoCall, document.getElementById(conf.tag));
  }
  _renderPlenaryVideo();
  if (module.hot) {
    module.hot.accept([
      './components/VideoPlayer.js',
      './components/VideoCall.js',
      './components/controls.js',
      './components/status.js'
    ], () => {
      ({VideoCall} = require('./components/VideoCall'));
      ({VideoPlayer} = require('./components/VideoPlayer'));
      _renderPlenaryVideo();
    })
  }
}
window.renderPlenaryVideo = renderPlenaryVideo;
