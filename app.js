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
  },

  // 全局参数
  globalData: {
    isCheck: false,
    openid: null,
    storLocalCity: null,
    bindUserInfo: {},
    userId: null,
    transienceCity: {},
    token: ''
  }
})