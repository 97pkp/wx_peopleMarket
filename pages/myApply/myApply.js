// pages/myApply/myApply.js

const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import fileUrl from '../../http/fileServeUrl.js'
import util from '../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultImg: '../../images/defaultImg.png',
    imgpath: fileUrl,
    activityList:[],  //活动报名列表
    //分页请求参数
    requestPage: {
      page: 1,
      perpage: 20
    },
    isPage:true,  //是否分页查询 默认是
    _imgList: [], //新闻图片列表
    _index: 0,  //新加载数据起始下标
    t: 0,  //循环变量初始0

  },

  //获取我的报名列表
  findMyEnrollActivityListById() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    let reqPath = JSON.parse(JSON.stringify(apiSetting.newsactivityFindMyEnrollActivityById))
    reqPath.url += "?page=" + this.data.requestPage.page + "&perpage=" + this.data.requestPage.perpage
    let promise = { "userId": app.globalData.userId }
    $http(reqPath, promise).then((data) => {
      if (!data.list || !data.list.length) {
        this.setData({ isPage: false })
        wx.hideLoading()
        return
      } 
      let dataArr=data.list
      for (let i = 0; i < dataArr.length;i++){
        if (dataArr[i].start_date && dataArr[i].start_date.indexOf(' ') != -1) {
          dataArr[i].start_date = dataArr[i].start_date.split(' ')[0].split('-').join('.')
        }
        if (dataArr[i].end_date && dataArr[i].end_date.indexOf(' ') != -1) {
          dataArr[i].end_date = dataArr[i].end_date.split(' ')[0].split('-').join('.')
        }
      }

      let _arr = [...this.data.activityList, ...dataArr]
      this.setData({ activityList: _arr, _index: this.data.activityList.length })
      this.findAttachRelationById(dataArr.length)
    }, (error) => {
      wx.hideLoading()
      console.log(error)
    });
  },

  //获取活动缩略图
  findAttachRelationById(atvListLength) {
    let _t = this.data.t //_t=0
    if (_t > atvListLength - 1) {
      let _arr1 = this.data._imgList
      for (let i = this.data._index; i < _arr1.length; i++) {
        if (_arr1[i] !== null && _arr1[i] !== undefined) {
          _arr1[i].upload_file_path = this.data.imgpath + _arr1[i].upload_file_path
        } else {
          _arr1[i] = {
            upload_file_path: this.data.imgpath
          }
        }
      }
      //将图片挂在到户型列表上
      let activityList = this.data.activityList
      for (let i = 0; i < activityList.length; i++) {
        activityList[i].imgArr = _arr1[i]
      }
      this.setData({
        activityList: activityList,
      })
      wx.hideLoading()
      return
    }

    let _activityList = this.data.activityList
    // if (_t > atvListLength - 1) return
    let promise = { id: _activityList[this.data._index + _t].id }
    let _arr = this.data._imgList
    $http(apiSetting.newsactivityFindAttachRelationById, promise).then((data) => {
      _arr.push(data.data[0])
      this.setData({
        _imgList: _arr,
        t: _t + 1
      })
      this.findAttachRelationById(atvListLength)
    }), (error) => {
      console.log(error)
    }
  },
  //缩略图加载失败
  errorImg(e) {
    if (e.type == 'error') {
      this.data.activityList[e.target.dataset.index].imgArr.upload_file_path = this.data.defaultImg
      this.setData({
        activityList: this.data.activityList
      })
    }
  },

  //跳转活动详情页
  // goNewsAtvInfo(e){
  //   let atvid = e.currentTarget.dataset.atvid
  //   wx.navigateTo({
  //     url: '../newsActivityInfo/newsActivityInfo?atvid=' + atvid + "&type=1"+"&hideBtn=true",
  //   })
  // },
  goNewsAtvInfo: util.throttle(function(e){
    let atvid = e.currentTarget.dataset.atvid
    wx.navigateTo({
      url: '../newsActivityInfo/newsActivityInfo?atvid=' + atvid + "&type=1" + "&hideBtn=true",
    })
  },1500),


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.findMyEnrollActivityListById()
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
    if (this.data.isPage) {
      this.data.t = 0
      this.data.requestPage.page++
      this.findMyEnrollActivityListById()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

})