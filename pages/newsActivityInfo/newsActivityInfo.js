// pages/newsActivityInfo/newsActivityInfo.js
let WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import util from '../../utils/util.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    newsAtvInfo: null, //新闻活动数据项
    type: 0, //默认项目为新闻
    newsActivityId: '', //活动id
    btnType: 0, //按钮样式 0：活动报名，1：已报名，2：活动未开始，3：活动已结束
    showBindUserInfo: false, //是否显示绑定信息弹窗
    settingsEnroll: 0, //是否允许报名
    hideBtn: false, //默认显示报名按钮
    webHref: '', //新闻链接路径
    isWebClick: false, //超链接点击
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    if (options.hideBtn) {
      this.setData({
        hideBtn: true,
      })
    }
    let that = this
    this.setData({
      newsActivityId: options.atvid,
      type: options.type
    })
    if (options.type == "0") {
      wx.setNavigationBarTitle({
        title: '新闻详情'
      })
      that.findNewsActivityById()
    } else if (options.type == "1") {
      wx.setNavigationBarTitle({
        title: '活动详情'
      })
      that.findMyEnrollActivityById()
    }

  },
  //获取新闻活动详情
  findNewsActivityById() {
    let promise = {
      id: this.data.newsActivityId
    }
    if (this.data.type == "0") {
      promise.visitor_flag = "1"
    }
    $http(apiSetting.newsactivityFindNewsActivityById, promise).then((data) => {
      if (!data.data) {
        wx.hideLoading()
        return
      }
      let newsAtvItem = data.data
      if (newsAtvItem.type == 0) {
        if (newsAtvItem.published_date && newsAtvItem.published_date.indexOf(' ') != -1) {
          newsAtvItem.published_date = newsAtvItem.published_date.split(' ')[0]
        }
      } else if (newsAtvItem.type == 1) {
        if (newsAtvItem.start_date && newsAtvItem.start_date.indexOf(' ') != -1) {
          newsAtvItem.start_date = newsAtvItem.start_date.split(' ')[0]
        }
        if (newsAtvItem.end_date && newsAtvItem.end_date.indexOf(' ') != -1) {
          newsAtvItem.end_date = newsAtvItem.end_date.split(' ')[0]
        }

        let month = 0
        let day = 0
        if (new Date().getMonth() + 1 < 10) {
          month = "0" + Number(new Date().getMonth() + 1)
        } else {
          month = new Date().getMonth() + 1
        }
        if (new Date().getDate() < 10) {
          day = "0" + Number(new Date().getDate())
        } else {
          day = new Date().getDate()
        }

        let nowDate = new Date().getFullYear() + '-' + month + '-' + day
        nowDate = new Date(nowDate).getTime() //当前网络时间

        let activityEndTime = new Date(newsAtvItem.end_date).getTime() //活动结束时间
        if (newsAtvItem.settings_enroll_startTime && newsAtvItem.settings_enroll_startTime.indexOf(' ') != -1) {
          newsAtvItem.settings_enroll_startTime = newsAtvItem.settings_enroll_startTime.split(' ')[0]
        }
        if (newsAtvItem.settings_enroll_endTime && newsAtvItem.settings_enroll_endTime.indexOf(' ') != -1) {
          newsAtvItem.settings_enroll_endTime = newsAtvItem.settings_enroll_endTime.split(' ')[0]
        }
        let startTime = new Date(newsAtvItem.settings_enroll_startTime).getTime() //报名开始时间
        let endTime = new Date(newsAtvItem.settings_enroll_endTime).getTime() //报名结束时间

        //按钮样式 0：活动报名，1：已报名，2：报名未开始，3：报名已结束，4：活动已结束，5.名额满了
        //startTime：报名开始时间，endTime：报名结束时间，activityEndTime：活动结束时间，nowDate：当前时间
        //1.如果活动结束时间小于当前时间，活动结束；否则去判断是否已报名
        //2.如果已报名，显示已报名；如果没报名，去判断报名名额是否满了
        //3.如果报名名额满了，提示，报名人数已满；否则判断开始时间
        //4.如果报名开始时间大于当前报名时间，提示报名未开始；否则报名开始，去判断报名结束时间
        //5.如果报名结束时间小于当前时间，报名结束；否则可以报名（默认）

        //如果报名人数和限额为空或者，转化后不是纯数字，则将人数初始化为0
        if (!newsAtvItem.enroll_num || isNaN(Number(newsAtvItem.enroll_num))) {
          newsAtvItem.enroll_num = 0
        }
        if (!newsAtvItem.settings_enroll_number || isNaN(Number(newsAtvItem.settings_enroll_number))) {
          newsAtvItem.settings_enroll_number = 0
        }

        if (activityEndTime <= nowDate) {
          if (this.data.btnType !== 1) {
            this.setData({
              btnType: 4
            })
          }
        } else { //活动没结束，判断是否已报名
          if (this.data.btnType !== 1) { //如果活动没报名，判断是否能报名
            if (startTime > nowDate) { //报名开始时间>当前时间，提示报名没开始,否则报名开始
              this.setData({
                btnType: 2
              })
            } else {
              if (endTime < nowDate) { //如果报名结束时间小于当前时间，报名结束
                this.setData({
                  btnType: 3
                })
              }
            }
          }
        }
      }
      
      this.setData({
        newsAtvInfo: newsAtvItem,
        settingsEnroll: newsAtvItem.settings_enroll
      })
      let article = newsAtvItem.content
      
      WxParse.wxParse('article', 'html', article, this, 5);
      wx.hideLoading()
    }, (error) => {
      wx.hideLoading()
      console.log(error)
    });
  },

  //超链接解析点击事件
  wxParseTagATap: function(e) {
    //url地址转码，防止网址出现中文后ios解析不出来显示白屏的问题
    let href = e.currentTarget.dataset.src
    if (href.search('https://') == -1) {
      if (href.search('http://') == -1) {
        href = 'https://' + href
      }
    }
    href = encodeURIComponent(href)
    wx.navigateTo({
      url: '../webView/webView?search=' + href + "&type=" + this.data.type,
    })
  },

  //查询是否已经报名
  findMyEnrollActivityById() {
    let promise = {
      id: this.data.newsActivityId,
      userId: app.globalData.userId
    }
    $http(apiSetting.newsactivityFindMyEnrollActivityById, promise).then((data) => {
      if (data.list != null) {
        this.setData({
          btnType: 1
        })
      }
      this.findNewsActivityById()
    }, (error) => {
      console.log(error)
    });
  },

  //活动报名
  bindSub: util.throttle(function() {
    if (this.data.btnType == 1) return
    if (!app.globalData.isCheck) {
      this.setData({
        showBindUserInfo: true
      })
      return
    }
    //按钮样式 0：活动报名，1：已报名，2：报名未开始，3：报名已结束，4：活动已结束，5.名额满了
    let btnType = this.data.btnType
    if (btnType == 2) {
      wx.showModal({
        title: '报名未开始!',
        confirmText: '关闭',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            return
          }
        }
      })
      return
    } else if (btnType == 3) {
      wx.showModal({
        title: '报名已结束!',
        confirmText: '关闭',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            return
          }
        }
      })
      return
    } else if (btnType == 4) {
      wx.showModal({
        title: '活动已结束!',
        confirmText: '关闭',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            return
          }
        }
      })
      return
    } else if (btnType == 5) {
      wx.showModal({
        title: '活动报名名额已满!',
        confirmText: '关闭',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            return
          }
        }
      })
      return
    }

    let promise = {
      id: this.data.newsActivityId,
      user_id: app.globalData.userId
    }
    $http(apiSetting.newsactivityInsertActivityEnrollee, promise).then((data) => {
      if (data.code == 0) {
        this.setData({
          btnType: 1,
        })
        this.findMyEnrollActivityById()
        wx.showModal({
          title: '报名成功',
          confirmText: '我的报名',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../myApply/myApply',
              })
            } else if (res.cancel) {
              return
            }
          }
        })
      } else if (data.code == -1) {
        this.setData({
          btnType: 5
        })
        wx.showModal({
          title: '报名失败' + data.message + "!",
          confirmText: '关闭',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              return
            }
          }
        })
      }
    }, (error) => {
      this.setData({
        btnType: 0
      })
      console.log(error)
    });
  }, 1500),


  //取消授权窗
  cancelTip() {
    this.setData({
      showBgpack: false,
      showPhonepack: false,
    })
  },
  //绑定用户信息弹窗按钮
  visibleOk() {
    wx.navigateTo({
      url: "../bindUser/bindUser"
    })
    let boomScreen_ids = app.globalData.boomScreen_ids
    let storLocalCity = app.globalData.storLocalCity
    for (let i = 0; i < boomScreen_ids.length; i++) {
      if (storLocalCity.id == boomScreen_ids[i].boomScreen_history_id) {
        boomScreen_ids.splice(i, 1)
      }
    }
    app.globalData.boomScreen_ids = boomScreen_ids
    this.setData({
      isBannerClick: false
    })
  },
  visibleOkClose() {
    this.setData({
      showBindUserInfo: false,
      isBannerClick: false
    })
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
    this.setData({
      webHref: '',
      isWebClick: false
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})