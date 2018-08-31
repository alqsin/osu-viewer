module.exports = {
  getRequiredTimeout(rateLimit, rateInterval, prevCalls) {
    // takes rateLimit and rateInterval, integers representing rate
    // limit and time over which limit is enforced, and prevCalls,
    // an array containing times of  previous calls and returns the time before next
    // call should be made. also fills/prunes prevCalls as necessary
    const currTime = new Date();
    var i = 0;
    for (; i < prevCalls.length; i++) {
      if (prevCalls[i].getTime() > currTime.getTime() - rateInterval) break;
    }
    if (i > 0) {
      prevCalls.splice(0, i);
    }
    if (prevCalls.length < rateLimit) {
      prevCalls.push(currTime);
      return 0;
    }
    const nextTime = new Date(prevCalls[prevCalls.length - rateLimit].getTime() + rateInterval);
    prevCalls.push(nextTime);
    return nextTime.getTime() - currTime;
  }
}