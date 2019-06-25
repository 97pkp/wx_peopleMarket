// pages/coupon /coupon.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList:[],                //优惠券列表
    showBgpack: false,            //是否显示授权弹窗
    // 请求参数
    pageData: {
      page: 1,
      perpage: 20,
      isPage: true
    },
  },

  //点击领取优惠券
  getCoupon(e) {
    let index = e.target.dataset.index
    let that=this
    let promise = {
      couponId: e.currentTarget.dataset.couponid,     //卡券ID
      userId: app.globalData.userId                   //用户ID
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.apiCouponGetCoupon, promise).then((data) => {
       if(data.code===0){
        wx.showToast({
          title: '领取成功',
          icon: '../../images/getOK.png',
          duration: 2000
        })
          this.setData({ couponList: [], 'pageData.page':1})
          this.getAllCouponList()
       }else if(data.code===-1){
         wx.showToast({
           title: '请勿重复领取',
           icon: 'none',
           duration: 2000
         })
       }else{
         wx.showToast({
           title: '领取失败!\r\n优惠券已被领取完',
           icon: 'none',
           duration: 2000
         })
       }
    }, (error) => {
      console.log(error)
    });
  },

  // 获取微信用户信息
  onGotUserInfo(e) {
    wx.showTabBar()
    if (!e.detail.userInfo) {
      return
    }
    wx.setStorageSync('wxUserInfo', e.detail.userInfo)
    this.setData({
      showBgpack: false
    })
  },
  //取消授权窗
  cancelTip() {
    this.setData({ showBgpack: false })
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that=this
    //用户信息授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.hideTabBar()
          that.setData({
            showBgpack: true
          })
        }
      }
    })

    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    that.getAllCouponList()
  },
  //获取未领取优惠券
  getAllCouponList(){
    let that=this
    let promise = {
      city: app.globalData.storLocalCity.id,
      page: that.data.pageData.page,
      perpage: that.data.pageData.perpage,
      userId: app.globalData.userId
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.apiCouponCouponForCityList, promise).then((data) => {
      let _arr = []
      if (data.data.list.length>0){
        _arr = [...that.data.couponList, ...data.data.list]
      }else{
        that.data.pageData.isPage = false
        wx.hideLoading()
        return
      }
      
      for(let i=0;i<_arr.length;i++){
        _arr[i].startDate = _arr[i].startDate.split(' ')[0].split('-').join('.')
        _arr[i].endDate = _arr[i].endDate.split(' ')[0].split('-').join('.')
        _arr[i].couponname = parseFloat(_arr[i].couponname) 
      } 
    
      this.setData({ couponList: _arr})
      wx.hideLoading()
    }, (error) => {
      console.log(error)
    });
  },

  // 页面到达底部
  onReachBottom() {
    // 判断是否翻页
    if (this.data.pageData.isPage) {
      this.data.pageData.page++
      this.getAllCouponList()
    }
  }
})