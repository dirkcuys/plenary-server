import React from 'react';
import {ConnectionStatus} from './status';
//import {default as videojs} from '../videojs-compat.js';

export class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    window.videojs(this.refs.plenaryVideo.id, {}, function() {
      this.play();
    });
  }

  render() {
    let path = [
      this.props.conf.dialplanDestinationNumberPrefix,
      this.props.conf.conferenceId
    ].join("");

    return <div className='video-container'>
      <video ref="plenaryVideo" id={this.props.conf.tag + '-video'}>
        <source src={`rtmp://${this.props.conf.videoServerHostname}/stream/${path}`}
                type='rtmp/mp4' />
        <source src={`https://${this.props.conf.videoServerHostname}/dash/${path}/index.mpd`}
                type='application/dash+xml' />
        <source src={`https://${this.props.conf.videoServerHostname}/hls/${path}/index.m3u8`}
                type='application/vnd.apple.mpegURL' />
      </video>
    </div>
  }
}
