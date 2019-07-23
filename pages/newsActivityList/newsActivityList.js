// pages/newsActivityInfo/newsActivityInfo.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import fileUrl from '../../http/fileServeUrl.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultImg: '../../images/defaultImg.png',
    imgpath: fileUrl,
    current: 'activity',  //tab下标值
    resList:[],   //返回数据
    //分页请求参数
    requestPage:{
      page: 1,
      perpage: 20
    },
    //请求参数列表
    requestList:{
      type:'0',
      city_area_id: '',
      project_id:'',
      login_by: app.globalData.userId
    },
    isPage: true,   //是否有下一页
    _imgList: [], //新闻图片列表
    _index: 0,  //新加载数据起始下标
    t:0,  //循环变量初始0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNewsActivity()
  },

  // tab切换
  handleChange({ detail }) {
    if (detail.key == this.data.current) return
    this.setData({
      current: detail.key,
      'requestPage.page': 1,
      resList:[],
      isPage:true,
      t:0,
      _index:0,
      _imgList:[]
    });
    this.getNewsActivity()
  },

  //跳转详情页
  goNewsAtvInfo(e){
    let atvid = e.currentTarget.dataset.atvid
    let type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: '../newsActivityInfo/newsActivityInfo?atvid=' + atvid+"&type="+type,
    })
  },

  //获取新闻活动信息
  getNewsActivity() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let reqPath = JSON.parse(JSON.stringify(apiSetting.newsactivityFindNewsActivitys) ) 
    reqPath.url += "?page=" + this.data.requestPage.page + "&perpage=" + this.data.requestPage.perpage
    let promise = JSON.parse(JSON.stringify(this.data.requestList)) 
    promise.city_area_id = app.globalData.storLocalCity.id
    
    if (this.data.current=="news"){
      promise.type='0'
    } else if (this.data.current =="activity"){
      promise.type = '1'
    }
    $http(reqPath, promise).then((data) => {
      let dataArr = data.list
      if (!data.list || !dataArr.length){
        this.setData({isPage:false})
        wx.hideLoading()
        return
      } 
      let newsList=[]
      let activityList=[]
      for (let i = 0; i < dataArr.length; i++) {
        if (dataArr[i].enabled == 1) {
          dataArr.splice(i, 1)
          i--
          continue
        }
        if (dataArr[i].type == 0) {
          if (dataArr[i].published_date && dataArr[i].published_date.indexOf(' ') != -1) {
            dataArr[i].published_date = dataArr[i].published_date.split(' ')[0].split('-').join('.')
          }
          newsList.push(dataArr[i])
        } else if (dataArr[i].type == 1) {
          if (dataArr[i].start_date && dataArr[i].start_date.indexOf(' ') != -1) {
            dataArr[i].start_date = dataArr[i].start_date.split(' ')[0].split('-').join('.')
          }
          if (dataArr[i].end_date && dataArr[i].end_date.indexOf(' ') != -1) {
            dataArr[i].end_date = dataArr[i].end_date.split(' ')[0].split('-').join('.')
          }
          let activityEndDate = new Date(dataArr[i].end_date).getTime()
          let nowDate = new Date().getFullYear() + '-' + Number(new Date().getMonth() + 1) + '-' + new Date().getDate()
          nowDate = new Date(nowDate).getTime()   //当前网络时间 
          if (activityEndDate < nowDate){
            dataArr.splice(i,1)
            i--
            continue
          }
          activityList.push(dataArr[i])
        }
      }
      if (this.data.current=='news'){
        let _arr = [...this.data.resList, ...newsList]
        this.setData({ resList: _arr, _index: this.data.resList.length})
        this.findAttachRelationById(newsList.length)
      } else if (this.data.current == 'activity'){
        let _arr = [...this.data.resList, ...activityList]
        this.setData({ resList: _arr, _index: this.data.resList.length})
        this.findAttachRelationById(activityList.length)
      }
    })
  },

  //获取新闻活动缩略图
  findAttachRelationById(newsAtvListLength){
    let _t = this.data.t //_t=0
    if (_t > newsAtvListLength - 1) {
      let _arr1 = this.data._imgList
      for (let i = this.data._index; i < _arr1.length; i++) {
        if (_arr1[i] !== null && _arr1[i]!==undefined) {
          _arr1[i].upload_file_path = this.data.imgpath + _arr1[i].upload_file_path
        } else {
          _arr1[i] = {
            upload_file_path: this.data.imgpath
          }
        }
      }
      //将图片挂在到户型列表上
      let resList = this.data.resList
      for (let i = 0; i < resList.length; i++) {
        resList[i].imgArr = _arr1[i]
      }
      this.setData({
        resList: resList,
      })
      wx.hideLoading()
      return
    }

    let _resList = this.data.resList
    if (_t > newsAtvListLength - 1) return
    let promise = { id: _resList[this.data._index+_t].id }
    let _arr = this.data._imgList
    $http(apiSetting.newsactivityFindAttachRelationById, promise).then((data) => {
      _arr.push(data.data[0])
      this.setData({
        _imgList: _arr,
        t: _t + 1
      })
      this.findAttachRelationById(newsAtvListLength)
    }), (error) => {
      console.log(error)
    }
  },

  //缩略图加载失败
  errorImg(e){
    if (e.type == 'error') {
      this.data.resList[e.target.dataset.index].imgArr.upload_file_path = this.data.defaultImg
      this.setData({
        resList: this.data.resList
      })
    }
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
      this.data.t=0
      this.data.requestPage.page++
      this.getNewsActivity()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})