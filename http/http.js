// 生产地址
const url = 'https://qmyx.coli688.com/zhwx-api'
// 海客测试地址
// const url = 'http://haiketest.coli688.com:8090/zhwx-api'
// 测试地址
// const url = 'http://39.98.191.16/zhwx-api'


let $httpServer = function(opts, data) {
  // console.log(getApp().globalData.token)
  let token = getApp().globalData.token
  let promise = new Promise(function(resolve, reject) {
    return wx.request({
      url: url + opts.url,
      data: data,
      header: {
        'content-type': 'application/json',
        'vx-zhwx-token': token
      },
      method: opts.method,
      success(res) {
        resolve(res.data)
      },
      fail(error) {
        reject(error)
      }
    })
  })
  return promise
}

export default $httpServer