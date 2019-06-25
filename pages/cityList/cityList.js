// pages/cityList/cityList.js
//获取应用实例
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cityListData: [],         // 城市列表  
    selectCity: null,         // 当前选中城市id  
    localCity: null,          // 当前选中城市信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.storLocalCity) {
      this.setData({
        localCity: app.globalData.storLocalCity,
        selectCity: app.globalData.storLocalCity.id
      })
    }
    this.getCityList()
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

  //城市选择
  cityChange(e) {
    console.log(e)
    this.setData({
      selectCity: e.target.dataset.item.id,
      localCity: e.target.dataset.item
    })
    wx.setStorageSync('storLocalCity', e.target.dataset.item)
    let _storage = wx.getStorageSync('cityPromise') || {}
    _storage.currentCity = e.target.dataset.item.city
    wx.setStorageSync('cityPromise', _storage)
    app.globalData.storLocalCity = e.target.dataset.item
    this.pageTobind()
  },

  //获取城市列表
  getCityList() {
    let that = this
    that.showLoading()
    let promise = {}
    $http(apiSetting.cityFindCityItems, promise).then((data) => {
      let newData = data.data
      let listData = []
      for (let i in newData) {
        let findIndex = listData.findIndex((n) => {
          return n.key == newData[i].firstCn
        })

        if (findIndex == -1) {
          listData.push({
            'key': newData[i].firstCn,
            'item': [newData[i]]
          })
        } else {
          listData[findIndex].item.push(newData[i])
        }
      }
      that.setData({
        cityListData: listData
      })
      that.hideLoading()
    }, (error) => {
      console.log(error)
      that.hideLoading()
    });
  },

  showLoading() {
    wx.showLoading({
      title: '加载中',
    })
  },

  hideLoading() {
    wx.hideLoading()
  },

  // 页面跳转
  pageTobind() {
    wx.reLaunch({
      url: '../index/index'
    })
  }
})