// pages/clients/client.js
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import util from '../../utils/util.js'
const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showRight: false,             //是否点击了筛选弹出右侧抽屉
    itemPakerIndex: null,         //所选项目下标
    dataIntervalStart:null,       //时间区间-开始时间
    dataIntervalEnd:null,         // 事件区间-结束时间

    peoplesArray:null,            //人数数组
    drawerList:[],                //筛选条目列表
    cityInfo:[],                  //城市列表
    itemInfo:[],                  //项目列表
    showItemInfo:[],              //要显示的项目列表
    recommendInfo: [],            //进度列表   
    planDefaultIndex:0,           //进度默认下标
    cityDefaultIndex: -1,         //城市默认下标

    recommendPersonList:[],     //推荐人信息列表
    _val:'',                    //搜索框临时数据

    /*
    筛选条件
    */
    selectList:{
      startRow: 1,        
      perRow: 10,
      searchType: "",                  //进度
      startDate: "",                   //开始时间
      endDate: "",                     //结束时间
      cityId: "",                      //城市id
      projectID: "",                   //项目id
      searchVal: "",                   //搜索框条件                
      openID: "" ,
    },    
    isPage: true                       //是否允许触底加载新页面
  },

  //项目选择
  bindPickerChange(e) {
    this.setData({
      itemPakerIndex: e.detail.value
    })
    this.setData({ 'selectList.projectID': this.data.showItemInfo[e.detail.value].projectId})
  },
  // 时间区间选择
  bindDateChangeStart(e) {
    let startDate = e.detail.value
    if (startDate > this.data.dataIntervalEnd) {
      wx.showToast({
        title: '请选择正确的开始时间!',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      dataIntervalStart: e.detail.value
    })
    this.setData({ 'selectList.startDate': e.detail.value})
  },
  bindDateChangeEnd(e) {
    let endDate=e.detail.value
    if (endDate < this.data.dataIntervalStart){
      wx.showToast({
        title: '请选择正确的结束时间!',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      dataIntervalEnd: e.detail.value
    })
    this.setData({ 'selectList.endDate': e.detail.value })
  },

  // 选择城市标签
  selCity(e){
    if (e.target.dataset.citytagid === undefined) return
    let tagId=e.target.dataset.citytagid
    let cityId = e.target.dataset.cityid
    let itemList = this.data.itemInfo
    let _arr=[]
    for (let i = 0; i < itemList.length;i++){
      if (cityId === itemList[i].cityId){
        _arr.push(itemList[i])
      }
    }
    this.setData({ showItemInfo:_arr})
    this.setData({ cityDefaultIndex: tagId, itemPakerIndex:-1})
    this.setData({ 'selectList.cityId': cityId, 'selectList.projectID':''})
  },
  //选择全部城市
  allCity(){
    this.setData({ cityDefaultIndex: -1, 'selectList.cityId': '', showItemInfo: this.data.itemInfo, itemPakerIndex: -1, 'selectList.projectID': ''})
  },
  // 选择进度标签
  selPlan(e) {
    if (e.target.dataset.plantagid===undefined) return
    let tagId = e.target.dataset.plantagid;
    this.setData({ planDefaultIndex:tagId })
    this.setData({ 'selectList.searchType': this.data.recommendInfo[tagId] })
  },
  // 重置
  reset(){
    //城市重置,进度
    this.setData({ cityDefaultIndex: -1, planDefaultIndex:0});
    // 项目重置
    this.setData({ itemPakerIndex: null})
    this.setData({ dataIntervalStart: null, dataIntervalEnd: null, showItemInfo: this.data.itemInfo, itemPakerIndex: -1})
    this.resetParameter();
  },
  // 确认筛选
  submit(){
    this.setData({ isPage: true})
    let promise = this.data.selectList
    promise.startRow=1
    promise.perRow=3
    if (!promise.searchType){
      promise.searchType='全部'
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.recommendFindCustomList, promise).then((data) => {
      if(data.code!==0) {
        if (data.code === -1) {
          this.setData({ recommendPersonList: [] })
          return
        }
      }
      let list = data.data
      this.setData({ recommendPersonList: this.cutDate(list) })
      // if(list.length>0){
      //   for (let i = 0; i < list.length; i++) {
      //     if (!list[i].lfDate) {
      //       list[i].rgDate = ''
      //       list[i].cjDate = ''
      //     } else if (list[i].lfDate && !list[i].rgDate) {
      //       list[i].cjDate = ''
      //     }
      //     if (list[i].tjDate.indexOf(' ') !== -1) {
      //       list[i].tjDate = list[i].tjDate.split(' ')[0]
      //     }
      //     if (list[i].lfDate.indexOf(' ') !== -1) {
      //       list[i].lfDate = list[i].lfDate.split(' ')[0]
      //     }
      //     if (list[i].rgDate.indexOf(' ') !== -1) {
      //       list[i].rgDate = list[i].rgDate.split(' ')[0]
      //     }
      //     if (list[i].cjDate.indexOf(' ') !== -1) {
      //       list[i].cjDate = list[i].cjDate.split(' ')[0]
      //     }
      //   }
      // }
      // this.setData({ recommendPersonList: list })
    }, (error) => {
      console.log(error)
    });
    this.setData({ showRight: false });
  },
  //搜索图标点击
  selItem(){
    let that=this
    that.setData({
      'selectList.searchVal': that.data._val, 
      'selectList.startRow': 1,
      'selectList.perRow': 3,
      isPage:true
       })
    let promise = this.data.selectList
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.recommendFindCustomList, promise).then((data) => {
      if (data.code !== 0) return
      let list=data.data
      
      // if(list.length>0){
      //   for (let i = 0; i < list.length; i++) {
      //     if (!list[i].lfDate) {
      //       list[i].rgDate = ''
      //       list[i].cjDate = ''
      //     } else if (list[i].lfDate && !list[i].rgDate) {
      //       list[i].cjDate = ''
      //     }
      //     if (list[i].tjDate.indexOf(' ') !== -1) {
      //       list[i].tjDate = list[i].tjDate.split(' ')[0]
      //     }
      //     if (list[i].lfDate.indexOf(' ') !== -1) {
      //       list[i].lfDate = list[i].lfDate.split(' ')[0]
      //     }
      //     if (list[i].rgDate.indexOf(' ') !== -1) {
      //       list[i].rgDate = list[i].rgDate.split(' ')[0]
      //     }
      //     if (list[i].cjDate.indexOf(' ') !== -1) {
      //       list[i].cjDate = list[i].cjDate.split(' ')[0]
      //     }
      //   }
      // }
      this.setData({ recommendPersonList: this.cutDate(list) })
    }, (error) => {
      console.log(error)
    });
  },
//报备
  toQuoteForClikc(){

  },
  //时间数据截取函数
  cutDate(list){
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (!list[i].lfDate) {
          list[i].rgDate = ''
          list[i].cjDate = ''
        } else if (list[i].lfDate && !list[i].rgDate) {
          list[i].cjDate = ''
        }
        if (list[i].tjDate.indexOf(' ') !== -1) {
          list[i].tjDate_time = list[i].tjDate.split(' ')[1]
          list[i].tjDate = list[i].tjDate.split(' ')[0]
        }
        if (list[i].lfDate.indexOf(' ') !== -1) {
          list[i].lfDate_time = list[i].lfDate.split(' ')[1]
          list[i].lfDate = list[i].lfDate.split(' ')[0]
        }
        if (list[i].rgDate.indexOf(' ') !== -1) {
          list[i].rgDate_time = list[i].rgDate.split(' ')[1]
          list[i].rgDate = list[i].rgDate.split(' ')[0]
        }
        if (list[i].cjDate.indexOf(' ') !== -1) {
          list[i].cjDate_time = list[i].cjDate.split(' ')[1]
          list[i].cjDate = list[i].cjDate.split(' ')[0]
        }
      }
    }
    return list
  },
  //文本框监听
  valueChange(e){
    this.setData({ _val: e.detail.value})
  },

  // 遮罩弹出
  toggleRight() {
    this.setData({
      showRight: true
    });
  },
  // 遮罩隐藏
  hideDrawer() {
    this.setData({
      showRight: false
    });
    // this.resetParameter();
  },
  //初始化请求参数
  resetParameter(){
    this.setData({
      'selectList.searchType': '',              //进度
      'selectList.startDate': '',               //开始时间
      'selectList.endDate': '',                 //结束时间
      'selectList.cityId': '',                  //城市id
      'selectList.projectID': '',               //项目id
      'selectList.searchVal': '',               //搜索框条件     
      'selectList.startRow': 1, 
      'selectList.perRow': 3,
    })
    this.setData({ _val:''})
    this.setData({
      isPage: true,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    this.setData({ 'selectList.openID': app.globalData.openid })
    this.findCustomList()
    this.getRecommendItemList()
    this.findRecommendPerson()
  },

  //获取推荐人状态信息
  findCustomList(){
    let that=this
    let promise = this.data.selectList
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.recommendFindCustomList, promise).then((data) => {
      let customList = []
      if (data.data!=null && data.data.length>0){
        customList = [...that.data.recommendPersonList,...data.data]
      }else{
        that.data.isPage = false
        wx.hideLoading()
        return
      }
      let list = customList
      this.setData({ recommendPersonList: this.cutDate(list)})
      wx.hideLoading()
    }, (error) => {
      console.log(error)
    });
  },
  //推荐客户人数
  findRecommendPerson(){
    let promise = { openID: app.globalData.openid}
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.recommendFindRecommendPerson, promise).then((data) => {
      let peopleNum = data.data
      for (let prop in peopleNum){
        if (!Number(peopleNum[prop])){
          peopleNum[prop]=0
        }
      }
      this.setData({ peoplesArray: peopleNum})
    }, (error) => {
      console.log(error)
    });
  },
  //筛选条目获取
  getRecommendItemList(){
    // let promise = { openID: "oGKIT0VEMi_ekApgB46JTUD2Ktx8"}
    let promise = { openID: app.globalData.openid }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.recommendItemList, promise).then((data) => {
      if(!data.data) return
      let cityInfo = data.data.cityInfo.filter(item => item)
      let itemInfo = data.data.itemInfo.filter(item => item)
      this.setData({
        cityInfo: cityInfo,
        itemInfo: itemInfo,
        showItemInfo: itemInfo,
        recommendInfo: data.data.recommendInfo
      })
    }, (error) => {
      console.log(error)
    });
  },
  //跳转推荐页面
  // goRecommend(){
  //   wx.navigateTo({
  //     url: '../recommend/recommend',
  //   })
  // },

  goRecommend: util.throttle(function(){
    wx.navigateTo({
      url: '../recommend/recommend',
    })
  },1500),

  // 页面到达底部
  onReachBottom() {
    // 判断是否翻页
    if (this.data.isPage) {
      this.data.selectList.startRow++
      this.findCustomList()
    }
  },
})