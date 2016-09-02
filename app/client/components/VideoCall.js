import React from 'react';
import {ListenerControls, ParticipantControls} from './controls';
import {ConnectionStatus, PresentCount} from './status';
import * as vertoClient from '../vertoClient';

export class VideoCall extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: 'loading',
      callIsActive: false,
      dialog: null
    }
  }

  componentDidMount() {
    vertoClient.connect(
      this.props.conf,
      this.refs.plenaryVideo.id,
      {
        onWSLogin: this.onWSLogin.bind(this),
        onWSClose: this.onWSClose.bind(this),
        onDialogState: this.onDialogState.bind(this),
        onMessage: this.onMessage.bind(this)
      }
    );
  }

  //
  // Verto callbacks
  //

  // Websocket connection to FreeSWITCH authenticated
  onWSLogin(verto, success) {
    console.log("[onWSLogin]", verto, success);
    if (success) {
      vertoClient.setVideoParamsByBandwidth(verto, this.props.conf)
      .then(() => {
        console.log("[startCall]", verto);
        if (!this.state.callIsActive) {
          vertoClient.startCall(verto, this.props.conf)
        } else {
          console.log("... not starting new call, callIsActive is true");
        }
      });
    }
  }

  // Websocket connection to FreeSWITCH closed
  onWSClose(verto, success) {
    console.log("[onWSClose]", verto, success);
    this.setState({callIsActive: false});
  }

  // Receives call state messages from FreeSWITCH
  onDialogState(dialog) {
    console.log("[onDialogState]", dialog.state.name, dialog);
    this.setState({status: dialog.state.name});
    switch (dialog.state.name) {
      case "new":
      case "requesting":
      case "trying":
      case "recovering":
      case "ringing":
      case "answering":
      case "early":
      case "held":
        // Just set 'callIsActive' to prevent call doubling.
        return this.setState({callIsActive: true});
      case "active":
        // Set 'callIsActive' and also attach event listeners, as we now have a
        // functioning call.
        return this.setState({
          callIsActive: true,
          dialog: dialog
        });
      case "hangup":
        this.setState({callIsActive: false});
        alert("Call ended with cause: " + dialog.cause);
        console.log("Call ended with cause: " + dialog.cause);
        return
      case "destroy":
      case "purge":
        return this.setState({callIsActive: false});
    }
  }

  // Receives conference-related messages from FreeSWITCH.
  // Note that it's possible to write server-side modules to send customized
  // messages via this callback.
  onMessage(verto, dialog, message, data) {
    console.log("[onMessage]", verto, dialog, message, data)
    switch (message) {
      case $.verto.enum.message.pvtEvent:
        if (data.pvtData) {
          switch (data.pvtData.action) {
            // This client has joined the live array for the conference.
            case "conference-liveArray-join":
              // With the initial live array data from the server, you can
              // configure/subscribe to the live array.
              this.initLiveArray(verto, dialog, data);
              break;
            // This client has left the live array for the conference.
            case "conference-liveArray-part":
              // Some kind of client-side wrapup...
              break;
          }
        }
        break;
    }
  }

  initLiveArray(verto, dialog, data) {
    let liveArray = new $.verto.liveArray(
      verto,
      data.pvtData.laChannel,
      data.pvtData.laName,
      {subParams: {callID: dialog ? dialog.callID : null}}
    );
    liveArray.onChange = (liveArray, args) => {
      this.setState({presentCount: liveArray.arrayLen()});
    };
    liveArray.onErr = (liveArray, args) => {
      console.error("[liveArray.onErr]", liveArray, args);
    };
  }

  render() {
    let Controls;
    if (this.props.conf.mode === 'participate') {
      Controls = ParticipantControls;
    } else {
      Controls = ListenerControls;
    }
    return <div className='video-container'>
      <video id={this.props.conf.tag + '-video'} ref="plenaryVideo" />
      {
        this.props.conf.mode === 'participate' ?
          <ParticipantControls dialog={this.state.dialog} />
        :
          <ListenerControls dialog={this.state.dialog} />
      }
      <ConnectionStatus status={this.state.status} />
      <PresentCount count={this.state.presentCount} />
    </div>
  }
}
VideoCall.propTypes = {
  conf: React.PropTypes.object.isRequired
};
