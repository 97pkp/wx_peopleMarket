const serviceModule = {
  userDecodeUserInfo: {
    url: '/user/decodeUserInfo',
    method: 'post'
  },
  //新闻活动列表
  newsactivityFindNewsActivitys: {
    url: '/newsactivity/findWxNewsActivitys',
    method: 'post'
  },
  //查询某一项新闻活动
  newsactivityFindNewsActivityById: {
    url: '/newsactivity/findNewsActivityById',
    method: 'post'
  },
  //获取新闻活动缩略图
  newsactivityFindAttachRelationById: {
    url: '/newsactivity/findAttachRelationById',
    method: 'post'
  },
  //查询活动是否已经报名
  newsactivityFindMyEnrollActivityById: {
    url: '/newsactivity/findMyEnrollActivityById',
    method: 'post'
  },

  //活动报名
  newsactivityInsertActivityEnrollee: {
    url: '/newsactivity/insertActivityEnrollee',
    method: 'post'
  },
  //查询单个弹屏信息
  bombscreenFindBombScreenByCityId: {
    url: '/bombscreen/findBombScreenByCityId',
    method: 'post'
  },

  //查询是否是游戏用户
  userGetUserCity: {
    url: '/user/getUserCity',
    method: 'post'
  },

  cityFindBuildInfoByCity: {
    url: '/city/findBuildInfoByCity',
    method: 'post'
  },
  projectApiFindProjectListByCity: {
    url: '/projectApi/findProjectListByCity',
    method: 'post'
  },
  cityFindCityItems: {
    url: '/city/findCityItems',
    method: 'post'
  },
  userIdentifyUser: { //用户认证
    url: '/user/identifyUser',
    method: 'post'
  },
  userGetUserInfo: { //获取用户信息
    url: '/user/getUserInfo',
    method: 'post'
  },
  userUpdateUserInfo: { //更新用户信息
    url: '/user/updateUserInfo',
    method: 'post'
  },
  userGetCode: { //获取短信验证
    url: '/user/getCode',
    method: 'post'
  },
  userCheckSMSCode: { //短信校验
    url: '/user/checkSMSCode',
    method: 'post'
  },

  //获取海客中介用户
  userGetHaikeAgencyInfo: {
    url: '/user/getHaikeAgencyInfo',
    method: 'post'
  },
  //获取用户手机号
  userGetWxPhone: {
    url: '/user/getWxPhone',
    method: 'post'
  },

  // 推荐客户
  recommendAddAgencyCustom: {
    url: '/recommend/addAgencyCustom',
    method: 'post'
  },

  recommendGetHouseHoldType: {
    url: '/recommend/getHouseHoldType',
    method: 'post'
  },


  // 根据用户及经纪人类型获取渠道(废弃)
  // recommendFindCanalByUser: {
  //   url: '/recommend/findCanalByUser',
  //   method: 'post'
  // },

  // 获取楼盘列表
  recommendGetProjectList: {
    url: '/recommend/getProjectList',
    method: 'post'
  },
  //推荐-筛选条目
  recommendItemList: {
    url: '/recommend/itemList',
    method: 'post'
  },
  //推荐人信息状态
  recommendFindCustomList: {
    url: '/recommend/findCustomList',
    method: 'post'
  },
  //推荐客户人数
  recommendFindRecommendPerson: {
    url: '/recommend/findRecommendPerson',
    method: 'post'
  },
  //获取我要推荐页面数据
  recommendGetMyRecommendData: {
    url: '/recommend/getMyRecommendData',
    method: 'post'
  },
  // 获取全号隐号数据
  recommendGetRecommendItem: {
    url: '/recommend/getRecommendItem',
    method: 'post'
  },
  //获取城市列表
  recommendGetCityList: {
    url: '/recommend/getCityList',
    method: 'post'
  },

  //获取佣金信息(废弃)
  // recommendCommissionInfoList: {
  //   url: '/recommend/commissionInfoList',
  //   method: 'post'
  // },

  projectApiFindProjectInfoById: { //详情-获取项目信息
    url: '/projectApi/findProjectInfoById',
    method: 'post'
  },
  projectApiFindProjectDetailsById: { //详情-获取项目详情
    url: '/projectApi/findProjectDetailsById',
    method: 'post'
  },
  projectApiFindProjectHouserholdListById: { //详情-获取户型列表
    url: '/projectApi/findProjectHouserholdListById',
    method: 'post'
  },
  projectApiFindProjectHouserholdFileListById: { //详情-获取户型图片列表
    url: '/projectApi/findProjectHouserholdFileListById',
    method: 'post'
  },
  projectApiFindProjectImagesListByType: { //详情-获取楼盘图片列表
    url: '/projectApi/findProjectImagesListByType',
    method: 'post'
  },
  projectApiFindProjectVideoListById: { //详情-获取展示视频
    url: '/projectApi/findProjectVideoListById',
    method: 'post'
  },


  //添加我的关注
  projectApiInsertMyConc: {
    url: '/projectApi/insertMyConc',
    method: 'post'
  },
  //取消我的关注
  projectApiUpdateMyConc: {
    url: '/projectApi/updateMyConc',
    method: 'post'
  },
  // 查询我的关注项目列表
  projectApiFindProjectListByMyConc: {
    url: '/projectApi/findProjectListByMyConc',
    method: 'post'
  },

  // 查询经纪人类型，免责条款，佣金规则 参数{'dictname':'经纪人类型'}
  projectApiFindOtherDictValues: {
    url: '/projectApi/findOtherDictValues',
    method: 'post'
  },

  // 经纪人使用帮助、经纪人使用须知、当前版本
  projectApiFindSettingDict: {
    url: '/projectApi/findSettingDict',
    method: 'post'
  },
  //获取优惠券列表
  apiCouponCouponForCityList: {
    url: '/api/coupon/couponForCityList',
    method: 'post'
  },
  //领取卡券
  apiCouponGetCoupon: {
    url: '/api/coupon/getCoupon',
    method: 'post'
  },
  //我的优惠券列表
  apiCouponList: {
    url: '/api/coupon/receivedList',
    method: 'post'
  },
  //添加围观人数
  apiAddOnlookers: {
    url: '/user/addViewlog',
    method: 'post'
  },
  // 围观人数列表
  apiOnlookersList: {
    url: '/user/queryViewlog',
    method: 'post'
  },
  // 扫二维码
  bindUserCity: {
    url: '/user/bindUserCity',
    method: 'post'
  },
  // 推荐检测
  checkCustomInfo: {
    url: '/recommend/checkCustomInfo',
    method: 'post'
  },
}
const ApiSetting = {
  ...serviceModule
}

export default ApiSetting