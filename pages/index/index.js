//index.js
//获取应用实例
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import fileUrl from '../../http/fileServeUrl.js'
import mapKey from '../../http/mapKey.js'
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const wxMap = new QQMapWX({
  key: mapKey
});
let ifChange;
const {
  $Message
} = require('../../dist/base/index');
Page({
  data: {
    defaultImg:'../../images/defaultImg.png',     //默认图才能相对路径
    isLoading:false,    //是否加载数据中
    // showBgpack: false,    // 授权窗口
    isHaveCoupon: true, // 是否显示优惠券
    isPermit: false,    // 是否有使用权限
    imgpath: fileUrl,   
    cityNametext: '',
    imgUrls: [],        //轮播图数组
    autoplay: true,
    interval: 5000,
    duration: 1000,
    swiperCurrent: 0,   //轮播图下标
    
    // 查询城市参数
    cityInfo: {
      latitude: '',
      longitude: '',
      cityName: ''
    },
    //楼盘信息列表
    buildinfolist: [],
    //楼盘信息标签列表
    buildinfotaglist: [],
    // 楼盘信息图片
    buildinfoimg: '',
    //周边楼盘信息列表
    rimbuildinfolist: [],
    //周边楼盘信息标签列表
    rimbuildinfotaglist: [],
    // 周边翻页
    rimBuildPage: {
      page: 1,
      perpage: 10,
      isPage: true
    },
    rimbuildinfoimg: '',    // 周边楼盘信息图片
  },
  // 切换城市
  changeCity() {
    wx.navigateTo({
      url: '../cityList/cityList'
    })
  },
  // 切换banner图
  changeImg(e) {
    this.setData({
      swiperCurrent: e.currentTarget.dataset.index
    })
  },
  swiperChange(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  //跳转详情页
  goInformation(e) {
    let project_id = e.currentTarget.dataset.project_id
    // let imgurl = e.currentTarget.dataset.imgurl
    wx.navigateTo({
      url: '../information/information?project_id=' + project_id   //+ '&&imgurl=' + imgurl
    })
  },

  onLoad: function(option) {
    ifChange = option.ifChange;
    let that=this
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    that.setData({ rimbuildinfolist:[]})
    that.data.rimBuildPage.isPage=true
    that.setData({
      'rimBuildPage.page': 1,
      'rimBuildPage.perpage': 10,
      'rimBuildPage.isPage': true
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let promise = {
          code: res.code
        }
        
        let cityPromise = wx.getStorageSync("cityPromise")||[]
        promise.currentCity = cityPromise.currentCity
        promise.positionCity = cityPromise.positionCity
        $http(apiSetting.userDecodeUserInfo, promise).then((data) => {
          console.log('openid:' + data.data.openid)
          console.log('status:' + data.data.status)
          app.globalData.token = data.data['vx-zhwx-token']
          app.globalData.openid = data.data.openid
          app.globalData.status = data.data.status
          app.globalData.sessionKey = data.data.sessionKey
          if (data.data.isCheck == 0) {
            app.globalData.isCheck = true
          } else {
            app.globalData.isCheck = false
          }
          if (data.data.status == 401) {
            that.setData({
              isPermit: true
            })
          }
          app.globalData.userId = data.data.USERID
          that.getUserGetUserInfo(data.data.openid)
          that.accreditOperate()
        }, (error) => {
          console.log(error)
        });
      }
    })
  },
  onShow:function(){
  
  },

  // 位置授权操作
  accreditOperate() {
    wx.showTabBar()
    // this.setData({
    //   showBgpack: false
    // })
    let that = this;
    // 判断本地是否有数据
    
    if (app.globalData.storLocalCity && ifChange === undefined) {
          that.getNowAddress()
      // that.data.cityInfo.cityName = app.globalData.storLocalCity.city
      // that.getCityFindBuildInfoByCity()
    }else if (app.globalData.storLocalCity && ifChange == '1'){
      that.data.cityInfo.cityName = app.globalData.storLocalCity.city
      that.getCityFindBuildInfoByCity()
    }else {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success(res) {
                that.getMapLocation();
              },
              fail(res) {
                that.getCityList()
              }
            })
          } else {
            that.getMapLocation();
          }
        },
        fail(res){
          console.log(res)
        }
      })
    }
  },

  // 获取位置
  getMapLocation() {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.data.cityInfo.latitude = res.latitude.toString()
        that.data.cityInfo.longitude = res.longitude.toString()
        //经纬度逆解析获取城市名
        wxMap.reverseGeocoder({
          location: {
            latitude: that.data.cityInfo.latitude,
            longitude: that.data.cityInfo.longitude
          },
          success: function (res) {
            let city = res.result.address_component
            let _storage = wx.getStorageSync('cityPromise') || {}
            _storage.positionCity = city.city
            
            _storage.currentCity = city.city
            wx.setStorageSync('cityPromise', _storage)
            //传入城市，判断是否有城市字典
            that.getCityList(city.city)
            // that.getCityFindBuildInfoByCity()
          },
          fail: function (res) {
            // that.getCityFindBuildInfoByCity()
            that.getCityList()
          }
        })
      },
      fail: function(res) {
        that.getCityList()
      },
      complete: function(res) {
        
      }
    })
  },
  //获取城市列表信息
  getCityList(city){
    let that=this
    let promise = {}
    let cityPromise = wx.getStorageSync("cityPromise")||[]
    
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.cityFindCityItems, promise).then((data) => {
      let cityList=data.data
      if(city){
        for (let i = 0; i < cityList.length; i++) {
          if (city.indexOf(cityList[i].city) !== -1) {
            wx.setStorageSync('storLocalCity', cityList[i])
            that.getCityFindBuildInfoByCity()
            return
          }
        }
      }
      if (that.data.cityInfo){
        that.setData({ 'cityInfo.cityName': cityList[0].city })
        wx.setStorageSync('storLocalCity', cityList[0])
        app.globalData.storLocalCity = cityList[0]
        let _storage = wx.getStorageSync('cityPromise') || {}
        
        _storage.currentCity = cityList[0].city
        wx.setStorageSync('cityPromise', _storage)
      }
      that.getCityFindBuildInfoByCity()
    }, (error) => {
      console.log(error)
      that.hideLoading()
    });
  },

  //获取缓存判断是否有该字段
  getSessionCityList(city){
    let that = this
    let promise = {}
    let cityPromise = wx.getStorageSync("cityPromise") || []
    
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.cityFindCityItems, promise).then((data) => {
      let cityList = data.data
      if (city) {
        for (let i = 0; i < cityList.length; i++) {
          if (city.indexOf(cityList[i].city) !== -1) {
            wx.showModal({
              title: '定位城市提示',
              content: '定位显示您当前的城市是"' + city +'",是否需要切换城市?',
              showCancel:true,
              cancelColor: '#999999',
              confirmColor: '#77C4FF',
              success(res) {
                if (res.confirm) {
                  wx.setStorageSync('storLocalCity', cityList[i])
                  that.setData({ 'cityInfo.cityName': cityList[i].city })
                  app.globalData.storLocalCity = cityList[i]
                  let _storage = wx.getStorageSync('cityPromise') || {}
                  
                  _storage.currentCity = cityList[i].city
                  wx.setStorageSync('cityPromise', _storage)
                  that.getCityFindBuildInfoByCity()
                  return
                } else if (res.cancel) {
                  wx.hideLoading()
                  return
                }
              }
            })
          }
        }
      };
      if (that.data.cityInfo.cityName) {
        
        that.setData({ 'cityInfo.cityName': cityList[0].city })
        wx.setStorageSync('storLocalCity', cityList[0])
        app.globalData.storLocalCity = cityList[0]
        let _storage = wx.getStorageSync('cityPromise') || {}
        
        _storage.currentCity = cityList[0].city
        wx.setStorageSync('cityPromise', _storage)
      }
      that.getCitySessionFindBuildInfoByCity()
    }, (error) => {
      console.log(error)
      that.hideLoading()
    });

  },
  //获取当前地址进行与缓存匹配
  getNowAddress(){
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.data.cityInfo.latitude = res.latitude.toString()
        that.data.cityInfo.longitude = res.longitude.toString()
        //经纬度逆解析获取城市名
        wxMap.reverseGeocoder({
          location: {
            latitude: that.data.cityInfo.latitude,
            longitude: that.data.cityInfo.longitude
          },
          success: function (res) {
            let city = res.result.address_component
            let _storage = wx.getStorageSync('cityPromise') || {}
            
            if (city.city != _storage.positionCity || city.city != _storage.currentCity){
              that.getSessionCityList(city.city)
            }else{
             that.getCityFindBuildInfoByCity()
            }
            // wx.setStorageSync('cityPromise', _storage)
            //传入城市，判断是否有城市字典
            // that.getCityList(city.city)
            // that.getCityFindBuildInfoByCity()
          },
          fail: function (res) {
            // that.getCityFindBuildInfoByCity()
            that.getCityList()
          }
        })
      },
      fail: function (res) {
        that.getCityList()
      },
      complete: function (res) {

      }
    })
  },

  getCitySessionFindBuildInfoByCity(){
    let that = this
    let promise = that.data.cityInfo
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.loginby = app.globalData.userId
    promise.latitude = app.globalData.storLocalCity.cityy
    promise.longitude = app.globalData.storLocalCity.cityx
    $http(apiSetting.cityFindBuildInfoByCity, promise).then((data) => {
      if (data.data.cityInfo) {
        app.globalData.storLocalCity = data.data.cityInfo
        that.setData({ cityNametext: data.data.cityInfo.city })
      } else {
        // app.globalData.storLocalCity = that.data.cityInfo.cityName
        that.setData({ cityNametext: that.data.cityInfo.cityName })
      }
      //修改楼盘图路径
      let _list1 = data.data.buildInfo
      for (let i = 0; i < _list1.length; i++) {
        _list1[i].pictureurl = this.data.imgpath + _list1[i].pictureurl
        if (_list1[i].mainprice) {
          _list1[i].mainprice = parseInt(_list1[i].mainprice)
        }
      }
      let _list2 = data.data.rollImg
      for (let i = 0; i < _list2.length; i++) {
        _list2[i].url = this.data.imgpath + _list2[i].url
      }

      that.setData({
        imgUrls: _list2,
        buildinfolist: _list1,
        isHaveCoupon: data.data.isHaveCoupon
      })

      let buildInfo = data.data.buildInfo
      let _tagArr = []
      for (let j = 0; j < buildInfo.length; j++) {
        if (buildInfo[j].labels === undefined) {
          _tagArr.push('')
        } else {
          _tagArr.push(buildInfo[j].labels.split(','))
        }
      }
      this.setData({
        buildinfotaglist: _tagArr
      })

      // 获取周边楼盘
      this.getRimBuildInfo();

    }, (error) => {
      console.log(error)
    });
  },
  // 获取轮播图及城市信息
  getCityFindBuildInfoByCity() {
    let that = this
    let promise = that.data.cityInfo
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId 
    $http(apiSetting.cityFindBuildInfoByCity, promise).then((data) => {
      if (data.data.cityInfo) {
        app.globalData.storLocalCity = data.data.cityInfo
        that.setData({ cityNametext: data.data.cityInfo.city})
      }else{
        // app.globalData.storLocalCity = that.data.cityInfo.cityName
        that.setData({ cityNametext: that.data.cityInfo.cityName})
      }
      //修改楼盘图路径
      let _list1 = data.data.buildInfo
      for(let i=0;i<_list1.length;i++){
         _list1[i].pictureurl = this.data.imgpath + _list1[i].pictureurl
        if (_list1[i].mainprice){
          _list1[i].mainprice = parseInt(_list1[i].mainprice)
        }
      }
      let _list2 = data.data.rollImg
      for (let i = 0; i < _list2.length; i++) {
        _list2[i].url = this.data.imgpath + _list2[i].url
      }
      
      that.setData({
        imgUrls: _list2,
        buildinfolist: _list1,
        isHaveCoupon: data.data.isHaveCoupon
      })
     
      let buildInfo = data.data.buildInfo
      let _tagArr = []
      for (let j = 0; j < buildInfo.length; j++) {
        if (buildInfo[j].labels === undefined) {
          _tagArr.push('')
        } else {
          _tagArr.push(buildInfo[j].labels.split(','))
        }
      }
      this.setData({
        buildinfotaglist: _tagArr
      })

      // 获取周边楼盘
      this.getRimBuildInfo();

    }, (error) => {
      console.log(error)
    });
  },

  //获取周边城市信息
  getRimBuildInfo() {
    let that = this
    let promise = {
      page: that.data.rimBuildPage.page,
      perpage: that.data.rimBuildPage.perpage,
      login_by: app.globalData.userId,
      city: app.globalData.storLocalCity.id
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.projectApiFindProjectListByCity, promise).then((data) => {
      wx.hideLoading()
      let rimbuildinfo = []
      if (data.list.length > 0) {
        rimbuildinfo = [...that.data.rimbuildinfolist, ...data.list]
      } else {
        that.data.rimBuildPage.isPage = false
        wx.hideLoading()
        return
      }
      
      //周边列表图片路径修改
      let _list3 = rimbuildinfo
      for(let i=0;i<_list3.length;i++){
        _list3[i].pictureurl = this.data.imgpath + _list3[i].pictureurl
        _list3[i].mainprice = parseInt(_list3[i].mainprice)
      }
      that.setData({
        rimbuildinfolist: _list3
      })
      let _arr = []
      // if (rimbuildinfo.length<=1) return
      for (let i = 0; i < rimbuildinfo.length; i++) {
        if (rimbuildinfo[i].labels) {
          _arr.push(rimbuildinfo[i].labels.split(','))
        } else {
          _arr.push('')
        }
      }
      that.setData({
        rimbuildinfotaglist: _arr
      })
    }, (error) => {
      console.log(error)

    });
  },

  // 获取绑定用户信息
  getUserGetUserInfo(val) {
    let that = this
    let promise = { openid: val}
    let cityPromise = wx.getStorageSync("cityPromise") || []
    
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.userGetUserInfo, promise).then((data) => {
      app.globalData.bindUserInfo = data.data
      that.stopRefresh()
    })
  },

  // 页面跳转
  pageTobind(e) {
    let pageUrl = e.target.dataset.url
    wx.navigateTo({
      url: pageUrl
    })
  },
//轮播图错误图片
  erroImage1(e){
    if (e.type == 'error') {
      this.data.imgUrls[e.target.dataset.index].url = this.data.defaultImg
      this.setData({
        imgUrls: this.data.imgUrls
      })
      console.log(this.data.defaultImg)
    }
  },
// 楼盘信息错误图片
  erroImage3(e){
    if(e.type == 'error'){
      this.data.buildinfolist[e.target.dataset.index].pictureurl = this.data.defaultImg
      this.setData({
        buildinfolist: this.data.buildinfolist
      })
    }
  },
  //周边列表错误图片
  erroImage2(e){
    if (e.type == 'error') {
      this.data.rimbuildinfolist[e.target.dataset.index].pictureurl = this.data.defaultImg
      this.setData({
        rimbuildinfolist: this.data.rimbuildinfolist
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    // 显示导航栏加载框
    wx.showNavigationBarLoading()
    this.onLoad()
  },
  // 停止刷新
  stopRefresh() {
    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
  },
  // 页面到达底部
  onReachBottom() {
    // 判断是否翻页
    if (this.data.rimBuildPage.isPage) {
      this.data.rimBuildPage.page++
      this.getRimBuildInfo()
    }
  }
})