import React from 'react';
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';

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
      height: 16,
      width: this.props.windowScale * 512,
    }
    const sliderDivStyle = {
      width: this.props.windowScale * 512 - 50,
      height: 16,
      float: 'left',
    }
    const timeDivStyle = {
      fontSize: '16px',
      width: 50,
      height: 16,
      float: 'left',
    }

    return (
      <div style={headerDivStyle}>
        <div style={timeDivStyle}>
          {msToText(this.props.currTime)}
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