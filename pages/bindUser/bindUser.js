// pages/bindUser/bindUser.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import util from '../../utils/util.js'
import validationUtils from '../../utils/validationUtils.js'

const {
  $Message
} = require('../../dist/base/index');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false, //是否修改
    // 用户信息参数
    userInfo: {
      agencyAccount: '',
      agencyUid: '',
      brokertype: '',
      channelCode: '',
      idno: '',
      myName: '',
      phone: '',
      sex: '未知',
      wxid: '',
      phoneFlag: '+86',
      identyCityName: '',
      identyCity: ''
    },
    mobileFlag: '+86',
    trench: '', //留电渠道
    showAgencyAccount: '', //中介账户
    //渠道验证码失败
    showTipCode: {
      code: 0,
      message: ''
    },
    noteCodeVisible: false, // 验证码窗
    noteCodeVal: null,
    noteCodeValLeng: 4,
    modalPhone: null,
    noteResult: false, // 验证是否成功
    array: [],
    arrayIndex: null,

    setInter: '', // 存放计时器
    downTime: 180, // 验证倒计时
    isnote: true,
    onHideTime: null, // 记录切换后台时间
    gender: null,

    // 区号：+86(港:+852,澳:+853,台:+886)
    phoneHeaderArray: [{
      city: '大陆',
      mobileFlag: '+86'
    },
    {
      city: '香港',
      mobileFlag: '+852'
    },
    {
      city: '澳门',
      mobileFlag: '+853'
    },
    {
      city: '台湾',
      mobileFlag: '+886'
    }
    ],
    numberMaxLength: 11, //电话号最大长度
    numberIndex: 0, //客户电话区号选择默认下标   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(app.globalData.bsindUserInfo)
    this.getProjectApiFindOtherDictValues();
    let wxDetailUserInfo = wx.getStorageSync("wxDetailUserInfo") || {}
    let  wxPhoneNumber="";
    if (wxDetailUserInfo.wxPhoneNumber){
      if (wxDetailUserInfo.wxPhoneNumber.length==11){
        wxPhoneNumber = wxDetailUserInfo.wxPhoneNumber.substr(0, 3) + "****" + wxDetailUserInfo.wxPhoneNumber.substr(7);
      } else if (wxDetailUserInfo.wxPhoneNumber.length == 8){
        wxPhoneNumber = wxDetailUserInfo.wxPhoneNumber.substr(0, 2) + "****" + wxDetailUserInfo.wxPhoneNumber.substr(6);
      }else{
        wxPhoneNumber = wxDetailUserInfo.wxPhoneNumber.substr(0, 3) + "****" + wxDetailUserInfo.wxPhoneNumber.substr(7);
      }
    }
   this.setData({
     "userInfo.phone": wxPhoneNumber,
     "modalPhone": wxPhoneNumber,
     'userInfo.identyCityName': app.globalData.bindUserInfo.identyCityName
   });
    this.data.userInfo.phone=wxDetailUserInfo.wxPhoneNumber
    if (app.globalData.isCheck) {
      // 经纪人账号
      this.data.userInfo.agencyAccount = app.globalData.bindUserInfo.agencyAccount
      // 经纪人uid
      this.data.userInfo.agencyUid = app.globalData.bindUserInfo.agencyHaikeUid
      this.data.userInfo.brokertype = app.globalData.bindUserInfo.brokertype
      // 渠道验证码
      this.data.userInfo.channelCode = app.globalData.bindUserInfo.agencyMobile
      // 身份证号
      this.data.userInfo.idno = app.globalData.bindUserInfo.idno
      this.data.userInfo.myName = app.globalData.bindUserInfo.myname
      this.data.userInfo.phone = app.globalData.bindUserInfo.phone
      this.data.userInfo.sex = app.globalData.bindUserInfo.sex
      this.data.userInfo.wxid = app.globalData.bindUserInfo.wxid
      // 绑定城市中文名
      this.data.userInfo.identyCityName = app.globalData.bindUserInfo.identyCityName;
      // 绑定城市key
      this.data.userInfo.identyCity = app.globalData.bindUserInfo.identyCity;

      for (let i = 0; i < this.data.phoneHeaderArray.length; i++) {
        if (this.data.phoneHeaderArray[i].mobileFlag == app.globalData.bindUserInfo.phoneFlag) {
          this.setData({
            numberIndex: i,
            'userInfo.phoneFlag': this.data.phoneHeaderArray[i].mobileFlag,
            mobileFlag: this.data.phoneHeaderArray[i].mobileFlag
          })
          break
        }
      }
      // { { phoneHeaderArray[numberIndex].mobileFlag } }
      // let findIndex = this.data.array.findIndex((n) => {
      //   return n.name == app.globalData.bindUserInfo.brokertype
      // })
      if (app.globalData.bindUserInfo.brokertype == '中介') {
        this.getUserGetHaikeAgencyInfo(app.globalData.bindUserInfo.agencyMobile)
      }

      this.setData({
        userInfo: this.data.userInfo,
        gender: this.data.userInfo.sex,
        isEdit: false,
        showAgencyAccount: app.globalData.bindUserInfo.agencyAccount,
        modalPhone: app.globalData.bindUserInfo.phone
      })
    } else {
      this.data.userInfo.wxid = app.globalData.openid
      this.setData({
        gender: this.data.userInfo.sex,
        isEdit: true
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
    if (!this.data.isnote) {
      let diff = Math.round(new Date().getTime() / 1000) - this.data.onHideTime
      this.data.downTime = this.data.downTime - diff
    };

    if (app.globalData.bindCity.City != undefined) {
      this.data.userInfo.identyCityName = app.globalData.bindCity.City.city;
      this.data.userInfo.identyCity = app.globalData.bindCity.City.id;
      this.setData({
        userInfo: this.data.userInfo
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.onHideTime = Math.round(new Date().getTime() / 1000)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.endSetInter()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  bindPickerChange(e) {
    this.setData({
      arrayIndex: e.detail.value
    })
    this.data.userInfo.brokertype = this.data.array[e.detail.value]
  },

  // 获取验证码
  getNoteCode() {
    if (this.data.userInfo.phone == '') {
      $Message({
        content: '请输入手机号',
        type: 'warning'
      });
      return
    }
    wx.showLoading({
      title: '正在发送',
    })
    let that = this
    let promise1 = {
      mobile: that.data.userInfo.phone,
      openid: app.globalData.openid,
      mobileFlag: that.data.mobileFlag
    }
    if (promise1.openid == null) {
      wx.login({
        success: res => {
          let promise = {
            code: res.code
          }

          $http(apiSetting.userDecodeUserInfo, promise).then((data) => {
            app.globalData.openid = data.data.openid
            this.getNoteCode()
          }, (error) => {
            console.log(error)
          });
        }
      })
    } else {
      let cityPromise = wx.getStorageSync("cityPromise")
      promise1.currentCity = cityPromise.currentCity
      promise1.positionCity = cityPromise.positionCity
      $http(apiSetting.userGetCode, promise1).then((data) => {
        wx.hideLoading()
        if (data.code == 0) {
          // 开启计时器
          that.data.setInter = setInterval(function () {
            that.data.downTime = that.data.downTime - 1
            if (that.data.downTime <= 0) {
              that.endSetInter()
              that.setData({
                isnote: true,
                downTime: 180
              })
            }
            that.setData({
              downTime: that.data.downTime
            })
          }, 1000)
          that.setData({
            isnote: false,
            noteCodeVisible: true
          })
        } else {
          $Message({
            content: data.message,
            type: 'error'
          });
        }
      }, (error) => {
        // console.log(error)
        wx.hideLoading()
      });
    }
  },

  // 显示验证窗口
  noteCodeModalShow() {
    this.setData({
      noteCodeVisible: true
    })
  },

  noteCodeModalOk() {
    let that = this
    let promise = {
      mobile: that.data.userInfo.phone,
      code: this.data.noteCodeVal,
      openid: app.globalData.openid
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.userCheckSMSCode, promise).then((data) => {
      if (data.code == 0) {
        $Message({
          content: '验证成功',
          type: 'success'
        });
        that.setData({
          noteCodeVisible: false,
          noteResult: true
        })
      } else {

      }
    })
  },

  noteCodeModalClose(e) {
    this.setData({
      noteCodeVal: '',
      noteCodeVisible: false
    })
  },

  // 性别选择
  genderChange(e) {
    let val = e.target.dataset.val
    this.data.userInfo.sex = val
    this.setData({
      gender: val
    })
  },

  myNameBind(e) {
    this.data.userInfo.myName = e.detail.value
  },
  phoneBind(e) {
    this.setData({
      modalPhone: e.detail.value
    })
    this.data.userInfo.phone = e.detail.value
  },
  //身份证
  idnoBind(e) {
    this.data.userInfo.idno =e.detail.value
  },


 
  //跳转选择绑定页面
  cityBind(e) {
    if (this.data.isEdit) {
      wx.navigateTo({
        url: '../bindcity/bindcity'
      })
    }

  },
  channelCodeBind(e) {
    let val = e.detail.value
    this.data.userInfo.channelCode = e.detail.value
    if (val.length >= 11) {
      this.getUserGetHaikeAgencyInfo(val)
    }
  },
  // agencyAccountBind(e) {
  //   this.data.userInfo.agencyAccount = e.detail.value
  // },
  // 验证码输入
  inpBind(e) {
    this.setData({
      noteCodeVal: e.detail.value
    })
  },

  endSetInter() {
    var that = this;
    //清除计时器  即清除setInter
    clearInterval(that.data.setInter)
  },

  // 获取经纪人类型
  getProjectApiFindOtherDictValues(val) {
    let that = this
    let promise = {
      dictname: '经纪人类型'
    }
    $http(apiSetting.projectApiFindOtherDictValues, promise).then((data) => {
      if (app.globalData.isCheck) {
        let findIndex = data.data.findIndex((n) => {
          return n == app.globalData.bindUserInfo.brokertype
        })
        that.setData({
          arrayIndex: findIndex
        })
      }
      that.setData({
        array: data.data
      })
    })
  },

  // 获取海客中介用户
  getUserGetHaikeAgencyInfo(val) {
    let that = this
    let promise = {
      channelCode: val,
      openid: app.globalData.openid
    }
    that.setData({
      showAgencyAccount: '',
      trench: '',
      'showTipCode.code': 0,
      'showTipCode.message': '',
    })

    $http(apiSetting.userGetHaikeAgencyInfo, promise).then((data) => {
      if (data.code == 0) {
        that.data.userInfo.agencyAccount = data.data.agencyAccount
        that.data.userInfo.agencyUid = data.data.agencyUid
        that.setData({
          showAgencyAccount: data.data.agencyAccount,
          trench: data.data.channels[0].name
        })
      }
      if (data.code == -1) {
        $Message({
          content: data.message,
          type: 'warning'
        });
        that.setData({
          'showTipCode.code': data.code,
          'showTipCode.message': data.message
        })
      }
    })
  },

  // 用户信息提交
  bindSub() {
    // 是否填写姓名
    if (this.data.userInfo.myName == '') {
      $Message({
        content: '请输入姓名',
        type: 'warning'
      });
      return
    }

    // 短信是否验证通过
    // if (!this.data.noteResult) {
    //   $Message({
    //     content: '请进行短信验证',
    //     type: 'warning'
    //   });
    //   return
    // }

    // 是否选择经济人类型
    if (this.data.arrayIndex == null) {
      $Message({
        content: '请选择经济人类型',
        type: 'warning'
      });
      return
    }

    if (this.data.arrayIndex == 1) {
      if (this.data.userInfo.idno == "") {
        $Message({
          content: '请输入身份证号',
          type: 'warning'
        });
        return
      };
    }
    //禁止输入表情
    if (this.data.userInfo.idno != ""){
      
      let idnoVaidation ="",idnoOne="",idnoTwo="";
      idnoOne = validationUtils.emojiReplace(this.data.userInfo.idno);
      if (idnoOne){
        idnoTwo = validationUtils.checkZhReplace(idnoOne);
      };
      if (idnoOne || idnoTwo) {
        $Message({
          content: '身份证号不能包含表情字符和中文',
          type: 'warning'
        });
        return
      }
    }

    if (this.data.arrayIndex == 2) {
      if (this.data.userInfo.showAgencyAccount == "") {
        $Message({
          content: '请正确填写渠道验证码',
          type: 'warning'
        });
        return
      }
    }
    // if (this.data.userInfo.idno) {
    //   let idno = this.data.userInfo.idno
    //   if (idno.length !== 15 && idno.length !== 18) {
    //     $Message({
    //       content: '请正确填写身份证号',
    //       type: 'warning'
    //     });
    //     return
    //   }
    // }
    if (this.data.arrayIndex == 2 && this.data.showTipCode.code !== 0) {
      wx.showModal({
        title: '修改失败',
        content: '后台' + this.data.showTipCode.message,
        showCancel: false,
        confirmText: "关闭",
        success: function () { }
      })
      return
    }

    let that = this
    let promise = this.data.userInfo
    if (this.data.userInfo.sex != "男" && this.data.userInfo.sex != "女") {
      promise.sex = '未知'
    }
    wx.showLoading()
    $http(apiSetting.userIdentifyUser, promise).then((data) => {
      if (data.code == 0) {
        that.getUserGetUserInfo(app.globalData.openid)
      } else {
        $Message({
          content: data.message,
          type: 'error'
        });
        wx.hideLoading()
      }
    })
  },


  // 修改
  amendSub() {
    this.setData({
      isEdit: true
    })
  },

  // 获取绑定用户信息
  getUserGetUserInfo(val) {
    let that = this
    $http(apiSetting.userGetUserInfo, {
      openid: val
    }).then((data) => {
      if (data.data.ischeck == 0) {
        app.globalData.ischeck = true
      }
      wx.hideLoading()
      app.globalData.bindUserInfo = data.data
      wx.reLaunch({
        url: '../index/index?ifChange=' + 1
      })
    })
  },

  //电话地区选择
  bindPickerNumberChange(e) {
    if (this.data.numberIndex == e.detail.value) return
    this.setData({
      numberIndex: e.detail.value,
      'userInfo.phoneFlag': this.data.phoneHeaderArray[e.detail.value].mobileFlag,
      'userInfo.phone': '',
      mobileFlag: this.data.phoneHeaderArray[e.detail.value].mobileFlag
    })
    if (e.detail.value == 0) {
      this.setData({
        numberMaxLength: 11
      })
    } else if (e.detail.value == 1) {
      this.setData({
        numberMaxLength: 8
      })
    } else if (e.detail.value == 2) {
      this.setData({
        numberMaxLength: 8
      })
    } else if (e.detail.value == 3) {
      this.setData({
        numberMaxLength: 10
      })
    }
  },

})