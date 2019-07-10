// pages/newsActivityInfo/newsActivityInfo.js
let WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsAtvInfo:null,  //新闻活动数据项
    type:0,   //默认项目为新闻
    newsActivityId:'',  //活动id
    isClickBtn:false,  //是否点击报名按钮
    btnType:0, //按钮样式 0：活动报名，1：已报名，2：活动未开始，3：活动已结束
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    let that=this
    this.setData({ newsActivityId: options.atvid, type: options.type})
    if (options.type=="0"){
      wx.setNavigationBarTitle({
        title: '新闻'
      })
    } else if (options.type == "1"){
      wx.setNavigationBarTitle({
        title: '活动'
      })
      this.findMyEnrollActivityById()
    }
    that.findNewsActivityById()
  },
  //获取新闻活动详情
  findNewsActivityById(){
    let promise = { id: this.data.newsActivityId}
    if (this.data.type=="0"){
      promise.visitor_flag="1"
    } 
    $http(apiSetting.newsactivityFindNewsActivityById, promise).then((data) => {
      if(!data.data) return
      let newsAtvItem = data.data
      if (newsAtvItem.type == 0) {
        if (newsAtvItem.create_date && newsAtvItem.create_date.indexOf(' ') != -1) {
          newsAtvItem.create_date = newsAtvItem.create_date.split(' ')[0].split('-').join('.')
        }
      } else if (newsAtvItem.type == 1) {
        if (newsAtvItem.create_date && newsAtvItem.create_date.indexOf(' ') != -1) {
          newsAtvItem.create_date = newsAtvItem.create_date.split(' ')[0].split('-').join('.')
        }
        if (newsAtvItem.end_date && newsAtvItem.end_date.indexOf(' ') != -1) {
          newsAtvItem.end_date = newsAtvItem.end_date.split(' ')[0].split('-').join('.')
        }
        let nowDate= new Date().getTime()
        let startTime = new Date(newsAtvItem.settings_enroll_startTime).getTime()
        let endTime = new Date(newsAtvItem.settings_enroll_endTime).getTime() 
        if (startTime>nowDate){
          this.setData({btnType:2})
        }
        if (endTime<nowDate){
          this.setData({ btnType:3})
        }
      }
      this.setData({ newsAtvInfo:newsAtvItem})
      let article = newsAtvItem.content
      WxParse.wxParse('article', 'html', article, this, 5);
      wx.hideLoading()
    }, (error) => {
      console.log(error)
    });
  },

  //查询是否已经报名
  findMyEnrollActivityById(){
    let promise = { id: this.data.newsActivityId, userId: app.globalData.userId}
    $http(apiSetting.newsactivityFindMyEnrollActivityById, promise).then((data) => {
      if(data.list!=null){
        this.setData({ btnType:1})
      }
    }, (error) => {
      console.log(error)
    });
  },

  //活动报名
  bindSub() {
    if (this.data.btnType!=0) return
    let promise={
      id: this.data.newsActivityId, 
      user_id: app.globalData.userId 
    }
    $http(apiSetting.newsactivityInsertActivityEnrollee, promise).then((data) => {
      if(!data.code){
        // this.setData({ isClickBtn: true })
        this.setData({ btnType: 1})
        wx.showModal({
          title: '报名成功',
          confirmText: '我的报名',
          success(res){
            if (res.confirm) {
              wx.navigateTo({
                url: '../myApply/myApply',
              })
            } else if (res.cancel) {
              return
            }
          }
        })
      }else{
        // this.setData({ isClickBtn: false })
        this.setData({ btnType: 0 })
      }
    }, (error) => {
      console.log(error)
      // this.setData({ isClickBtn: false })
      this.setData({ btnType: 0})
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})