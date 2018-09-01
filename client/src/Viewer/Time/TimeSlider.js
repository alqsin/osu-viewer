import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import TimeControls from './TimeControls.js';

function msToText(ms) {
  // changes ms (a time in milliseconds) to readable text
  let seconds = Math.floor(ms / 1000);
  ms %= 1000;
  let minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

class TimeSlider extends React.PureComponent {
  render() {
    // volume slider currently occupies windowScale * 50 + 50 pixels
    const headerDivStyle = {
      height: 25,
      width: this.props.windowScale * 590 - 50,
    }
    const sliderDivStyle = {
      width: this.props.windowScale * 590 - 90 - 50,
      height: 25,
      marginTop: 5,
      marginLeft: 10,
      float: 'left',
    }
    const timeDivStyle = {
      marginLeft: 3,
      marginTop: 4,
      fontSize: '16px',
      width: 45,
      height: 25,
      float: 'left',
    }
    const controlsDivStyle = {
      width: 25,
      height: 25,
      float: 'left',
    }
    return (
      <span style={headerDivStyle}>
        <span style={timeDivStyle}>
          {msToText(this.props.currTime)}
        </span>
        <span style={controlsDivStyle}>
          <TimeControls
            toggleAutoplay={this.props.toggleAutoplay}
            autoplay={this.props.autoplay}
          />
        </span>
        <span style={sliderDivStyle}>
          <Slider
            min={0}
            max={Math.ceil(this.props.totalTime * 10) * 100} // makes it so max-min % step = 0
            step={100}
            onChange={this.props.onChange}
            value={this.props.currTime}
          />
        </span>
      </span>
    )
  }
}

export default TimeSlider