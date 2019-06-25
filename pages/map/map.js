// pages/map/map.js
// let QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
// let qqmapsdk;

import mapKey from '../../http/mapKey.js'

Page({
  data: {
    // 地图中心点
    // 经度
    longitude: 113.324520,
    // 纬度
    latitude: 23.099994,
    // 地图上显示的标记
    markers: [],
    //显示选择框
    showMapSel:false,
    //导航线坐标点
    polyline: [{
      points: [],
      color: '',
      width: 0,
      dottedLine: false
    }],
    //当前位置坐标
    nowLocation:{},
    isShowLine:false,   //是否显示导航路线
    renderOver:false,   //是否渲染完成

    mapName:'',       //导航名
    mapAddress:'',      //导航地址

  },
  //选择显示路线功能框
  selLine(){
    this.setData({ showMapSel: true})
  },
  //隐藏显示路线功能框
  cancelLine(){
    this.setData({ showMapSel: false})
  },
  //遮罩不点击
  noClick(){
    this.setData({ showMapSel: false})
  },
  //打开地图
  openMap(){
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        console.log(res)
        wx.openLocation({
          latitude: Number(that.data.latitude),
          longitude: Number(that.data.longitude),
          name: that.data.mapName,
          address: that.data.mapAddress,
          scale: 5
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  onLoad(option) {
    console.log(option)
    let mapInfo = JSON.parse(option.mapInfo)
    console.log(mapInfo)
    let that=this
    this.setData({ mapName: option.projectName, mapAddress: option.address})
    let mapObj = [{
      longitude: option.longitude,
      latitude: option.latitude,
      name: option.projectName,
    }]
    //设置页面标题
    wx.setNavigationBarTitle({
      title: option.projectName
    })
    this.setData({
      longitude: option.longitude,
      latitude: option.latitude,
      markers: mapObj
    })
    // this.canvasLocationLine()
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.openLocation({
          latitude: Number(that.data.latitude),
          longitude: Number(that.data.longitude),
          name: 'hehe',
          address: 'hehehe',
          scale: 5
        })
      }
    })
  },
  //显示路线
  showLine(){
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    this.canvasLocationLine()
    this.setData({ showMapSel: false, isShowLine: true})
  },
  //隐藏路线
  hideLine(){
    this.setData({'polyline.points':[]})
    this.setData({ showMapSel: false, isShowLine: false})
  },


  //绘制路径函数
  canvasLocationLine() {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        // wx.openLocation({
        //   latitude: Number(that.data.latitude),
        //   longitude: Number(that.data.longitude),
        //   name: that.data.mapName,
        //   address: that.data.mapAddress,
        //   scale: 5
        // })
        that.setData({
          nowLocation: {
            latitude: res.latitude,
            longitude: res.longitude,
            name:"我的位置"
          }
        })
        let markers = that.data.markers
        markers.push(that.data.nowLocation)
        that.setData({ markers: markers})
        // console.log(that.data.markers)
        // console.log('当前latitude:' + res.latitude)
        // console.log('当前longitude:' + res.longitude)
        // console.log('当前latitude同步结果:' + that.data.nowLocation.latitude)
        // console.log('当前longitude同步结果:' + that.data.nowLocation.longitude)
        /**********************  从腾讯地图WebService API请求导航路线坐标集合用于point_Array折线连接 */
        let nowLocation = String(res.latitude + ',' + res.longitude)
        let endLocation = String(that.data.latitude + ',' + that.data.longitude)
        wx.request({
          url: 'https://apis.map.qq.com/ws/direction/v1/driving/', //连接接口地址
          data: {
            from: nowLocation,
            to: endLocation,
            policy: 'REAL_TRAFFIC',   //结合路况的最优方式
            key: mapKey,
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            // console.log(res.data)
            // console.log('剩余距离：' + res.data.result.routes[0].distance + '米')
            // console.log('剩余时间：' + res.data.result.routes[0].duration + '分钟')
            // console.log('导航路线点串如下：')
            // console.log(res.data.result.routes[0].polyline)
            /**  获取返回的方案路线坐标点串并解压 */
            let coors = res.data.result.routes[0].polyline
            for (let i = 2; i < coors.length; i++) { coors[i] = coors[i - 2] + coors[i] / 1000000 }
            // console.log('路线坐标点串解压完毕!')
            // console.log('路线坐标点串解压结果如下：')
            // console.log(coors);
            /** 将解压后的坐标点串进行拼接成polyline想要的样子 */
            let coors_new = []  //记住微信小程序声明一个数组这样写
            for (let j = 0; j < coors.length; j++) {
              coors_new.push({
                latitude: parseFloat(coors[j]),
                longitude: parseFloat(coors[j + 1])
              })
              j++;
            }
            // console.log('路线坐标点串格式化完毕！')
            // console.log('路线坐标点串格式化结果如下：')
            // console.log(coors)
            // console.log('已经产生新的经纬度数组coors_new如下：')
            // console.log(coors_new)
            // console.log('路线坐标点串解压后一共：' + coors.length + '个')
            // console.log('路线坐标点串转换后一共：' + coors_new.length + '个')
            /**  开始同步路线坐标集合+剩余距离+剩余时间数据 */
            that.setData({
              now_Duration: res.data.result.routes[0].duration,   //剩余时间
              now_Distance: res.data.result.routes[0].distance,   //剩余距离
              polyline: [{
                points: coors_new,//指定一系列坐标点，从数组第一项连线至最后一项
                color: "#8889f8",
                width: 10,
                dottedLine: false,
                arrowLine:true
              }],
            })
            wx.hideLoading()
            // console.log('更新points经纬度数组如下：')
            // console.log(that.data.polyline[0].points)
            // console.log('更新polyline_Object如下：')
            // console.log(that.data.polyline)
            // console.log('当前剩余时间 now_Duration同步结果:' + that.data.now_Duration + '分钟')
            // console.log('当前剩余距离now_Distance同步结果:' + that.data.now_Distance + '米')
          }
        })
      }
    })
  },
})