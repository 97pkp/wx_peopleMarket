//index.js
//获取应用实例
const app = getApp()
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import fileUrl from '../../http/fileServeUrl.js'
import mapKey from '../../http/mapKey.js'
import appid from '../../http/appID.js'
import util from '../../utils/util.js'

const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const wxMap = new QQMapWX({
  key: mapKey
});
let ifChange; //全局变量，判断进入小程序加载的方式：登录加载/切换城市加载/返回跳转加载
let _ifChange = false; //用于判断是否是游戏弹屏返回小游戏
let loginGetUserInfo = false; //用于判断是否是登录的时候获取授权
let scanningOption = ""; //扫二维码得到的参数
let bindCityResult = "";
const {
  $Message
} = require('../../dist/base/index');
Page({
  data: {
    defaultImg: '../../images/defaultImg.png', //默认图才能相对路径
    isHaveCoupon: true, //是否显示优惠券
    isPermit: false, //是否有使用权限
    imgpath: fileUrl, //图片拼接根路径
    cityNametext: '', //定位城市名
    imgUrls: [], //轮播图数组
    autoplay: true,
    interval: 5000,
    duration: 1000,
    swiperCurrent: 0, //轮播图下标

    newsList: [], //暂存的新闻活动数据列表
    showNewsList: [], //用于显示的新闻活动数据
    showTheCityNewsList: [], //用于存放当前城市的新闻活动数据

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

    //用户信息弹窗变量
    showBgpack: false, //是否显示用户信息授权窗口
    showPhonepack: false, //是否显示手机号授权窗口
    showBindUserInfo: false, //是否显示绑定用户信息窗口
    pageUrl: '', // 跳转路径
    isBuildClick: false, //是否楼盘列表点击
    isNewsClick: false, //是否是新闻点击
    isHavePopupView: false, //是否有弹屏信息
    newsCurrent: 0, //默认新闻活动下标
    t: 0, //新闻模块循环变量初始为0
    _imgList: [], //新闻图片存放

    bombScreen: {}, //城市弹屏信息
    showLine: true, //是否显示弹屏的关闭按钮，当图片加载完之后显示出来
    screenOpacity: 0, //弹屏模块透明度，在图片加载出来之前默认为透明不显示
    isBannerClick: false, //是否点击轮播图
    // showNews: false,
    //弹屏请求参数
    bombScreenReq: {
      city_area_id: '全部',
      enabled: "0",
      status: "0",
      type: ""
    },
    city_area_id: "全部", //新闻活动请求类型 ：全部 or 110100
    newsLoadOK: false, // 新闻活动请求完成
    rimBuildLoadOK: false, // 周边楼盘请求完成
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
  goInformation: util.throttle(function(e) {
    let project_id = e.currentTarget.dataset.project_id
    // let wxUserInfo = wx.getStorageSync('wxUserInfo');

    // let param = {
    //   openId: app.globalData.openid,
    //   headImg: wxUserInfo.avatarUrl,
    //   nickName: wxUserInfo.nickName,
    //   projectId: project_id
    // }
    // $http(apiSetting.apiAddOnlookers, param).then((data) => {
    //   if (data) {
    //     console.log("围观人数保存成功")
    //   }
    // }, (error) => {
    //   console.log("围观人数保存失败")
    // })
    this.setData({
      pageUrl: '../information/information?project_id=' + project_id,
      isBuildClick: true
    })
    loginGetUserInfo = false
    this.Users()
  }, 500),

  //跳转新闻活动列表页
  goNewsActivityList: util.throttle(function(e) {
    this.setData({
      pageUrl: e.currentTarget.dataset.url,
      isNewsClick: true
    })
    loginGetUserInfo = false
    this.Users()
  }, 500),

  //新闻活动直接跳转详情页
  goNewsActivityInfo: util.throttle(function() {
    let newsList = this.data.newsList
    let newsCurrent = this.data.newsCurrent
    this.setData({
      pageUrl: '../newsActivityInfo/newsActivityInfo?atvid=' + newsList[newsCurrent].id + '&type=' + newsList[newsCurrent].type,
      isNewsClick: true
    })
    loginGetUserInfo = false
    this.Users()
  }, 500),

  onLoad: function(option) {
    if (option != undefined && JSON.stringify(option) != "{}") {
      ifChange = option.ifChange;
    } else {
      if (ifChange == 2) {
        ifChange = 1
      }
    }
    //扫二维码
    
    if (option != undefined  && option.scene) {
      let scene = decodeURIComponent(option.scene);
      console.log("scene***************" + scene)
      scanningOption = scene;
    } else {
      scanningOption = "";
    }

    let that = this
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true,
    // })
    that.setData({
      rimbuildinfolist: []
    })
    that.data.rimBuildPage.isPage = true
    that.setData({
      'rimBuildPage.page': 1,
      'rimBuildPage.perpage': 10,
      'rimBuildPage.isPage': true
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, userid
        let code = res.code
        loginGetUserInfo = true
        //检查用户信息授权
        wx.getSetting({
          success(res) {
            // if (!res.authSetting['scope.userInfo']) {
            //   that.setData({
            //     showBgpack: true,
            //   })
            // } else {
            wx.showLoading({
              title: '加载中',
              mask: true,
            })
            // wx.getUserInfo({
            //   success: rest => {
            let promise = {
              code: code
            }
            let cityPromise = wx.getStorageSync("cityPromise") || {}

            promise.currentCity = cityPromise.currentCity
            promise.positionCity = cityPromise.positionCity
            // promise.iv = rest.iv
            // promise.encryptedData = rest.encryptedData

            $http(apiSetting.userDecodeUserInfo, promise).then((data) => {
              console.log('openid:' + data.data.openid)
              console.log('status:' + data.data.status)
              app.globalData.token = data.data['vx-zhwx-token']
              app.globalData.openid = data.data.openid
              app.globalData.unionId = data.data.unionId
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
              };
              if (scanningOption && app.globalData.openid) {
                that.bindUserCity(scanningOption);
              }
              app.globalData.userId = data.data.USERID
              that.getUserGetUserInfo(data.data.openid)
              if (ifChange == undefined) {

                let promise = {
                  unionid: app.globalData.unionId
                  // unionid:'oygNC1U6jeX_1--7LPtEJEmfTDcg'
                };
                $http(apiSetting.userGetUserCity, promise).then((data) => {
                  if (data.status && data.status == 404) {
                    that.accreditOperate()
                    return
                  }
                  let city = data.data.currentCity
                  if (city == "未知") {
                    city = ""
                  };
                  if (city) {
                    app.globalData.gameUserCity = city
                  }
                  that.accreditOperate()
                }, (error) => {
                  that.accreditOperate()
                })
              } else {
                that.accreditOperate()
              }
            }, (error) => {
              console.log(error)
            })
            // }
            // })
            // }
          }
        })

      }
    })
  },
  onShow: function() {

    // if (this.data.showBgpack) {
    //   return
    // }
    // let that = this
    // 
    // wx.getSetting({
    //   success(res) {
    //     if (!res.authSetting['scope.userInfo']) {
    //       that.setData({
    //         showBgpack: true,
    //       })
    //       return
    //     }
    //   }
    // })
    if (ifChange == 3) {
      wx.showLoading({
        title: '加载中',
      })
      this.setData({
        'bombScreenReq.city_area_id': "全部",
        city_area_id: "全部",
        isBannerClick: false,
        t: 0,
        _imgList: [],
        newsList: [],
        rimbuildinfolist: [],
        swiperCurrent: 0,
        newsLoadOK: false, // 新闻活动请求完成
        rimBuildLoadOK: false, // 周边楼盘请求完成
      })
      this.getUserCity()
    }

    this.setData({
      showBgpack: false, //是否显示用户信息授权窗口
      showPhonepack: false, //是否显示手机号授权窗口
    })
  },

  //获取用户游戏填写城市，返回为空串，则不是游戏用户
  getUserCity() {
    let that = this
    let promise = {
      unionid: app.globalData.unionId
      // unionid: 'oygNC1U6jeX_1--7LPtEJEmfTDcg'
    }
    $http(apiSetting.userGetUserCity, promise).then((data) => {
      if (data.status && data.status == 404) {
        that.accreditOperate()
        return
      }
      let city = data.data.currentCity
      if (city == "未知") {
        city = ""
      }
      if (city) {

        that.getCityList(city)
      } else {
        that.getNowAddress()
      }
    })
    // ifChange = undefined
  },

  // 位置授权操作
  accreditOperate() {
    console.log("进入位置授权accreditOperate")
    let that = this;
    // 判断本地是否有数据
    if (app.globalData.storLocalCity && ifChange === undefined) {
      console.log("位置授权操作**+getNowAddress")
      
      that.getNowAddress()
      // that.data.cityInfo.cityName = app.globalData.storLocalCity.city
      // that.getCityFindBuildInfoByCity()
    } else if (app.globalData.storLocalCity && ifChange == '1') {
      
      that.data.cityInfo.cityName = app.globalData.storLocalCity.city
      that.findBombScreenByCityId()
      
      that.getNewsActivity()
      that.getCityFindBuildInfoByCity()
    } else if (ifChange == 3) { //弹屏小游戏返回首页
      // that.getUserCity()   
    } else {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) { //位置权限未授权
            wx.authorize({
              scope: 'scope.userLocation',
              success(res) { //同意位置权限授权
                console.log("同意位置权限授权")
                that.getMapLocation();
              },
              fail(res) { //不同意位置权限授权
                console.log("不同意位置权限授权")
                if (scanningOption && ifChange != 3 && ifChange == undefined && ifChange != 2 && !_ifChange) {
                  console.log("不同意位置权限授权++getCityList(bindCityResult)" + bindCityResult)
                  that.getCityList(bindCityResult)
                } else {
                  console.log("不同意位置权限授权++getCityList")
                  that.getCityList()
                }
              }
            })
          } else { //位置权限已经授权
            that.getMapLocation();
          }
        },
        fail(res) {
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
        that.data.cityInfo.longitude = res.longitude.toString();
        console.log("获取位置***" + that.data.cityInfo.longitude + "获取位置时间"+ new Date());
        //经纬度逆解析获取城市名
        wxMap.reverseGeocoder({
          location: {
            latitude: that.data.cityInfo.latitude,
            longitude: that.data.cityInfo.longitude
          },
          success: function(res) {
            console.log("经纬度逆解析获取城市名****" + new Date())
            let city = res.result.address_component
            let _storage = wx.getStorageSync('cityPromise') || {}

            _storage.positionCity = city.city
            _storage.currentCity = city.city
            wx.setStorageSync('cityPromise', _storage)

            //传入城市，判断是否有城市字典
            console.log("传入城市，判断是否有城市字典****" + city.city)
            that.getCityList(city.city)
            // that.getCityFindBuildInfoByCity()
          },
          fail: function(res) {
            // that.getCityFindBuildInfoByCity()
            console.log("经纬度逆解析获取城市名****" + new Date())
            if (scanningOption && ifChange != 3 && ifChange == undefined && ifChange != 2 && !_ifChange) {
              console.log("传入城市getCityList**bindCityResult**" + bindCityResult)
              that.getCityList(bindCityResult)
            } else {
              console.log("传入城市getCityList****")
              that.getCityList()
            }
          }
        })
      },
      fail: function(res) {

        if (scanningOption && ifChange != 3 && ifChange == undefined && ifChange != 2 && !_ifChange) {
          that.getCityList(bindCityResult)
        } else {
          that.getCityList()
        }
      },
      complete: function(res) {

      }
    })
  },
  //获取城市列表信息
  getCityList(city) {
    let that = this
    let promise = {}
    let cityPromise = wx.getStorageSync("cityPromise") || {};
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.cityFindCityItems, promise).then((data) => {

      let cityList = data.data
      // 如果游戏用户绑定过城市，且在城市列表可以找到，则把当前绑定城市作为默认城市
      if (app.globalData.gameUserCity) {
        for (let i = 0; i < cityList.length; i++) {
          if (app.globalData.gameUserCity.indexOf(cityList[i].city) != -1) {
            wx.setStorageSync('storLocalCity', cityList[i])
            app.globalData.storLocalCity = cityList[i]
            
            // 查询城市参数
            that.setData({
              'cityInfo.latitude': '',
              'cityInfo.longitude': '',
              'cityInfo.cityName': app.globalData.gameUserCity
            })
            let cityPromise = wx.getStorageSync("cityPromise") || {}

            cityPromise.currentCity = app.globalData.gameUserCity
            wx.setStorageSync("cityPromise", cityPromise)
            that.findBombScreenByCityId()
            
            that.getNewsActivity()
            that.getCityFindBuildInfoByCity()
            return
          }
        }
      }
      if (city) {
        for (let i = 0; i < cityList.length; i++) {
          if (city.indexOf(cityList[i].city) !== -1) {
            wx.setStorageSync('storLocalCity', cityList[i])
            
            app.globalData.storLocalCity = cityList[i]
            
            // 查询城市参数
            that.setData({
              'cityInfo.latitude': '',
              'cityInfo.longitude': '',
              'cityInfo.cityName': cityList[i].city
            })
            let cityPromise = wx.getStorageSync("cityPromise") || {}

            cityPromise.currentCity = app.globalData.gameUserCity
            wx.setStorageSync("cityPromise", cityPromise)
            // that.findBombScreenByCityId()
            // that.getNewsActivity()
            // that.getCityFindBuildInfoByCity()


            that.findBombScreenByCityId()
            
            that.getNewsActivity()
            that.getCityFindBuildInfoByCity()
            return
          }
        }
      }

      if (ifChange == 3 && !_ifChange) {
        console.log("获取城市列表信息+getNowAddress**" + ifChange)
        
        that.getNowAddress(ifChange)
        return
      }
      if (that.data.cityInfo) {

        let result = [],
          results = {};
        cityList.map((preItem, index) => {
          if (preItem.city.indexOf('北京') != -1) {
            results = {
              city: preItem.city,
              cityId: preItem.id,
              cityPreId: preItem.area
            };
            result.push(results);
          }
        })
        wx.setStorageSync('cityonly', result)
        
        that.setData({
          'cityInfo.cityName': cityList[0].city
        })
        
        wx.setStorageSync('storLocalCity', cityList[0])
        app.globalData.storLocalCity = cityList[0]
        let _storage = wx.getStorageSync('cityPromise') || {}

        _storage.currentCity = cityList[0].city

        wx.setStorageSync('cityPromise', _storage)
      }
      that.findBombScreenByCityId()
      
      that.getNewsActivity()
      that.getCityFindBuildInfoByCity()
    }, (error) => {
      console.log(error)
      
      wx.hideLoading() //城市列表获取失败，停止等待
    });
  },

  //获取缓存判断是否有该字段
  getSessionCityList(city) {
    console.log("进入获取缓存判断是否有该字段+++" + city)
    let that = this
    let promise = {}
    let cityPromise = wx.getStorageSync("cityPromise") || {}
    if ('positionCity' in cityPromise && cityPromise.positionCity.indexOf(cityPromise.currentCity) != -1) {
      that.findBombScreenByCityId()
      
      that.getNewsActivity()
      that.getCityFindBuildInfoByCity()
      return
    }

    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.cityFindCityItems, promise).then((data) => {
      let cityList = data.data
      if (city) {
        for (let i = 0; i < cityList.length; i++) {
          if (city.indexOf(cityList[i].city) !== -1) {
            if (ifChange !== 3) {
              wx.showModal({
                title: '定位城市提示',
                content: '定位显示您当前的城市是"' + city + '",是否需要切换城市?',
                showCancel: true,
                cancelColor: '#999999',
                confirmColor: '#77C4FF',
                success(res) {
                  if (res.confirm) {
                    wx.showLoading({
                      title: '加载中',
                    })
                    that.setData({
                      isBannerClick: false,
                      t: 0,
                      _imgList: [],
                      newsList: [],
                      rimbuildinfolist: [],
                      swiperCurrent: 0,
                      newsCurrent: 0,
                      'bombScreenReq.city_area_id': "全部",
                      city_area_id: "全部",
                      newsLoadOK: false,
                      rimBuildLoadOK: false,
                    })

                    let boomScreen_ids = app.globalData.boomScreen_ids
                   
                    let storLocalCity = app.globalData.storLocalCity
                    for (let i = 0; i < boomScreen_ids.length; i++) {
                      if (storLocalCity.id == boomScreen_ids[i].boomScreen_history_id) {
                        boomScreen_ids.splice(i, 1)
                      }
                    }
                    app.globalData.boomScreen_ids = boomScreen_ids
                    wx.setStorageSync('storLocalCity', cityList[i])
                    
                    that.setData({
                      'cityInfo.cityName': cityList[i].city
                    })
                    app.globalData.storLocalCity = cityList[i]
                    let _storage = wx.getStorageSync('cityPromise') || {}
                    _storage.currentCity = cityList[i].city

                    wx.setStorageSync('cityPromise', _storage)

                    that.findBombScreenByCityId()
                    
                    that.getNewsActivity()
                    that.getCityFindBuildInfoByCity()
                    return
                  } else if (res.cancel) {
                    return
                  }
                }
              })
              ifChange = undefined
            } else {
            
              wx.setStorageSync('storLocalCity', cityList[i])
              
              that.setData({
                'cityInfo.cityName': cityList[i].city
              })
              app.globalData.storLocalCity = cityList[i]
              let _storage = wx.getStorageSync('cityPromise') || {}
              _storage.currentCity = cityList[i].city

              wx.setStorageSync('cityPromise', _storage)

              that.findBombScreenByCityId()
              
              that.getNewsActivity()
              that.getCityFindBuildInfoByCity()
              return
            }

          }
        }
      }
      
      if (that.data.cityInfo) {
        that.setData({
          'cityInfo.cityName': cityList[0].city
        })
        wx.setStorageSync('storLocalCity', cityList[0])
        app.globalData.storLocalCity = cityList[0]
        let _storage = wx.getStorageSync('cityPromise') || {}

        _storage.currentCity = cityList[0].city

        wx.setStorageSync('cityPromise', _storage)
      }
      that.findBombScreenByCityId()
      
      that.getNewsActivity()
      that.getCitySessionFindBuildInfoByCity()
    }, (error) => {
      console.log(error)
      
      wx.hideLoading() //获取城市列表失败，停止等待
    });

  },
  //获取当前地址进行与缓存匹配
  getNowAddress(ifChange) {
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
          success: function(res) {
            let city = res.result.address_component
            let _storage = wx.getStorageSync('cityPromise') || {}
            _storage.positionCity = city.city
            wx.setStorageSync('cityPromise', _storage)
            if (city.city != _storage.positionCity || city.city != _storage.currentCity) {

              if (scanningOption && ifChange != 3 && ifChange == undefined && ifChange != 2 && !_ifChange) {
                
                that.getCityList(bindCityResult)
              } else {
                console.log("getSessionCityList**经纬度逆解析获取城市名***" + city.city)
                that.getSessionCityList(city.city)
              }
            } else {
              that.findBombScreenByCityId()
              
              that.getNewsActivity()
              that.getCityFindBuildInfoByCity()
            }
            // wx.setStorageSync('cityPromise', _storage)
            //传入城市，判断是否有城市字典
            // that.getCityList(city.city)
            // that.getCityFindBuildInfoByCity()
          },
          fail: function(res) {
            // that.getCityFindBuildInfoByCity()

            if (scanningOption && ifChange != 3 && ifChange != 2 && !_ifChange) {
              that.getCityList(bindCityResult)
            } else {
              that.getCityList()
            }
          }
        })
      },
      fail: function(res) {
        if (ifChange == 3) {
          _ifChange = true
        }

        if (scanningOption && ifChange != 3 && ifChange != 2 && !_ifChange) {
          that.getCityList(bindCityResult)
        } else {
          that.getCityList()
        }
      }
    })
  },

  getCitySessionFindBuildInfoByCity() {
    let that = this
    
    that.setData({
      'cityInfo.cityName': '',
      'cityInfo.latitude': '',
      'cityInfo.longitude': '',
    })
    let promise = that.data.cityInfo
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.loginby = app.globalData.userId
    promise.cityName = cityPromise.currentCity
    // promise.latitude = app.globalData.storLocalCity.cityy
    // promise.longitude = app.globalData.storLocalCity.cityx
    $http(apiSetting.cityFindBuildInfoByCity, promise).then((data) => {
      if (data.data.cityInfo) {
        app.globalData.storLocalCity = data.data.cityInfo
        that.setData({
          cityNametext: data.data.cityInfo.city
        })
      } else {
        // app.globalData.storLocalCity = that.data.cityInfo.cityName
        that.setData({
          cityNametext: that.data.cityInfo.cityName
        })
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
      this.getRimBuildInfo()
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
        that.setData({
          cityNametext: data.data.cityInfo.city
        })
      } else {
        // app.globalData.storLocalCity = that.data.cityInfo.cityName
        that.setData({
          cityNametext: that.data.cityInfo.cityName
        })
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
      // this.getRimBuildInfo()
    }, (error) => {
      console.log(error)
    });
  },

  //获取周边城市楼盘信息
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
      let rimbuildinfo = []
      if (data.list.length > 0) {
        rimbuildinfo = [...that.data.rimbuildinfolist, ...data.list]
      } else {
        that.data.rimBuildLoadOK = true
        
        if (that.data.newsLoadOK && that.data.rimBuildLoadOK) {
          ifChange = undefined
          wx.hideLoading()
        }
        that.data.rimBuildPage.isPage = false
        return
      }

      //周边列表图片路径修改
      let _list3 = rimbuildinfo
      for (let i = 0; i < _list3.length; i++) {
        _list3[i].pictureurl = this.data.imgpath + _list3[i].pictureurl
        _list3[i].mainprice = parseInt(_list3[i].mainprice)
      }
      that.setData({
        rimbuildinfolist: _list3
      })
      let _arr = []
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

      that.data.rimBuildLoadOK = true
      
      if (that.data.newsLoadOK && that.data.rimBuildLoadOK) {
        wx.hideLoading()
      }
    }, (error) => {
      console.log(error)
    });
  },
  //--------------------------------------------------------------------------------------
  //获取新闻活动
  getNewsActivity() {
    let _newsArr = [] //获取的新闻数据
    let _activityArr = [] //获取的活动数据
    let _allArr = [] //新闻活动拼接数据
    let promise = {
      city_area_id: this.data.city_area_id,
      project_id: "",
      type: "",
      login_by: app.globalData.userId
    }
    $http(apiSetting.newsactivityFindNewsActivitys, promise).then((data) => {
      wx.hideLoading()
      if (data.code === -1 || !data.list || !data.list.length) {
        if (this.data.city_area_id == "全部") {
          this.setData({
            city_area_id: app.globalData.storLocalCity.id
          })
          this.getNewsActivity()
        } else {
          
          if (this.data.newsList.length) {
            wx.hideLoading()
            //将图片挂在到户型列表上
            let newsList = this.data.newsList;
            for (let i = 0; i < newsList.length; i++) {
              newsList[i].upload_file_path = this.data.imgpath + newsList[i].attachment_path
            }
            this.setData({
              newsList: newsList,
              showNewsList: newsList
            })
            // this.findAttachRelationById(this.data.newsList.length)
          } else {
            
            this.data.newsLoadOK = true
            if (this.data.newsLoadOK && this.data.rimBuildLoadOK) {
              wx.hideLoading()
            }
          }
        }
        return
      }
      let newsList = data.list //请求返回的数据
      for (let i = 0; i < newsList.length; i++) { //过滤过期的活动，并对时间显示格式进行整理
        if (newsList[i].enabled == 1) {
          newsList.splice(i, 1)
          i--
          continue
        }
        if (newsList[i].type == 0) {
          if (newsList[i].published_date && newsList[i].published_date.indexOf(' ') != -1) {
            newsList[i].published_date = newsList[i].published_date.split(' ')[0].split('-').join('.')
          }
          _newsArr.push(newsList[i])
        } else if (newsList[i].type == 1) {
          if (newsList[i].start_date && newsList[i].start_date.indexOf(' ') != -1) {
            newsList[i].start_date = newsList[i].start_date.split(' ')[0].split('-').join('.')
          }
          if (newsList[i].end_date && newsList[i].end_date.indexOf(' ') != -1) {
            newsList[i].end_date = newsList[i].end_date.split(' ')[0].split('-').join('.')
          }
          let activityEndDate = newsList[i].end_date
          activityEndDate = activityEndDate.replace(/\./g, '/')
          activityEndDate = new Date(activityEndDate).getTime()
          let nowDate = new Date()
          nowDate = util.formatTime(nowDate).split(' ')[0]
          nowDate = new Date(nowDate).getTime() //当前网络时间 
          if (activityEndDate < nowDate) {
            newsList.splice(i, 1)
            i--
            continue
          }
          _activityArr.push(newsList[i])
        }
      }

      if (this.data.city_area_id == "全部") {
        //如果新闻活动个数不足6个，则显示全部；超过6个，不足三个的显示全部，另一项自动补全为6个
        if (_newsArr.length + _activityArr.length < 6) {
          _allArr = []
          _allArr = _allArr.concat(_newsArr, _activityArr)
          this.setData({
            newsList: _allArr,
            city_area_id: app.globalData.storLocalCity.id
          })
          this.getNewsActivity()
        } else if (_newsArr.length + _activityArr.length == 6) {
          _allArr = []
          _allArr = _allArr.concat(_newsArr, _activityArr)
          this.setData({
            newsList: _allArr
          })
          //将图片挂在到户型列表上
          let newsList = this.data.newsList
          for (let i = 0; i < _allArr.length; i++) {
            newsList[i].upload_file_path = this.data.imgpath + newsList[i].attachment_path
          }
          this.setData({
            newsList: newsList,
            showNewsList: newsList
          })
          // this.findAttachRelationById(_allArr.length)
        } else {
          if (_newsArr.length >= 3) {
            if (_activityArr.length >= 3) {
              _newsArr.length = 3
              _activityArr.length = 3
            } else {
              _newsArr.length = 6 - _activityArr.length
            }
          } else {
            _activityArr.length = 6 - _newsArr.length
          }
          _allArr = []
          _allArr = _allArr.concat(_newsArr, _activityArr)
          this.setData({
            newsList: _allArr
          })
          //将图片挂在到户型列表上
          let newsList = this.data.newsList
          for (let i = 0; i < _allArr.length; i++) {
            newsList[i].upload_file_path = this.data.imgpath + newsList[i].attachment_path
          }
          this.setData({
            newsList: newsList,
            showNewsList: newsList
          })

          // this.findAttachRelationById(_allArr.length)
        }
      } else {
        let newsArr = this.data.newsList
        let news = []
        let atvs = []
        for (let i = 0; i < newsArr.length; i++) {
          if (newsArr[i].type == 0) {
            news.push(newsArr[i])
          } else if (newsArr[i].type == 1) {
            atvs.push(newsArr[i])
          }
        }
        if (news.length + _newsArr.length <= 3 && atvs.length + _activityArr.length <= 3) {
          news = news.concat(_newsArr)
          atvs = atvs.concat(_activityArr)
          _allArr = []
          _allArr = _allArr.concat(news, atvs)
          this.setData({
            newsList: _allArr
          })
        } else if (news.length + _newsArr.length <= 3 && atvs.length + _activityArr.length > 3) {
          if (news.length + _newsArr.length + atvs.length > 6) {
            news = news.concat(_newsArr)
            news.length = 6 - atvs.length
            _allArr = []
            _allArr = _allArr.concat(news, atvs)
            this.setData({
              newsList: _allArr
            })
          } else if (news.length + _newsArr.length + atvs.length == 6) {
            news = news.concat(_newsArr)
            _allArr = []
            _allArr = _newsArr.concat(news, atvs)
            this.setData({
              newsList: _allArr
            })
          } else if (news.length + _newsArr.length + atvs.length < 6) {
            if (news.length + _newsArr.length + atvs.length + _activityArr.length <= 6) {
              news = news.concat(_newsArr)
              atvs = atvs.concat(_activityArr)
              _allArr = []
              _allArr = _allArr.concat(news, atvs)
              this.setData({
                newsList: _allArr
              })
            } else {
              news = news.concat(_newsArr)
              atvs = atvs.concat(_activityArr)
              atvs.length = 6 - news.length
              _allArr = []
              _allArr = _newsArr.concat(news, atvs)
              this.setData({
                newsList: _allArr
              })
            }
          }
        } else if (news.length + _newsArr.length > 3 && atvs.length + _activityArr.length <= 3) {
          if (atvs.length + _activityArr.length + news.length > 6) {
            atvs = atvs.concat(_activityArr)
            atvs.length = 6 - news.length
            _allArr = []
            _allArr = _allArr.concat(news, atvs)
            this.setData({
              newsList: _allArr
            })
          } else if (atvs.length + _activityArr.length + news.length == 6) {
            atvs = atvs.concat(_activityArr)
            _allArr = []
            _allArr = _allArr.concat(news, atvs)
            this.setData({
              newsList: _allArr
            })
          } else if (atvs.length + _activityArr.length + news.length < 6) {
            if (news.length + _newsArr.length + atvs.length + _activityArr.length <= 6) {
              news = news.concat(_newsArr)
              atvs = atvs.concat(_activityArr)
              _allArr = []
              _allArr = _allArr.concat(news, atvs)
              this.setData({
                newsList: _allArr
              })
            } else {
              news = news.concat(_newsArr)
              atvs = atvs.concat(_activityArr)
              news.length = 6 - atvs.length
              _allArr = []
              _allArr = _allArr.concat(news, atvs)
              this.setData({
                newsList: _allArr
              })
            }
          }
        } else if (news.length + _newsArr.length > 3 && atvs.length + _activityArr.length > 3) {
          if (news.length <= 3 && atvs.length <= 3) {
            news = news.concat(_newsArr)
            atvs = atvs.concat(_activityArr)
            news.length = 3
            atvs.length = 3
            _allArr = []
            _allArr = _allArr.concat(news, atvs)
            this.setData({
              newsList: _allArr
            })
          } else if (news.length <= 3 && atvs.length > 3) {
            news = news.concat(_newsArr)
            news.length = 6 - atvs.length
            _allArr = []
            _allArr = _allArr.concat(news, atvs)
            this.setData({
              newsList: _allArr
            })
          } else if (news.length > 3 && atvs.length <= 3) {
            atvs = atvs.concat(_activityArr)
            atvs.length = 6 - news.length
            _allArr = []
            _allArr = _allArr.concat(news, atvs)
            this.setData({
              newsList: _allArr
            })
          } else {
            news.length = 3
            atvs.length = 3
            _allArr = []
            _allArr = _newsArr.concat(news, atvs)
            this.setData({
              newsList: _allArr
            })
          }
        }
        //将图片挂在到户型列表上
        let newsList = this.data.newsList
        for (let i = 0; i < newsList.length; i++) {
          newsList[i].upload_file_path = this.data.imgpath + newsList[i].attachment_path
        }
        this.setData({
          newsList: newsList,
          showNewsList: newsList
        })
        // this.findAttachRelationById(_allArr.length)
      }
    })
  },

  //获取新闻活动图片
  findAttachRelationById(newsAtvListLength) {
    let _t = this.data.t //_t=0
    if (_t > newsAtvListLength - 1) {
      let _arr1 = this.data._imgList
      for (let i = 0; i < _arr1.length; i++) {
        if (_arr1[i] !== null && _arr1[i] !== undefined) {
          if (_arr1[i].upload_file_path.indexOf("https") >= 0 || _arr1[i].upload_file_path.indexOf("http") >= 0){
            _arr1[i].upload_file_path = _arr1[i].upload_file_path
          }else{
            _arr1[i].upload_file_path = this.data.imgpath + _arr1[i].upload_file_path
          }
         
        } else {
          _arr1[i] = {
            upload_file_path: this.data.imgpath
          }
        }
      }
      //将图片挂在到户型列表上
      let newsList = this.data.newsList
      for (let i = 0; i < newsList.length; i++) {
        newsList[i].imgArr = _arr1[i]
      }
      this.setData({
        newsList: newsList,
        showNewsList: newsList
      })
      this.data.newsLoadOK = true
      if (this.data.newsLoadOK && this.data.rimBuildLoadOK) {
        ifChange = undefined
        wx.hideLoading()
      }
      return
    }
    let _newsList = this.data.newsList
    let promise = {
      id: _newsList[_t].id
    }
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

  //新闻活动模块切换
  newsChange(e) {
    let newsCurrent = e.detail.current
    this.setData({
      newsCurrent: newsCurrent
    })
  },

  //新闻活动图片加载失败
  errorImgNews(e) {
    if (e.type == 'error') {
      this.data.newsList[e.target.dataset.index].upload_file_path = this.data.defaultImg
      this.setData({
        newsList: this.data.newsList,
        showNewsList: this.data.newsList
      })
    }
  },

  //获取弹屏信息
  findBombScreenByCityId() {
    let that = this
    if (app.globalData.boomScreen_ids && app.globalData.boomScreen_ids != null) {
      let boomScreen_ids = JSON.parse(JSON.stringify(app.globalData.boomScreen_ids))
      for (let i = 0; i < boomScreen_ids.length; i++) {
        // if (app.globalData.storLocalCity.id == boomScreen_ids[i].boomScreen_history_id) {
        //读取全局变量，查询是否有当前城市的弹屏，没有弹屏，正常执行；有弹屏，判断显示时间是否过期
        //判断显隐时间，如果结束时间小于当前时间，不再展示，并且删除此条数据；如果当前时间小于结束时间，判断是否是第二天
        //如果是第二天，正常显示；如果不是第二天，不显示
        // if (boomScreen_ids[i].bombScreen.city_area_id.indexOf(app.globalData.storLocalCity.id) != -1 || boomScreen_ids[i].bombScreen.city_area_id=="全部") {
        if (boomScreen_ids[i].boomScreen_history_id == app.globalData.storLocalCity.id) {
          let bombScreen = boomScreen_ids[i].bombScreen
          // let endDate = new Date(bombScreen.display_end_date)
          bombScreen.display_end_date = bombScreen.display_end_date.replace(/-/g, '/')
          let endDate = new Date(bombScreen.display_end_date)
          let nowDateStr = util.formatTime(new Date())
          let nowDate = new Date(nowDateStr.split(' ')[0])

          if (endDate.getTime() < nowDate.getTime()) {
            boomScreen_ids.splice(i, 1)
            app.globalData.boomScreen_ids = boomScreen_ids
            break
          } else {
            let closeDate = new Date(boomScreen_ids[i].closeDate)
            let oldYear = Number(closeDate.getFullYear())
            let nowYear = Number(nowDate.getFullYear())
            let oldMonth = Number(closeDate.getMonth())
            let nowMonth = Number(nowDate.getMonth())
            let oldDay = Number(closeDate.getDate())
            let nowDay = Number(nowDate.getDate())
            if (oldYear < nowYear || oldMonth < nowMonth || oldDay < nowDay) {
              boomScreen_ids.splice(i, 1)
              app.globalData.boomScreen_ids = boomScreen_ids
              break
            } else {
              that.setData({
                isHavePopupView: false
              })
              // return
            }
          }
        }
      }
    } else {
      app.globalData.boomScreen_ids = []
    }
    let promise = that.data.bombScreenReq
    $http(apiSetting.bombscreenFindBombScreenByCityId, promise).then((data) => {
      if (!data.data) {
        that.setData({
          isHavePopupView: false
        })
        if (that.data.bombScreenReq.city_area_id == '全部') {
          that.setData({
            'bombScreenReq.city_area_id': app.globalData.storLocalCity.id
          })

          that.findBombScreenByCityId()
        }
        return
      }
      let bombScreen = data.data
      let showStartDate = bombScreen.display_start_date
      if (showStartDate) {
        showStartDate = showStartDate.replace(/-/g, '/')
        showStartDate = new Date(showStartDate).getTime()
      }
      let showEndDate = bombScreen.display_end_date
      if (showEndDate) {
        showEndDate = showEndDate.replace(/-/g, '/')
        showEndDate = new Date(showEndDate).getTime()
      }
      let showStartTime = bombScreen.display_start_time
      let showEndTime = bombScreen.display_end_time
      let nowDateStr = util.formatTime(new Date())
      let nowDate = new Date(nowDateStr.split(' ')[0]).getTime()
      let nowTime = nowDateStr.split(' ')[1]

      //如果弹屏开始时间和结束时间都没有，默认不显示弹屏
      //如果有开始时间，没有结束时间，则如果开始时间大于当前时间就不显示，如果开始时间小于当前时间就显示
      //如果没有开始时间，有结束时间，则如果结束时间大于当前时间就显示，如果结束时间小于当前时间就不显示
      //如果开始时间和结束时间都有，则如果当前时间在时间区间内就显示，不在时间区间内就不显示
      //2019-07-22 13:49:21

      if (!showStartDate && !showEndDate) {
        if (that.data.bombScreenReq.city_area_id == '全部') {
          that.setData({
            'bombScreenReq.city_area_id': app.globalData.storLocalCity.id
          })

          that.findBombScreenByCityId()
        }
        return
      } else {
        if (showStartDate && !showEndDate) {
          if (showStartDate > nowDate) {
            if (that.data.bombScreenReq.city_area_id == '全部') {
              that.setData({
                'bombScreenReq.city_area_id': app.globalData.storLocalCity.id
              })

              that.findBombScreenByCityId()
            }
            return
          }
        } else if (!showStartDate && showEndDate) {
          if (showEndDate < nowDate) {
            if (that.data.bombScreenReq.city_area_id == '全部') {
              that.setData({
                'bombScreenReq.city_area_id': app.globalData.storLocalCity.id
              })

              that.findBombScreenByCityId()
            }
            return
          }
        } else if (showStartDate && showEndDate) {
          if (showStartDate > nowDate || showEndDate < nowDate) {
            if (that.data.bombScreenReq.city_area_id == '全部') {
              that.setData({
                'bombScreenReq.city_area_id': app.globalData.storLocalCity.id
              })

              that.findBombScreenByCityId()
            }
            return
          } else {
            if (showStartTime > nowTime || showEndTime < nowTime) {
              if (that.data.bombScreenReq.city_area_id == '全部') {
                that.setData({
                  'bombScreenReq.city_area_id': app.globalData.storLocalCity.id
                })

                that.findBombScreenByCityId()
              }
              return
            }
          }
        }
      }
      let _boomScreenIds = app.globalData.boomScreen_ids
      for (let j = 0; j < _boomScreenIds.length; j++) {
        if (_boomScreenIds[j].bombScreen.id == bombScreen.id && _boomScreenIds[j].boomScreen_history_id == app.globalData.storLocalCity.id) {
          return
        }
      }
      app.globalData.boomScreen_ids.push({
        // boomScreen_history_id: bombScreen.city_area_id
        boomScreen_history_id: app.globalData.storLocalCity.id,
        bombScreen: bombScreen,
        closeDate: null
      })
      bombScreen.attachment_path = that.data.imgpath + bombScreen.attachment_path
      that.setData({
        bombScreen: bombScreen,
        isHavePopupView: true
      })
    }), (error) => {
      console.log(error)
    }
  },

  //点击弹屏进入详情页
  goScreenInfo: util.throttle(function() {
    let that = this
    // type: 0：新闻，1：活动，2：项目，3：外链接，4：城市
    let bombScreen = this.data.bombScreen
    bombScreen.display_end_date = bombScreen.display_end_date.replace(/-/g, '/')
    let endDate = new Date(bombScreen.display_end_date).getTime()
    let showEndTime = bombScreen.display_end_time
    let nowDateStr = util.formatTime(new Date())
    let nowDate = new Date(nowDateStr.split(' ')[0]).getTime()
    let nowTime = nowDateStr.split(' ')[1]
    if (endDate < nowDate || endDate == nowDate && showEndTime < nowTime) {
      wx.showModal({
        title: '活动已结束',
        showCancel: false,
        confirmText: "关闭",
        success: function() {
          that.setData({
            bombScreen: '',
            isHavePopupView: false
          })
        }
      })
      let historyIds = JSON.parse(JSON.stringify(app.globalData.boomScreen_ids))
      for (let i = 0; i < historyIds.length; i++) {
        if (historyIds[i].boomScreen_history_id == app.globalData.storLocalCity.id) {
          historyIds.splice(i, 1)
          break
        }
      }
      app.globalData.boomScreen_ids = historyIds
      return
    }

    if (bombScreen.type == 4 && bombScreen.affiliation_cityareaid) {
      if (bombScreen.affiliation_cityareaid == app.globalData.storLocalCity.id) {
        this.setData({
          isHavePopupView: false,
          showLine: false
        })
        return
      }
      let promise = {}
      wx.showLoading({
        title: '加载中',
      })
      $http(apiSetting.cityFindCityItems, promise).then((data) => {
        let cityList = data.data
        if (!data || !cityList) {
          return
        }

        for (let i = 0; i < cityList.length; i++) {
          if (cityList[i].id == bombScreen.affiliation_cityareaid) {
            app.globalData.storLocalCity = cityList[i]
            
            if (this.data.cityInfo.cityName) {
              this.setData({
                'cityInfo.cityName': cityList[i].city,
                'bombScreenReq.city_area_id': "全部",
                city_area_id: "全部"
              })
              wx.setStorageSync('storLocalCity', cityList[i])
              app.globalData.storLocalCity = cityList[i]
              let _storage = wx.getStorageSync('cityPromise') || {}
              _storage.currentCity = cityList[i].city

              wx.setStorageSync('cityPromise', _storage)
            }
            this.setData({
              isBannerClick: false,
              t: 0,
              _imgList: [],
              newsList: [],
              rimbuildinfolist: [],
              swiperCurrent: 0,
              newsLoadOK: false, // 新闻活动请求完成
              rimBuildLoadOK: false, // 周边楼盘请求完成
            })

            this.findBombScreenByCityId()
            this.getNewsActivity()
            this.getCitySessionFindBuildInfoByCity()
          }
        }
      }, (error) => {
        console.log(error)
      });
      return
    } else if (bombScreen.type == 3 && bombScreen.bomb_screen_url) {

      wx.getSetting({
        success(res) {

          if (!res.authSetting['scope.userInfo']) {
            that.setData({
              showBgpack: true,
            })
          } else {

            //url地址转码，防止网址出现中文后ios解析不出来显示白屏的问题
            let href = bombScreen.bomb_screen_url
            if (href.search('https://') == -1) {
              if (href.search('http://') == -1) {
                href = 'https://' + href
              }
            }
            href = encodeURIComponent(href)
            wx.navigateTo({
              url: '../webView/webView?search=' + href,
            })
            ifChange = 3
          }
        }
      })
      // this.setData({
      //   pageUrl: '../webView/webView?search=' + bombScreen.bomb_screen_url,
      // })

    } else if (bombScreen.type == '2') {
      // this.setData({
      //   pageUrl: '../information/information?project_id=' + bombScreen.association_soures_id,
      // })
      wx.navigateTo({
        url: '../information/information?project_id=' + bombScreen.association_soures_id,
      })
    } else if (bombScreen.type == 1 || bombScreen.type == 0) {
      // this.setData({
      //   pageUrl: '../newsActivityInfo/newsActivityInfo?atvid=' + bombScreen.association_soures_id + "&type=" + bombScreen.type,
      // })
      wx.navigateTo({
        url: '../newsActivityInfo/newsActivityInfo?atvid=' + bombScreen.association_soures_id + "&type=" + bombScreen.type,
      })
    }
    // this.Users()
  }, 500),

  //关闭弹屏窗口
  closeView() {
    let boomScreen_ids = JSON.parse(JSON.stringify(app.globalData.boomScreen_ids))
    for (let i = 0; i < boomScreen_ids.length; i++) {
      if (boomScreen_ids[i].boomScreen_history_id == app.globalData.storLocalCity.id) {
        boomScreen_ids[i].closeDate = new Date()
        app.globalData.boomScreen_ids = boomScreen_ids
        break
      }
    }
    this.setData({
      isHavePopupView: false,
      showLine: false
    })
  },

  imgLoadOk(e) {
    this.setData({
      showLine: true,
      screenOpacity: 1
    })
  },

  //弹屏图片加载失败
  errorBombScreen(e) {
    if (e.type == 'error') {
      this.setData({
        'bombScreen.attachment_path': this.data.defaultImg
      })
    }
  },
  //查看轮播图详情
  lookBannerInfo: util.throttle(function(e) {
    if (this.data.isBannerClick) return
    let bannerItem = e.target.dataset.item
    if (bannerItem.type === undefined || bannerItem.type == 2) return
    this.setData({
      isBannerClick: true,
      pageUrl: "../newsActivityInfo/newsActivityInfo?atvid=" + bannerItem.association_soures_id + "&type=" + bannerItem.type
    })
    loginGetUserInfo = false
    this.Users()
  }, 500),

  // 获取绑定用户信息
  getUserGetUserInfo(val) {
    let that = this
    let promise = {
      openid: val
    }
    let cityPromise = wx.getStorageSync("cityPromise") || {}
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.userGetUserInfo, promise).then((data) => {
      app.globalData.bindUserInfo = data.data
      that.stopRefresh()
    })
  },

  // 页面跳转
  pageTobind: util.throttle(function(e) {
    this.setData({
      pageUrl: e.target.dataset.url,
    })
    loginGetUserInfo = false
    this.Users()
  }, 2000),
  //轮播图错误图片
  erroImage1(e) {
    if (e.type == 'error') {
      this.data.imgUrls[e.target.dataset.index].url = this.data.defaultImg
      this.setData({
        imgUrls: this.data.imgUrls
      })
    }
  },
  // 楼盘信息错误图片
  erroImage3(e) {
    if (e.type == 'error') {
      this.data.buildinfolist[e.target.dataset.index].pictureurl = this.data.defaultImg
      this.setData({
        buildinfolist: this.data.buildinfolist
      })
    }
  },
  //周边列表错误图片
  erroImage2(e) {
    if (e.type == 'error') {
      this.data.rimbuildinfolist[e.target.dataset.index].pictureurl = this.data.defaultImg
      this.setData({
        rimbuildinfolist: this.data.rimbuildinfolist
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    wx.showNavigationBarLoading() // 显示导航栏加载框
    ifChange = 2
    this.setData({
      'bombScreenReq.city_area_id': "全部",
      city_area_id: "全部",
      isBannerClick: false,
      t: 0,
      _imgList: [],
      newsList: [],
      rimbuildinfolist: [],
      swiperCurrent: 0,
      newsLoadOK: false, // 新闻活动请求完成
      rimBuildLoadOK: false, // 周边楼盘请求完成
    })
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
  },

  //用户信息获取
  Users() {
    let that = this
    //检查用户信息授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            showBgpack: true,
          })
        } else {
          //获取缓存信息验证手机号授权
          let wxDetailUserInfo = wx.getStorageSync("wxDetailUserInfo") || {};
          console.log("获取缓存信息验证手机号授权+wxDetailUserInfo *****" + JSON.stringify(wxDetailUserInfo))
          if (JSON.stringify(wxDetailUserInfo) !== "{}") {
            console.log("获取缓存信息验证手机号授权+wxDetailUserInfo.wxPhoneNumber ***" + wxDetailUserInfo.wxPhoneNumber);
            if (wxDetailUserInfo.wxPhoneNumber && wxDetailUserInfo.wxPhoneNumber != '') {
              that.setData({
                showPhonepack: false
              })
              that.userUpdata()
              //楼盘列表点击,新闻活动点击,轮播图点击，不用授权绑定信息；其他点击，需要授权绑定信息
              if (that.data.isBuildClick || that.data.isNewsClick || that.data.isBannerClick) {
                wx.navigateTo({
                  url: that.data.pageUrl,
                })
                that.setData({
                  isBuildClick: false,
                  isNewsClick: false,
                  isBannerClick: false
                })
              } else {
                //若验证手机号已经授权，去判断受否绑定用户信息
                if (app.globalData.isCheck) {
                  that.setData({
                    showBindUserInfo: false
                  })
                  wx.navigateTo({
                    url: that.data.pageUrl,
                  })
                  if (that.data.isHavePopupView) {
                    that.setData({
                      isHavePopupView: false
                    })
                  }
                } else {
                  that.setData({
                    showBindUserInfo: true,
                  })
                }
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
    this.setunionId(e.detail)

    if (!e.detail.userInfo) {
      return
    }

    wx.setStorageSync('wxUserInfo', e.detail.userInfo)
    this.userUpdata()
    
    this.setData({
      showBgpack: false,

      // showPhonepack: true,
      // showPhonepack: false,

    })
      let wxDetailUserInfo = wx.getStorageSync("wxDetailUserInfo") || {}
    console.log("loginGetUserInfo +1744***" + wxDetailUserInfo)
    // if (loginGetUserInfo) {
    if (wxDetailUserInfo.wxPhoneNumber) {
      this.setData({
        showPhonepack: false
      })
      this.onLoad()
    } else {
      
      this.setData({
        showPhonepack: true
      })
    }
    this.getLocation()
  },
  //用户授权
  setunionId(rest) {
    const that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, userid
        let code = res.code
        let promise = {
          code: code
        }
        let cityPromise = wx.getStorageSync("cityPromise") || {}
        promise.currentCity = cityPromise.currentCity
        promise.positionCity = cityPromise.positionCity
        promise.iv = rest.iv
        promise.encryptedData = rest.encryptedData
        $http(apiSetting.userDecodeUserInfo, promise).then((data) => {
          app.globalData.unionId = data.data.unionId
          app.globalData.status = data.data.status;
          app.globalData.sessionKey = data.data.sessionKey;
          if (ifChange == undefined) {

            let promise = {
              unionid: app.globalData.unionId
              // unionid:'oygNC1U6jeX_1--7LPtEJEmfTDcg'
            }
            $http(apiSetting.userGetUserCity, promise).then((data) => {
              if (data.status && data.status == 404) {
                that.accreditOperate()
                return
              }
              let city = data.data.currentCity
              if (city == "未知") {
                city = ""
              }
              if (city) {
                app.globalData.gameUserCity = city
              }
              that.accreditOperate()
            }, (error) => {
              that.accreditOperate()
            })
          }
        }, (error) => {
          console.log(error)
        })
      }
    }, (error) => {
      console.log(error)
    })
  },
  //获取手机号
  getPhoneNumber(e) {
    let that = this
    that.setData({
      showPhonepack: false
    })
    console.log("获取手机号+ e.detail.errMsg***" + e.detail.errMsg)
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
        wxDetailUserInfo.wxPhoneNumber = phoneData.phoneNumber;
        console.log("获取手机号+ phoneData.phoneNumber***" + phoneData.phoneNumber)
        wx.setStorageSync('wxDetailUserInfo', wxDetailUserInfo)
        that.userUpdata()
        if (that.data.isBuildClick || that.data.isNewsClick || that.data.isBannerClick) {
          that.setData({
            isBuildClick: false,
            isNewsClick: false,
            isBannerClick: false
          })
          wx.navigateTo({
            url: that.data.pageUrl,
          })
        } else {
          if (app.globalData.isCheck) {
            that.setData({
              showBindUserInfo: false
            })
            wx.navigateTo({
              url: that.data.pageUrl,
            })
            if (that.data.isHavePopupView) {
              that.setData({
                isHavePopupView: false
              })
            }
          } else {
            that.setData({
              showBindUserInfo: true
            })
          }
        }
      }, (error) => {
        that.userUpdata()
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
      showPhonepack: false,
      showBgpack: false,
    })
    // if(loginGetUserInfo){
    //   wx.showLoading({
    //     title: '加载中',
    //     mask: true,
    //   })
    //   wx.showTabBar()
    //   this.setData({
    //     showBgpack: false,
    //     showPhonepack: false,
    //   })
    //   this.accreditOperate()
    //   return
    // }else{
    //   this.setData({
    //     showBgpack: false,
    //     showPhonepack: false,
    //   })
    // }
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

  //用户数据更新
  userUpdata() {
    let wxUserInfo = wx.getStorageSync('wxUserInfo')
    let wxDetailUserInfo = wx.getStorageSync('wxDetailUserInfo')
    let promise = {
      openID: app.globalData.openid,
      wxname: wxUserInfo.nickName,
      wxsex: wxUserInfo.gender,
      headurl: wxUserInfo.avatarUrl,
      wxmobile: ''
    }
    if (wxDetailUserInfo.wxPhoneNumber != '') {
      promise.wxmobile = wxDetailUserInfo.wxPhoneNumber
    }
    $http(apiSetting.userUpdateUserInfo, promise).then((data) => {

    }, (error) => {
      console.log(error)
    });
  },
  //扫二维码绑定
  bindUserCity(scanningOption) {
    let param = {
      openId: app.globalData.openid,
      url: scanningOption
    };
    $http(apiSetting.bindUserCity, param).then((data) => {
      if (data.code == 0) {
        bindCityResult = data.data.name
        console.log("bindUserCity**" + data.code)
      }
    }, (error) => {
      console.log("bindUserCity**" + error)
    })
  },
  //滑动事件
  notouch() {
    return
  },
})