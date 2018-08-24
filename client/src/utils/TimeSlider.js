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
    const headerDivStyle = {
      height: 25,
      width: this.props.windowScale * 640,
    }
    const sliderDivStyle = {
      width: this.props.windowScale * 640 - 90,
      height: 25,
      marginTop: 5,
      float: 'right',
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
      <div style={headerDivStyle}>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <div style={timeDivStyle}>
          {msToText(this.props.currTime)}
        </div>
        < div style={controlsDivStyle}>
          <TimeControls
            toggleAutoplay={this.props.toggleAutoplay}
            autoplay={this.props.autoplay}
          />
        </div>
        <div style={sliderDivStyle}>  
          <Slider
            min={0}
            max={Math.ceil(this.props.totalTime * 10) * 100} // makes it so max-min % step = 0
            step={100}
            onChange={this.props.onChange}
            value={this.props.currTime}
          />
        </div>
      </div>
    )
  }
}

export default TimeSlider