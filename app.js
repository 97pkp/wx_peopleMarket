//app.js
import apiSetting from 'http/apiSetting.js'
import $http from 'http/http.js'
App({
  onLaunch: function() {
    let that = this
    // 获取本地存储的城市
    that.globalData.storLocalCity = wx.getStorageSync('storLocalCity') || null
    // that.globalData.storLocalCity = {
    //   area: "其他城市",
    //   city: "赣州",
    //   cityx: "",
    //   cityy: "",
    //   createBy: "",
    //   createDate: null,
    //   firstCn: "G",
    //   id: "0--1-1376-",
    //   snumber: 10145,
    //   status: 0,
    //   updateBy: "",
    //   updateDate: null,
    // }

    that.checkUpdateVersion()
  },

  // 全局参数
  globalData: {
    isCheck: false,
    openid: null,
    storLocalCity: null,
    bindUserInfo: {},
    userId: null,
    transienceCity: {},
    token: '',
    sessionKey: ''
  },

  //检测小程序版本更新
  checkUpdateVersion() {
    //判断微信版本是否 兼容小程序更新机制API的使用
    if (wx.canIUse('getUpdateManager')) {
      //创建 UpdateManager 实例
      const updateManager = wx.getUpdateManager();
      // console.log('是否进入模拟更新');
      //检测版本更新
      updateManager.onCheckForUpdate(function(res) {
        // console.log('是否获取版本');
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //监听小程序有版本更新事件
          updateManager.onUpdateReady(function() {
            wx.removeStorage({
              key: 'storLocalCity',
              success(res) {
                console.log(res)
              }
            })
            //TODO 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 （ 此处进行了自动更新操作）
            updateManager.applyUpdate();
          })
          updateManager.onUpdateFailed(function() {
            // 新版本下载失败
            wx.showModal({
              title: '已经有新版本喽~',
              content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~',
            })
          })
        }
      })
    } else {
      //TODO 此时微信版本太低（一般而言版本都是支持的）
      wx.showModal({
        title: '溫馨提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
})