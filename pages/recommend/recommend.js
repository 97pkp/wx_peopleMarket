// pages/recommend/recommend.js
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
const {
  $Message
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPicker:false,         //是否显示picker
    subDisabled:false,        //是否推荐成功
    placeholderText: '请输入客户相关描述，如意向户型、面积等',    //placeholder文本提示
    isCitySelect: false,      // 是否选择城市
    visible: false,           //是否显示绑定用户信息模态窗
    visible2: false,          //确认推荐模态窗
    showBgpack: false,        //是否显示授权窗口
    phoneText:'',

    successProjectArr:[],     //推荐成功的项目id
    errorProjectArr:[],       //未推荐成功项目
    recommentStr: '',         //推荐项目名

    // 请求参数列表
    reportList: {
      city: '',
      customName: '',
      customPhone: '',
      hkProjectId: '',
      mobileFlag: '+86', 
      openId: '',
      projectId: '',
      remark: '',
      reportMobile: '',
      reportName: '',
      reportType: '',
      sex: ''
    },
    city_id: '',      //城市id
    gender: 1,        //性别
    arrayProject: [], 
    arrayProjectIndex: null,
    phoneTypeIndex: 0,     //隐号全号默认选择下标
    index: 0,            //客户电话区号选择默认下标   
    arrayNum: ["隐号", "全号"],   //隐号/全号选择 
    referType:'全号',
    // 区号：+86(港:+852,澳:+853,台:+886)
    array:[
      { city: '大陆', mobileFlag:'+86'},
      { city: '香港', mobileFlag: '+852'},
      { city: '澳门', mobileFlag: '+853' },
      { city: '台湾', mobileFlag: '+886' }
    ],
  },

  // 获取微信用户信息
  onGotUserInfo(e) {
    wx.showTabBar()
    if (!e.detail.userInfo) {
      return
    }
    wx.setStorageSync('wxUserInfo', e.detail.userInfo)
    let promise = { openID: app.globalData.openid, wxname: e.detail.userInfo.nickName}
    $http(apiSetting.userUpdateUserInfo, promise).then((data) => {
      
    }, (error) => {
      console.log(error)
    });
    this.setData({
      showBgpack: false
    })
  },
  //取消授权窗
  cancelTip(){
    this.setData({ showBgpack:false})
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    //用户信息授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.hideTabBar()
          if (that.data.visible){
            return
          }
          that.setData({
            showBgpack: true
          })
        }
      }
    })
   
    if (app.globalData.isCheck) {
      let reportList = that.data.reportList
      reportList.openId = app.globalData.bindUserInfo.wxid
      reportList.reportMobile = app.globalData.bindUserInfo.phone
      reportList.reportName = app.globalData.bindUserInfo.myname
      reportList.reportType = app.globalData.bindUserInfo.brokertype
      reportList.sex = '男'
      that.setData({
        reportList: reportList
      })
      if (app.globalData.bindUserInfo.brokertype!="中介"){
        this.setData({ phoneTypeIndex:1})
      }
    } else {
      that.setData({
        visible: true,
        placeholderText: ''
      })
    }
    //判断是否有传递的项目id，如果有，直接复制给data中的变量，即详情页的跳转
    if (options.project_id) {
      this.setData({
        'reportList.projectId': options.project_id,
      })
      this.getCityInfo(options.project_id);
    } else {
      this.getRecommendGetProjectList()
    }
  },

  onShow: function() {
    //判断是否是从选择城市进入
    if (this.data.isCitySelect) {
      if (app.globalData.transienceCity.id) {
        this.data.city_id = app.globalData.transienceCity.id
        this.setData({
          'city_id': app.globalData.transienceCity.id,
          'reportList.city': app.globalData.transienceCity.city,
          'reportList.projectId': '',
          'arrayProjectIndex': null
        })
        this.getRecommendGetProjectList()
      }
    }
  },

  customNameBind(e) {
    this.data.reportList.customName = e.detail.value
  },
  customPhoneBind(e) {
    let phone=e.detail.value
    phone = phone.replace(/[^0-9|\*]/g, "")
    if (this.data.phoneTypeIndex == 0){
      if (this.data.index == 0) {
        var reg= /^(\d{3})\d{4}(\d{4})$/g;
        phone = phone.replace(reg, "$1****$2");
        console.log(phone)
      } else if (this.data.index == 1) {
        var reg = /(\d{2})\d{4}(\d{1})/g;
        phone = phone.replace(reg, "$1****");
      } else if (this.data.index == 2) {
        var reg = /(\d{3})\d{4}(\d{1})/g;
        phone = phone.replace(reg, "$1****");
      } else if (this.data.index == 3) {
        var reg = /(\d{2})\d{4}(\d{4})/g;
        phone = phone.replace(reg, "$1****$2");
      }
    }
    phone = phone.replace(/\s*/g, "")
    this.setData({ 'reportList.customPhone': phone, phoneText: phone})
  },
  remarkBind(e) {
    this.data.reportList.remark = e.detail.value
  },
  genderChange(e) {
    let val = e.target.dataset.val
    if (val == 1) {
      this.data.reportList.sex = '男'
    } else {
      this.data.reportList.sex = '女'
    }
    this.setData({
      gender: val
    })
  },
  //电话地区选择
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value,
      'reportList.mobileFlag': this.data.array[e.detail.value].mobileFlag
    })
  },
  //隐号全号选择
  bindPickerChangePhoneType(e){
    if (this.data.phoneTypeIndex == e.detail.value) return
    this.setData({
      successProjectArr: [],
      errorProjectArr: [],
      recommentStr: '',
      phoneTypeIndex: e.detail.value,
      phoneText:''
    })
    this.getRecommendGetProjectList()
  },

  // 城市选择
  citySelcet() {
    this.data.isCitySelect = true
    wx.navigateTo({
      url: '../citySelect/citySelect?city_id=' + this.data.city_id
    })
  },

  //详情(id)-->推荐，获取城市信息
  getCityInfo(id) {
    let promise = {
      project_id: id
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.projectApiFindProjectInfoById, promise).then((data) => {
      let projectInfo = data.data
      this.setData({
        'reportList.city': projectInfo.city_text,
        city_id: projectInfo.city
      })
      this.getRecommendGetProjectList()
    }, (error) => {
      console.log(error)
    });
  },
  // 获取推荐楼盘
  getRecommendGetProjectList() {
    let that = this
    if (!this.data.city_id) {
      let cityInfo = wx.getStorageSync('storLocalCity')
      if (!cityInfo) return           
      this.setData({
        'reportList.city': cityInfo.city,
        city_id: cityInfo.id
      })
    }
    let promise = {
      cityId: this.data.city_id,
      openid:app.globalData.bindUserInfo.wxid,
      refer_type: this.data.arrayNum[this.data.phoneTypeIndex]
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    //获取楼盘列表
    $http(apiSetting.recommendGetProjectList, promise).then((data) => {
      if (that.data.reportList.projectId) {
        let findI = data.data.findIndex((n) => {
          return n.wxProjectId == that.data.reportList.projectId
        })
        for (let i = 0; i < data.data.length; i++) {
          if (i == findI){
            data.data[i].isSel=true
            this.setData({ recommentStr: data.data[i].wxProjectName})
          }else{
            data.data[i].isSel = false
          }
        }
        that.setData({
          arrayProject: data.data,
          arrayProjectIndex: findI
        })
      } else {
        for(let i=0;i<data.data.length;i++){
          data.data[i].isSel = false
        }
        this.setData({
          arrayProject: data.data
        })
      }
    }, (error) => {
      console.log(error)
    })
  },

  //选择推荐楼盘列表
  arrayProjectChange(e) {
    this.setData({
      arrayProjectIndex: e.detail.value
    })
    this.data.reportList.projectId = this.data.arrayProject[e.detail.value].wxProjectId
  },

  visibleOk() {
    wx.navigateTo({
      url: "../bindUser/bindUser"
    })
  },

  visibleOkClose() {
    wx.reLaunch({
      url: "../index/index"
    })
  },
  //确认推荐
  bindSub() {
    let that=this
    if (this.data.reportList.customName == "") {
      $Message({
        content: '请输入客户姓名',
        type: 'warning'
      });
      return
    }
    if (this.data.reportList.customPhone == "") {
      $Message({
        content: '请输入客户电话',
        type: 'warning'
      });
      return
    }
    if (this.data.reportList.projectId == "") {
      $Message({
        content: '请选择推荐楼盘',
        type: 'warning'
      });
      return
    }
    let promise = this.data.reportList
    promise.referType = this.data.arrayNum[this.data.phoneTypeIndex]
    this.setData({
      subDisabled: true
    })
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.recommendAddAgencyCustom, promise).then((data) => {
      if (!data.code) {
        let successProjectId = data.data.successProjectId
        let errorProjectId = data.data.errorProjectId
        console.log(successProjectId, errorProjectId)
        let arrayProject = that.data.arrayProject
        let successArr=[]
        let errorArr = []   
        for (let i = 0; i < arrayProject.length;i++){
          for (let j = 0; j < errorProjectId.length;j++){
            if (arrayProject[i].wxProjectId == errorProjectId[j]){
              errorArr.push(arrayProject[i].wxProjectName)
            }
          }
          for (let k = 0; k < successProjectId.length; k++) {
            if (arrayProject[i].wxProjectId == successProjectId[k]) {
              successArr.push(arrayProject[i].wxProjectName)
            }
          }
        }   
       
        this.setData({
          successProjectArr: successArr,
          errorProjectArr: errorArr,
          visible2: true,
          placeholderText: '',
        })
      }else {
        $Message({
          content: data.message,
          type: 'warning'
        });
        this.setData({
          subDisabled: false,
          visible2: true,
          'errorProjectArr[0]': this.data.recommentStr
        })
      }
    }, (error) => {
      console.log(error)
    });
  },

  //确认模态窗
  handleCloseOk() {
    wx.navigateTo({
      url: '../clients/client'
    })
    this.setData({
      visible2: false,
      placeholderText: '请输入客户相关描述，如意向户型、面积等'
    });
  },
  handleCloseNo() {
    wx.reLaunch({
      url: '../index/index'
    })
    this.setData({
      visible2: false,
      placeholderText: '请输入客户相关描述，如意向户型、面积等'
    });
  },
  //弹出复选楼盘picker
  setProject(){
    this.setData({ showPicker: true})
  },
  //选择项目
  selTheItem(e){
    let index=e.currentTarget.dataset.index
    let _arrayProjectItem = "arrayProject[" + index + "].isSel"
    this.setData({ [_arrayProjectItem]: !this.data.arrayProject[index].isSel})
  },
  //隐藏picker
  cancelPicker(e){
    let type=e.target.dataset.type
    if(type=='1'){
      let arrayProject = this.data.arrayProject
      let str = ''
      let strId=''
      for (let i = 0; i < arrayProject.length; i++) {
        if (arrayProject[i].isSel){
          str += arrayProject[i].wxProjectName
          str+="，"
          strId += arrayProject[i].wxProjectId
          strId += ","
        }
      }
      str=str.substring(0,str.length-1)
      strId = strId.substring(0, strId.length - 1)
      this.setData({ recommentStr:str})
      this.setData({ 'reportList.projectId': strId})
      this.setData({ showPicker: false })
    }else if(type=='0'){
      let arrayProject = this.data.arrayProject
      for (let i = 0; i < arrayProject.length;i++){
        arrayProject[i].isSel=false
      }
      this.setData({ recommentStr:''})
      this.setData({ arrayProject: arrayProject})
      this.setData({ showPicker: false })
    }
  },
})