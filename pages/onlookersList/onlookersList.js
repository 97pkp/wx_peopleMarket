// pages/onlookersList/onlookersList.js
import util from '../../utils/util.js'
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'

let projectId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultImg: '../../images/defaultImg.png', //默认图才能相对路径
    scrollTop: 100,
    onlookersListImg: [],//获取最新数据
    onlookersResult:'',//记录数据总数
    scrollHeight: 0,
    pageSize: 10,
    pageNum: 0,
    shopLoadMoreTiem: false//判断是否加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    projectId = options.project_id;
    
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          scrollHeight: res.windowHeight
        })
      }
    })
    //
    this.getOnLookersList(projectId);
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

  },
  /*************************************************************************** */
  //查询围观列表
  getOnLookersList(projectId) {
    this.setData({
      stopLoadMoreTiem: false
})
    let param = {
      projectId: projectId,
      pageSize: this.data.pageSize,
      pageNum: this.data.pageNum
    };
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    $http(apiSetting.apiOnlookersList, param).then((data) => {
      wx.hideLoading();

      if (data.code == 0 && data.data.list.length > 0) {
        this.stopLoadMoreTiem = false;
        let result = data.data.list,
          results = [], resultPush = "";
        
        result.map((item, index) => {
          debugger
          resultPush = {
            head_img: item.head_img,
            nick_name: item.nick_name,
            view_date: util.getDateDiff(item.view_date)
          };
          results.push(resultPush)
        });
        let list = this.data.onlookersListImg.concat(results);
        this.setData({
          onlookersListImg: list,
          onlookersResult: data.data.viewCount
        })
      }
    }, (error) => {
      wx.hideLoading()
      console.log(error)
    })
  },
  //下拉加载更多
  loadmore() {
    
    if (this.data.stopLoadMoreTiem || this.data.onlookersResult == this.data.onlookersListImg.length) {
      return;
    }
    this.setData({
      pageNum: this.data.pageNum + 1 //上拉到底时将page+1后再调取列表接口
    });
    this.getOnLookersList(projectId)
  },
  //图片出错
  errorBombScreen(e) {
    
    if (e.type == 'error') {
      this.data.onlookersListImg[e.target.dataset.index].head_img = this.data.defaultImg
      this.setData({
        onlookersListImg: this.data.onlookersListImg
      })
    }
  },
})
