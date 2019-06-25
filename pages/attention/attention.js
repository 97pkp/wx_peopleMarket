// pages/attention/attention.js
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
    imgpath: fileUrl,          //图片根路径                      
    attentionList: [],         //我的关注列表
    isHide: false,      
    // 数据请求参数
    pageData: {
      page: 1,
      perpage: 5,
      isPage: true
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that=this
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    this.getProjectApiFindProjectListByMyConc(this.data.attentionList)
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
    if (this.data.isHide){
      this.setData({ 'pageData.page': 1,'pageData.isPage':true})
      this.getProjectApiFindProjectListByMyConc([])
    }
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.data.isHide = true
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

  //获取我的关注列表
  getProjectApiFindProjectListByMyConc(list) {
    let promise = {
      page: this.data.pageData.page,
      perpage: this.data.pageData.perpage,
      login_by: app.globalData.userId
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.projectApiFindProjectListByMyConc, promise).then((data) => {
      let attentions = data.list
      if (attentions.length > 0) {
        //修改图片路径
        for (let i = 0; i < attentions.length; i++) {
          if (attentions[i].pictureurl === 'null') {
            attentions[i].pictureurl = ''
          } else {
            attentions[i].pictureurl = this.data.imgpath + attentions[i].pictureurl
          }
          if (attentions[i].mainprice){
            attentions[i].mainprice = parseInt(attentions[i].mainprice)
          }
        }
        let _arr1 = []
        for (let i = 0; i < attentions.length; i++) {
          if (!attentions[i].labels) {
            attentions[i].labels = []
          } else {
             attentions[i].labels = attentions[i].labels.split(',')
          }
        }
        let newArr=[]
        newArr = [...list, ...attentions]
        this.setData({
          attentionList: newArr
        })
        wx.hideLoading()
      }else {
        this.setData({'pageData.isPage':false})
        wx.hideLoading()
        return
      }
    })
  },

  //查看关注列表楼盘详情
  goInformation(e) {
    let project_id = e.currentTarget.dataset.project_id
    wx.navigateTo({
      url: '../information/information?project_id=' + project_id,
    })
  },

  // 页面到达底部
  onReachBottom() {
    // 判断是否翻页
    if (this.data.pageData.isPage) {
      this.data.pageData.page++;
      this.getProjectApiFindProjectListByMyConc(this.data.attentionList)
    }
  },

  //关注列表图片错误
  erroImage(e){
    if (e.type == 'error') {
      this.data.attentionList[e.target.dataset.index].pictureurl = this.data.defaultImg
      this.setData({
        attentionList: this.data.attentionList
      })
    }
  }
})