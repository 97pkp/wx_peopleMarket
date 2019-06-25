// pages/oneself/oneself.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
const {
  $Message
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPermit:false,       //是否显示使用权限弹窗
    // visible: false,
    brokertype: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this

    if (app.globalData.status == 401) {
      that.setData({
        isPermit: true
      })
    }
   
    if (app.globalData.isCheck) {
      that.setData({
        brokertype: app.globalData.bindUserInfo.brokertype
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  visibleOk() {
    wx.navigateTo({
      url: "../bindUser/bindUser"
    })
  },
  visibleOkClose() {
    wx.reLaunch({
      url: "../index/index"
    })
  },

  pageTobind(e) {
    let pageUrl = e.target.dataset.url
    wx.navigateTo({
      url: pageUrl
    })
  },

  // 获取绑定用户信息
  // getUserGetUserInfo(val) {
  //   let that = this
  //   $http(apiSetting.userGetUserInfo, {
  //     openid: val
  //   }).then((data) => {
  //     app.globalData.bindUserInfo = data.data
  //     that.setData({
  //       brokertype: data.data.brokertype
  //     })
  //   })
  // },
})