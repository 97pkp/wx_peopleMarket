const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//节流函数
function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 500
    console.log('asxas')
  }
  let _lastTime = null
  return function () {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      // 将this和参数传给原函数
      fn.apply(this, arguments)
      _lastTime = _nowTime
    }
  }
}

//计算时差
function getDateDiff(dateTimeStamp) {
  let minute = 1000 * 60;
  let hour = minute * 60;
  let day = hour * 24;
  let halfamonth = day * 15;
  let month = day * 30;
  let now = new Date().getTime();
  let diffValue = now - dateTimeStamp;
  if (diffValue < 0) {
    //若日期不符则弹窗口告之,结束日期不能小于开始日期！
  }
  let monthC = diffValue / month;
  let weekC = diffValue / (7 * day);
  let dayC = diffValue / day;
  let hourC = diffValue / hour;
  let minC = diffValue / minute;
  let result = "";
  if (monthC >= 1) {
    result = parseInt(monthC) + "个月前";
  }
  else if (weekC >= 1) {
    result = parseInt(weekC) + "周前";
  }
  else if (dayC >= 1) {
    result = parseInt(dayC) + "天前";
  }
  else if (hourC >= 1) {
    result = parseInt(hourC) + "个小时前";
  }
  else if (minC >= 1) {
    result = + parseInt(minC) + "分钟前";
  } else
    result = "刚刚";
  return result;
}


module.exports = {
  formatTime: formatTime,
  throttle: throttle,
  getDateDiff: getDateDiff
}