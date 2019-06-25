// pages/setting/setting.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    versions: '0.0.1',      //版本
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getProjectApiFindSettingDict()
  },


  getProjectApiFindSettingDict: function() {
    let that = this
    let promise = { dictname: '当前版本'}
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.projectApiFindSettingDict, promise).then((data) => {
      that.setData({
        versions: data.data[0].dictdoc
      })
    })
  },

  //跳转文本显示
  showSetText(e){
    let num=e.target.dataset.index
    wx.navigateTo({
      url: '../brokertext /brokertext ?num=' + num
    })
  }
})