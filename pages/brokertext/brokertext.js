// pages/brokertext/brokertext.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
let WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brokerText: '', //内容文本
    hasContent: false //是否有内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let num = options.num
    if (num == 0) {
      this.getBrokerHelp()
    } else if (num == 1) {
      this.getBrokerKnow()
    }
  },
  //获取经纪人使用帮助
  getBrokerHelp() {
    let that = this
    let promise = {
      dictname: '经纪人使用帮助'
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.projectApiFindSettingDict, promise).then((data) => {
      if (!data.data) {
        that.setData({
          hasContent: false
        })
        return
      } else {
        that.setData({
          hasContent: true
        })
      }
      let brokerText = data.data[0].dictdoc
      let article = brokerText;
      WxParse.wxParse('article', 'html', article, that, 5);
      wx.setNavigationBarTitle({
        title: data.data[0].dictname
      })
    })
  },
  //获取经纪人须知
  getBrokerKnow() {
    let that = this
    let promise = {
      dictname: '经纪人须知'
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.projectApiFindSettingDict, promise).then((data) => {
      if (!data.data) {
        that.setData({
          hasContent: false
        })
        return
      } else {
        that.setData({
          hasContent: true
        })
      }
      let brokerText = data.data[0].dictdoc
      let article = brokerText;
      WxParse.wxParse('article', 'html', article, that, 5);
      wx.setNavigationBarTitle({
        title: data.data[0].dictname
      })
    })
  }
})