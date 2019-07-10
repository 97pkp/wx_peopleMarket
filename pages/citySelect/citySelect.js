// pages/citySelect/citySelect.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cityListData: [], // 城市列表
    selectCity: null, // 当前选中城市id
    localCity: null, // 当前选中城市信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.globalData.transienceCity = {}
    this.setData({
      selectCity: options.city_id
    })
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
    this.setData({
      selectCity: e.target.dataset.item.id, 
      localCity: e.target.dataset.item
    })
    this.pageTobind()
  },

  //获取城市列表
  getCityList() {
    let that = this
    that.showLoading()
    let promise = { openID: app.globalData.openid}
    $http(apiSetting.recommendGetCityList, promise).then((data) => {
      let newData = data.data
      let listData = []
      for (let i in newData) {
        let findIndex = listData.findIndex((n) => {
          return n.key == newData[i].FIRST_CN
        })

        if (findIndex == -1) {
          listData.push({
            'key': newData[i].FIRST_CN,
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
    app.globalData.transienceCity = this.data.localCity
    wx.navigateBack({
      delta: 1
    })
  }
})