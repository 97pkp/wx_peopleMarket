// pages/oneself/oneself.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import appid from '../../http/appID.js'
import util from '../../utils/util.js'

const {
  $Message
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPermit: false, //是否显示使用权限弹窗
    brokertype: '',

    //用户信息弹窗变量
    showBgpack: false, //是否显示用户信息授权窗口
    showPhonepack: false, //是否显示手机号授权窗口
    showBindUserInfo: false, //是否显示绑定用户信息窗口
    pageUrl: '', // 跳转路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this

    if (app.globalData.status == 401) {
      that.setData({
        isPermit: true
      })
    }

    if (app.globalData.isCheck) {
      that.setData({
        brokertype: app.globalData.bindUserInfo.brokertype
      })
    }
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
    this.setData({
      showBgpack: false, //是否显示用户信息授权窗口
      showPhonepack: false, //是否显示手机号授权窗口
      showBindUserInfo: false, //是否显示绑定用户信息窗口
    })
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
  // visibleOk() {
  //   wx.navigateTo({
  //     url: "../bindUser/bindUser"
  //   })
  // },
  // visibleOkClose() {
  //   wx.reLaunch({
  //     url: "../index/index"
  //   })
  // },

  // pageTobind(e) {
  //   this.setData({
  //     pageUrl: e.target.dataset.url
  //   })
  //   this.Users()
  // },
  pageTobind: util.throttle(function(e){
    this.setData({
      pageUrl: e.target.dataset.url
    })
    this.Users()
  },1500),
  

  //跳转绑定信息页
  pageTobindUser(e) {
    wx.navigateTo({
      url: '../bindUser/bindUser',
    })
  },
  //跳转设置页
  pageTobindSet(e) {
    wx.navigateTo({
      url: '../setting/setting',
    })
  },

  //用户信息获取
  Users() {
    let that = this
    //检查用户信息授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            showBgpack: true
          })
          // wx.hideTabBar()
        } else {
          //获取缓存信息验证手机号授权
          let wxDetailUserInfo = wx.getStorageSync("wxDetailUserInfo") || {}
          if (JSON.stringify(wxDetailUserInfo) !== "{}") {
            if (wxDetailUserInfo.wxPhoneNumber && wxDetailUserInfo.wxPhoneNumber != '') {
              that.setData({
                showPhonepack: false
              })
              //若验证手机号已经授权，去判断受否绑定用户信息
              if (app.globalData.isCheck) {
                that.setData({
                  showBindUserInfo: false
                })
                wx.navigateTo({
                  url: that.data.pageUrl,
                })
              } else {
                that.setData({
                  showBindUserInfo: true,
                })
              }
            } else {
              that.setData({
                showPhonepack: true
              })
            }
          } else {
            that.setData({
              showPhonepack: true
            })
          }
        }
      }
    })
  },
  // 获取微信用户信息
  onGotUserInfo(e) {
    if (!e.detail.userInfo) {
      return
    }
    wx.setStorageSync('wxUserInfo', e.detail.userInfo)
    this.setData({
      showBgpack: false,
      showPhonepack: true
    })
    this.getLocation()
  },
  //获取手机号
  getPhoneNumber(e) {
    let that = this
    that.setData({
      showPhonepack: false
    })
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      let promise = {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        sessionKey: app.globalData.sessionKey,
        openID: app.globalData.openid,
        appid: appid
      }
      $http(apiSetting.userGetWxPhone, promise).then((data) => {
        let phoneData = JSON.parse(data.data)
        let wxDetailUserInfo = wx.getStorageSync("wxDetailUserInfo") || {}
        wxDetailUserInfo.wxPhoneNumber = phoneData.phoneNumber
        wx.setStorageSync('wxDetailUserInfo', wxDetailUserInfo)
        //若验证手机号已经授权，去判断受否绑定用户信息
        if (app.globalData.isCheck) {
          that.setData({
            showBindUserInfo: false
          })
          wx.navigateTo({
            url: that.data.pageUrl,
          })
        } else {
          that.setData({
            showBindUserInfo: true,
          })
        }
      }, (error) => {
        console.log(error)
      });
    } else {
      that.setData({
        showPhonepack: true
      })
      let wxDetailUserInfo = wx.getStorageSync("wxDetailUserInfo") || {}
      wxDetailUserInfo.wxPhoneNumber = ''
      wx.setStorageSync('wxDetailUserInfo', wxDetailUserInfo)
    }
  },
  //获取定位信息列表
  getLocation() {
    let that = this
    let wxDetailUserInfo = wx.getStorageSync("wxDetailUserInfo") || {}
    let position = wx.getStorageSync("cityPromise")
    wxDetailUserInfo.nowPosition = position.positionCity
    wx.setStorageSync('wxDetailUserInfo', wxDetailUserInfo)
  },

  //取消授权窗
  cancelTip() {
    this.setData({
      showBgpack: false,
      showPhonepack: false
    })
  },
  //绑定用户信息弹窗按钮
  visibleOk() {
    wx.navigateTo({
      url: "../bindUser/bindUser"
    })
  },
  visibleOkClose() {
    this.setData({
      showBindUserInfo: false
    })
  },
  //滑动事件
  notouch() {
    return
  }
})