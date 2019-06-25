// pages/mycoupon/mycoupon.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    usedIndex: 0,                      /*类型选择下标*/
    //isOverDate: 0,                    /*是否过期*/
    myCouponList:[],                      //视图列表
    // myCouponNoUseList:[],             //我的优惠券列表-未使用              
    // myCouponIsUsedList: [],            //我的优惠券列表-已使用       
    // myCouponOldUsedList: [],            //我的优惠券列表-已过期  
    requestData: {
      isUsage: 0,                            //使用状态
      page: 1,                               //页码
      perpage: 10,                           //每页数
      userId: ''                            //用户ID
    },
    isPage:true                             //是否加载
  },

  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    let that = this
    that.setData({ 'requestData.userId': app.globalData.userId })         //用户ID
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    that.getMyConuponList()
  },
  
  //获取我的优惠券列表
  getMyConuponList(){
    let that=this
    that.setData({ 'requestData.isUsage': that.data.usedIndex})
    let promise = that.data.requestData
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.apiCouponList, promise).then((data) => {
      let _arr = data.data.list
      this.setData({ test: JSON.stringify(_arr) })
      let _arr1=[]
      if(_arr.length>0){
        for (let i = 0; i < _arr.length; i++) {
          if (_arr[i].startDate && _arr[i].startDate.indexOf(' ') != -1 && _arr[i].startDate.indexOf('-') != -1){
            _arr[i].startDate = _arr[i].startDate.split(' ')[0].split('-').join('.')
          }
          if (_arr[i].endDate && _arr[i].endDate.indexOf(' ') != -1 && _arr[i].endDate.indexOf('-') != -1){
            _arr[i].endDate = _arr[i].endDate.split(' ')[0].split('-').join('.')
          }
          if (_arr[i].couponname){
            _arr[i].couponname = parseFloat(_arr[i].couponname)             //数据转换n 
          }
        }
        _arr1 = [...that.data.myCouponList,..._arr]
        that.setData({ myCouponList: _arr1 })
        wx.hideLoading()
      }else{
        // that.data.isPage = false
        this.setData({ isPage:false})
        wx.hideLoading()
        return
      }
    }, (error) => {
      console.log(error)
    });
  },
  // 页面到达底部
  onReachBottom() {
    let that=this
    // 判断是否翻页
    if (that.data.isPage) {
      that.data.requestData.page++
      that.getMyConuponList()
    }
  },
  //选择卡券类型
  clickItem(e) {
    let that=this
    if (e.target.dataset.type === undefined) return
    let type = e.target.dataset.type
    if (type !== that.data.usedIndex){
      that.setData({ myCouponList: [] })
      that.setData({ 'requestData.page': 1 })
      that.setData({ usedIndex: type ,isPage:true})
      that.getMyConuponList()
    }
  },
})