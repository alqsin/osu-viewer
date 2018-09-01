import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import styled from 'styled-components';

const MuteButton = styled.button`
    padding: 0;
    font-size: 18;
    border: 0;
    margin: 0 0;
    width: 25px;
    background: white;
    outline: none;
`

class VolumeControls extends React.PureComponent {
  render() {
    const totalDivStyle = {
      height: 25,
      width: this.props.windowScale * 50 + 50,
      marginLeft: 7,
      float: 'left',
    }
    const buttonDivStyle = {
      height: 25,
      width: 35,
      float: 'left',
    }
    const sliderDivStyle = {
      height: 25,
      width: this.props.windowScale * 50 + 10,
      marginTop: 5,
      marginLeft: 5,
      float: 'left',
    }
    const buttonStyle = {
      height: 25,
      width: 32,
    }
    return (
      <span style={totalDivStyle}>
        <span style={buttonDivStyle}>
          <MuteButton className="button" style={buttonStyle} type="submit" onClick={this.props.toggleMute}>
            <i className="material-icons">{this.props.muted ? "volume_mute" : "volume_up"}</i>
          </MuteButton>
        </span>
        <span style={sliderDivStyle}>
          <Slider
            onChange={this.props.changeVolume}
            min={0}
            max={30}
            step={0.5}
            value={this.props.muted ? 0 : this.props.volume}
          />
        </span>
      </span>
    )
  }
}

export default VolumeControls;