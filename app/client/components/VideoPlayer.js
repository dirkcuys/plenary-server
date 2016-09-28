import React from 'react';
import {ConnectionStatus} from './status';
//import {default as videojs} from '../videojs-compat.js';

class ImmutableVideo extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  hasFlash() {
    // from http://stackoverflow.com/a/20095467
    let hasFlash = false;
    try {
      let fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (fo) {
        hasFlash = true;
      }
    } catch (e) {
      if (navigator.mimeTypes
            && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
            && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
        hasFlash = true;
      }
    }
    return hasFlash;
  }

  hasMSE() {
    return 'MediaSource' in window && shaka.Player.isBrowserSupported();
  }

  componentDidMount() {
    this.loadVideo();
  }

  getVideoPathName() {
    return [
      this.props.conf.dialplanDestinationNumberPrefix,
      this.props.conf.conferenceId
    ].join("");
  }

  loadVideo() {
    let path = this.getVideoPathName();
    let dashUrl = `https://${this.props.conf.videoServerHostname}/dash/${path}/index.mpd`;
    let handleError = () => {
      this.props.setWaiting(true);
      setTimeout(() => this.loadVideo(), 1000);
    }

    fetch(dashUrl)
    .then((res) => {
      if (res.status !== 200) {
        return handleError();
      } else {
        this.props.setWaiting(false);
      }
      if (this.hasFlash()) {
        this.refs.plenaryVideo.className = "video-js vjs-default-skin";
        let rtmpUrl = `rtmp://${this.props.conf.videoServerHostname}/stream/${path}`;
        videojs(this.refs.plenaryVideo.id, {controls: true}, function() {
          let player = this;
          player.src({type: 'rtmp/mp4', src: rtmpUrl});
          player.play();
        });
      } else if (this.hasMSE()) {
        // Need to invoke dashjs player via the API, rather than via the
        // automatic parsing of source on video elements, because otherwise we
        // get weird behavior with playback freezing after the first segment.
        let player = new shaka.Player(this.refs.plenaryVideo);
        player.addEventListener("error",  (event) => {
          console.log("ERROR!!!!!!!!!!!", error);
          this.props.setError(error);
        });
        player.load(dashUrl).then(function() {
          console.log("The player has been loaded!");
        });
        window.player = player
      }
    })
    .catch((err) => {
      console.log("Handled", err);
      handleError()
    });
  }
  render() {
    // Options are:
    // 1. Flash: use video.js + rtmp. Load src in componentDidMount.
    // 2. MSE: use dash.js + MPEG-DASH. (Covers all but iOS). Load src in
    //    componentDidMount. If the browser doesn't support h264 (eg. Chromium),
    //    display an error message.
    // 3. No MSE or flash: must be iOS. Pray for HLS via native video element.
    let hlsUrl = `https://${this.props.conf.videoServerHostname}/hls/${this.getVideoPathName()}/index.m3u8`;
    return <div className='video-container' ref='videoContainer'>
      <video autoPlay ref="plenaryVideo" id={`${this.props.conf.tag}-video`}>
        { !this.hasFlash() && !this.hasMSE() ?
          <source src={hlsUrl} type='application/vnd.apple.mpegURL' />
        : ""}
      </video>
    </div>
  }
}

export class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {};
  }

  render() {
    if (this.state.error && this.state.error.event === "MEDIA_ERR_SRC_NOT_SUPPORTED") {
      return <div className='error'>
        Aw, snap. Your browser doesn't support any available video format.
      </div>
    }
    
    return <div className='video-container'>
      { this.state.waiting ?  <div>Waiting for video to start</div> : "" }
      <ImmutableVideo
        setWaiting={(waiting) => this.setState({waiting})}
        setError={(error) => this.setState({error})}
        {...this.props} />
    </div>
  }
}
