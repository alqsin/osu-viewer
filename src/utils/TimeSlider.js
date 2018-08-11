import React from 'react';
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';

class TimeSlider extends React.PureComponent {
  render() {
    const { value, onChange, totalTime } = this.props

    return (
      <Slider
        min={0}
        max={Math.ceil(totalTime * 10) * 100} // makes it so max-min % step = 0
        step={100}
        onChange={onChange}
        value={value}
      />
    )
  }
}

export default TimeSlider