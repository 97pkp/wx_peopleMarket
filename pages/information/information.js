// pages/information/information.js
import apiSetting from '../../http/apiSetting.js'
import $http from '../../http/http.js'
import fileUrl from '../../http/fileServeUrl.js'
const app = getApp()

Page({
  data: {
    defaultImg: '../../images/defaultImg.png',    
    showBgpack: false,       // 授权窗口
    //视频路径
    videoPath:'',
    isFullView:false,       //视频全屏播放
    isVideo:false,          //显示视频
    imgVdoIndex:0,          //视频图片切换下标
    // 打开导航的需要参数
    mapInfo: {
      name: '',
      salesLongitude: '',
      salesLatitude: '',
      salesAddress:'',
      showLongitude: '',
      showLlatitude: '',
      showAddress:'',
    },
    project_id:'',
    optionsObj: null,       //首页传递的参数
    imgpath: fileUrl,       //图片根路径
    isAttention: false,     //是否关注
    imgUrls: [],            //轮播图列表 
    bannerlength: 0,        //轮播图个数
    bannerindex: 0,         //轮播下标
    visible2: false,        //主力均价提示框
    ishaveall: false,       //是否大于5条亮点
    islookall: false,       //是否查看全部亮点
    autoplay: false,
    interval: 5000,
    duration: 1000,
    
    mainpriceOrCommission: 0, //0代表显示主力均价提示，1表示佣金规则
    phone: '',                //联系我们-电话

    /*
      项目信息
     */
    
    projectname_cswx: '',
    /*案名（项目名）*/
    issale: '',
    /*在售状态，如（开盘）*/
    salesaddr: '',
    /*售楼地址*/
    showhall: '',
    /*展厅地址*/
    couponinfo: '',
    /*优惠信息*/
    mainprice: '',
    /*主力产品均价*/
    mainpriceType:1,
    pricetype:1,    
    /*价格类型，单价or总价*/
    mainpricedescription: '',
    /*主力产品均价后方价格说明详情*/
    mainhouseholdList: [],
    /*主力房型*/
    labelsList: [],
    /*卖点标签*/
    brightspotsList: [],
    /*楼盘亮点*/
    isbuildsimg: false,
    /*是否有楼盘图*/
    project_id: '',
    /*项目id*/
    city_id: '',
    /*城市id*/

    //楼盘主图,实景图,效果图,配套图,规划图字典
    buildsRequestArr: ['项目主图', '实景图', '效果图', '配套图', '规划图'],     
    //楼盘主图,实景图,效果图,配套图,规划图数据
    buildsimg: [
      {
        name: '实景图',
        imgs: []
      },
      {
        name: '效果图',
        imgs: []
      },
      {
        name: '配套图',
        imgs: []
      },
      {
        name: '规划图',
        imgs: []
      },
    ],

    /*
    项目详情
    */

    projectInfo: [],          //项目详情
    isMoreInfo: false,        //是否有更多详情
    projectInfoNum: 0,        //项目详情条数
    lightspot: '',            //亮点概述
    spots: 0,                 //亮点条数
    exemption: '',            //免责条款
    commissioninfo:'',        //佣金规则
    
    /*
      房型列表
    */

    hourselist: [],
    /*户型列表 */
    upload_file_path: '',
    /*房型图片*/
    caption: '98m² 舒适两居室',
    /*标题*/
    houserhold: '两室一厅一卫',
    /*户型*/
    price: '暂无定价',
    /*定价*/
    buyingpoint: '户型优势',
    /*户型优势*/
    area: '98m²',
    /*建筑面积*/
    category: '高层',
    /*产品类型*/
    decoration: '精装修',
    /*装修情况*/
    houserholdremark: '高端海景洋房，享受高端定制服务。',
    /*户型描述*/
    pointList: [], //房型优势列表
    hourserimglist: [], //房型图片列表

    /*
    关注请求数据
   */

    attentionList: {
      login_by: '',         //用户登录id
      project_id: '',       //项目id
    },
  },

  //点击播放视频
  startPlay(){
    this.videoContext = wx.createVideoContext('myvideo', this);
    this.videoContext.requestFullScreen({ direction: 0 });
    this.setData({ isFullView:true})
  },
  //监听进入退出全屏
  fullScreen(e){
    if (!e.detail.fullScreen){
      this.setData({ isFullView: false })
    }
  },
  //切换图片和视频
  selImgVdo(e){
    if (e.target.dataset.type==undefined) return
    if (e.target.dataset.type === 0) {
      this.setData({ bannerindex: e.target.dataset.type, isVideo:true})
    } else if (e.target.dataset.type === 1){
      this.setData({ bannerindex: e.target.dataset.type, isVideo:false })
    }
  },
  //获取展示视频
  getShowVideo(project_id){
    let that=this
    // let promise = { project_id: "19C0E48235E2498FBCC3CF73E4E388DB" }
    let promise = { project_id: project_id, picturetype:'视频'}
    $http(apiSetting.projectApiFindProjectVideoListById, promise).then((data) => {
      if (data.data.length){
        let videoList = data.data[0]
        if (videoList.upload_file_path) {
          that.setData({ videoPath: that.data.imgpath + videoList.upload_file_path, isVideo: true, auto: videoList.upload_file_path2})
        } else {
          that.setData({ videoPath: '', isVideo: false })
        }
      } else{
        that.setData({ videoPath: '', isVideo: false })
      }    
    }, (error) => {
      console.log(error)
    });
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
    if (!app.globalData.openid){
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          let promise = {
            code: res.code
          }
          let cityPromise = wx.getStorageSync("cityPromise") || []
          promise.currentCity = cityPromise.currentCity
          promise.positionCity = cityPromise.positionCity
          $http(apiSetting.userDecodeUserInfo, promise).then((data) => {
            app.globalData.token = data.data['vx-zhwx-token']
            app.globalData.openid = data.data.openid
            app.globalData.status = data.data.status
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
            this.onLoad(options)
          }, (error) => {
            console.log(error)
          });
        }
      })
    }else{
      /*
        首页传递项目id到详情页，并将项目id进行保存，并使用
      */
      this.data.optionsObj = options
      let project_id = options.project_id          //index-->information 项目id
      this.setData({ project_id: project_id })

      //对关注接口的请求参数进行赋值
      this.setData({
        'attentionList.login_by': app.globalData.userId,
        'attentionList.project_id': project_id
      })
      this.getProjectInfo(project_id);            // 通过id获取项目信息
      this.getProjectDetails(project_id)          //通过id获取项目详情
      this.getProjectHouserholdList(project_id);  //通过id查询户型列表
      this.getHourseImgList(project_id);          //通过类型查询楼盘图
      this.getClauseAndRule();                    //获取免责条款
      this.isAttentionProject();                  //判断是否关注项目
      this.getShowVideo(project_id);              //获取展示视频
    }
  },
  //查询免责条款
  getClauseAndRule() {
    let promise1 = {
      dictname: '免责条款'
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise1.currentCity = cityPromise.currentCity
    promise1.positionCity = cityPromise.positionCity
    promise1.loginby = app.globalData.userId
    $http(apiSetting.projectApiFindOtherDictValues, promise1).then((data) => {
      this.setData({
        exemption: data.data
      })
    }), (error) => {
      console.log(error)
    }
  },

//通过类型查询楼盘图列表
  getHourseImgList(id){
    let promiseTypeIndex=0
    let promise = {
      picturetype: this.data.buildsRequestArr[promiseTypeIndex],
      project_id:id
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.projectApiFindProjectImagesListByType, promise).then((data) => {
      let _arrBannerImg=data.data
      let _arrBannerImg2=[]
      if (_arrBannerImg.length>0){
        for (let i = 0; i < _arrBannerImg.length; i++) {
          if (_arrBannerImg[i].upload_file_path == undefined || _arrBannerImg[i].upload_file_path == null) {
            continue
          } else {
            _arrBannerImg2.push(_arrBannerImg[i].upload_file_path)
          }
        }
      }else{
        _arrBannerImg2 = [this.data.defaultImg]
      }
      
      for (let i = 0; i < _arrBannerImg2.length;i++){
        _arrBannerImg2[i] = this.data.imgpath + _arrBannerImg2[i]
      }
      this.resetBanner(_arrBannerImg2)
      promiseTypeIndex++
      promise.picturetype = this.data.buildsRequestArr[promiseTypeIndex]
      return $http(apiSetting.projectApiFindProjectImagesListByType, promise)
    }).then((data) => {
      let _arrSJImg=data.data
      let _arrSJImg2=[]
      for (let i = 0; i < _arrSJImg.length;i++){
        if (_arrSJImg[i].upload_file_path == undefined || _arrSJImg[i].upload_file_path == null) {
          continue
        } else {
          _arrSJImg2.push(_arrSJImg[i].upload_file_path)
        }
      }
      for (let i = 0; i < _arrSJImg2.length; i++) {
        _arrSJImg2[i] = this.data.imgpath + _arrSJImg2[i]
      }
      this.setData({ 'buildsimg[0].imgs': _arrSJImg2 })
      promiseTypeIndex++
      promise.picturetype = this.data.buildsRequestArr[promiseTypeIndex]
      return $http(apiSetting.projectApiFindProjectImagesListByType, promise)
    }).then((data)=>{
      let _arrXGImg=data.data
      let _arrXGImg2=[]
      for (let i = 0; i < _arrXGImg.length; i++) {
        if (_arrXGImg[i].upload_file_path == undefined || _arrXGImg[i].upload_file_path == null) {
          continue
        } else {
          _arrXGImg2.push(_arrXGImg[i].upload_file_path)
        }
      }
      for (let i = 0; i < _arrXGImg2.length; i++) {
        _arrXGImg2[i] = this.data.imgpath + _arrXGImg2[i]
      }
      this.setData({ 'buildsimg[1].imgs': _arrXGImg2 })
      promiseTypeIndex++
      promise.picturetype = this.data.buildsRequestArr[promiseTypeIndex]
      return $http(apiSetting.projectApiFindProjectImagesListByType, promise)
    }).then((data)=>{
      let _arrPTImg=data.data
      let _arrPTImg2=[]
      for (let i = 0; i < _arrPTImg.length; i++) {
        if (_arrPTImg[i].upload_file_path == undefined || _arrPTImg[i].upload_file_path == null) {
          continue
        } else {
          _arrPTImg2.push(_arrPTImg[i].upload_file_path)
        }
      }
      for (let i = 0; i < _arrPTImg2.length; i++) {
        _arrPTImg2[i] = this.data.imgpath + _arrPTImg2[i]
      }
      this.setData({ 'buildsimg[2].imgs': _arrPTImg2 })
      promiseTypeIndex++
      promise.picturetype = this.data.buildsRequestArr[promiseTypeIndex]
      return $http(apiSetting.projectApiFindProjectImagesListByType, promise)
    }).then((data)=>{
      let _arrGHImg=data.data
      let _arrGHImg2=[]
      for (let i = 0; i < _arrGHImg.length; i++) {
        if (_arrGHImg[i].upload_file_path == undefined || _arrGHImg[i].upload_file_path == null) {
          continue
        } else {
          _arrGHImg2.push(_arrGHImg[i].upload_file_path)
        }
      }
      for (let i = 0; i < _arrGHImg2.length; i++) {
        _arrGHImg2[i] = this.data.imgpath + _arrGHImg2[i]
      }
      this.setData({ 'buildsimg[3].imgs': _arrGHImg2 })
      let _buildArr = this.data.buildsimg
      for (let i = 0; i < _buildArr.length;i++){
        if (!_buildArr[i].imgs.length){
          _buildArr.splice(i,1)
          i--
        }
      }
     
      this.setData({ buildsimg: _buildArr})
    }).then(()=>{
      this.isHaveBuildsImg(this.data.buildsimg)
      wx.hideLoading()
    }), (error) => {
      console.log(error)
    }
  },

  //通过id获取户型图片列表
  getProjectHouserholdFileList(id) {
    let promise = {
      houserhold_id: id
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    promise.project_id = this.data.project_id
    $http(apiSetting.projectApiFindProjectHouserholdFileListById, promise).then((data) => {
      let imgArr = data.data[0]
      if (imgArr) {
        this.setData({
          upload_file_path: this.data.imgpath+imgArr.upload_file_path
        })
      } else {
        this.setData({
          upload_file_path: ''
        })
      }
    }), (error) => {
      console.log(error)
    }
  },
  //通过id查询户型列表
  getProjectHouserholdList(id) {
    let promise = {
      project_id: id
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.projectApiFindProjectHouserholdListById, promise).then((data) => {
      let hourserholdlist = data.data[0];
      if (!hourserholdlist) return
      this.setData({
        hourselist: data.data,                         
        caption: hourserholdlist.caption,
        houserhold: hourserholdlist.houserhold,
        buyingpoint: hourserholdlist.buyingpoint,
        area: hourserholdlist.area,
        category: hourserholdlist.category,
        decoration: hourserholdlist.decoration,
        pricetype: hourserholdlist.pricetype,
        houserholdremark: hourserholdlist.houserholdremark,
      })
      if (hourserholdlist.price){
        this.setData({ price: parseInt(hourserholdlist.price)})
      }
     
      //截取亮点标签
      this.setData({
        pointList: hourserholdlist.buyingpoint.split(',')
      })
      //通过户型id请求户型图片
      this.getProjectHouserholdFileList(hourserholdlist.id);
    }), (error) => {
      console.log(error)
    }
  },

  //通过id获取项目详情
  getProjectDetails(id) {
    let promise = {
      project_id: id
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby = app.globalData.userId
    $http(apiSetting.projectApiFindProjectDetailsById, promise).then((data) => {
      let projectdetails = data.data
      if (!projectdetails) return
      this.setData({
        lightspot: projectdetails.highlights,               //亮点概述信息
        commissioninfo: projectdetails.commissioninfo       //佣金规则
      })
      //项目详情列表
      let _projectInfo = []
      _projectInfo.push({
          name: '开发商',
          value: projectdetails.developer
        }, {
          name: '物业公司',
          value: projectdetails.propertycompany
        }, {
          name: '开盘时间',
          value: projectdetails.opening_date
        }, {
          name: '交房时间',
          value: projectdetails.delivery_date
        }, {
          name: '产权年限',
          value: projectdetails.years
        }, {
          name: '建筑类别',
          value: projectdetails.buildingtype
        }, {
          name: '装修状态',
          value: projectdetails.isup
        }, {
          name: '物业费',
          value: projectdetails.propertyexpenses 
        },
        {
          name: '所属区县',
          value: projectdetails.district
        }, {
          name: '建筑面积',
          value: projectdetails.floorarea
        }, {
          name: '主面积',
          value: projectdetails.mainarea
        }, {
          name: '绿化情况',
          value: projectdetails.greencoverage
        }, {
          name: '建筑规划',
          value: projectdetails.panning
        }, {
          name: '咨询电话',
          value: projectdetails.phone
        }, {
          name: '容积率',
          value: projectdetails.plotratio
        }, {
          name: '预售许可证',
          value: projectdetails.presalepermit
        }, {
          name: '楼盘地址',
          value: projectdetails.projectaddr
        }, {
          name: '物业类别',
          value: projectdetails.propertytype
        }, )
      //筛选有值的详情项
      let _arr = []
      for (let i = 0; i < _projectInfo.length; i++) {
        if (_projectInfo[i].value && _projectInfo[i].value !== 'null') {
          //截掉开盘时间字段中的时分秒
          if(i===2||i===3){
            if (_projectInfo[i].value.indexOf(' ') != -1) {
              _projectInfo[i].value = _projectInfo[i].value.split(' ')[0]
            }
          }
          _arr.push(_projectInfo[i])
        }
      }     
      //判断符合的数量，大于8个即产生'查看更多'
      if (_arr.length > 8) {
        this.setData({
          isMoreInfo: true,
          projectInfoNum: 8
        })
      } else {
        this.setData({
          isMoreInfo: false,
          projectInfoNum: 8
        })
      }
      //地图名和售楼处及展厅经纬度
      this.data.mapInfo.name = data.data.projectname_cswx
      this.data.mapInfo.salesLongitude = data.data.salesaddry
      this.data.mapInfo.salesLatitude = data.data.salesaddrx
      this.data.mapInfo.salesAddress = data.data.salesaddr
      this.data.mapInfo.showLongitude = data.data.showhally
      this.data.mapInfo.showLlatitude = data.data.showhallx
      this.data.mapInfo.showAddress = data.data.showhall

      this.setData({
        projectInfo: _arr,                          //项目详情列表
        phone: projectdetails.phone,                //联系电话
        projectname_cswx: projectdetails.projectname_cswx    //项目名
      })

      this.stopRefresh()
    }), (error) => {
      console.log(error)
      this.stopRefresh()
    }
  },

  // 通过id获取项目信息
  getProjectInfo(id) {
    let promise = {
      project_id: id
    }
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    promise.loginby= app.globalData.userId
    $http(apiSetting.projectApiFindProjectInfoById, promise).then((data) => {
      let projectinfo = data.data
      if (!projectinfo) return
      this.getSpotLength(projectinfo.brightspotsList)            //获取亮点条数
      if (projectinfo.mainprice){
        if (projectinfo.mainprice.indexOf('.')!==-1){
          this.setData({ mainprice: projectinfo.mainprice.split('.')[0]})
        }
      }
      this.setData({
        project_id: projectinfo.id,
        issale: projectinfo.issale,
        salesaddr: projectinfo.salesaddr,
        showhall: projectinfo.showhall,
        couponinfo: projectinfo.couponinfo,
        mainpricedescription: projectinfo.mainpricedescription,
        mainhouseholdList: projectinfo.mainhouseholdList,
        labelsList: projectinfo.labelsList,
        mainpriceType: projectinfo.mainpriceType,
        city_id: projectinfo.city
      })
      //判断亮点信息是否为空，并筛选有数据的项
      let _arr=[]
      for (let i = 0; i < projectinfo.brightspotsList.length;i++){
        if (projectinfo.brightspotsList[i].remark !== null && projectinfo.brightspotsList[i].remark !== undefined && projectinfo.brightspotsList[i].remark !== ''){
          _arr.push(projectinfo.brightspotsList[i])
        }
      }
      this.setData({ brightspotsList:_arr})
    }, (error) => {
      console.log(error)
    });
  },
  // 查看更多户型，跳转到户型列表页
  goHousetype() {
    wx.navigateTo({   
      url: '../housestype/housestype?project_id=' + this.data.project_id + '&&projectname_cswx=' + this.data.projectname_cswx,
    })
  },

  //判断是否有楼盘图
  isHaveBuildsImg(data) {
    let _arr = []
    for (let i = 0; i < data.length; i++) {
      if (!data[i].imgs.length) continue
      _arr.push('1')
    }
    if (_arr.length === 0) {
      this.setData({
        isbuildsimg: false
      })
    } else {
      this.setData({
        isbuildsimg: true
      })
    }
  },
  //楼盘图查看更多事件
  goBuildimg(e) {
    let obj = this.data.imgUrls
    let bannerObj = { name: '项目主图', imgs: this.data.imgUrls}
    let _imgArr = JSON.parse(JSON.stringify(this.data.buildsimg))      //切除引用关系
    _imgArr.unshift(bannerObj)
    let _t=0
    let selIndex = e.currentTarget.dataset.selindex;
    wx.navigateTo({
      url: '../houseimg/houseimg?buildsimg=' + JSON.stringify(_imgArr) + "&&selIndex=" + selIndex
    })
  },


  //关注 按钮事件
  toAttention() {
    this.setData({
      isAttention: !this.data.isAttention
    })
    if (this.data.isAttention) {   //isAttention为true,则发起关注请求
      let promise = this.data.attentionList
      let cityPromise = wx.getStorageSync("cityPromise")
      promise.currentCity = cityPromise.currentCity
      promise.positionCity = cityPromise.positionCity
      $http(apiSetting.projectApiInsertMyConc, promise).then((data) => {
        
      }, (error) => {
        console.log(error)
      });
    } else {   //isAttention为false,则发起取消关注请求
      let promise = this.data.attentionList
      let cityPromise = wx.getStorageSync("cityPromise")
      promise.currentCity = cityPromise.currentCity
      promise.positionCity = cityPromise.positionCity
      $http(apiSetting.projectApiUpdateMyConc, promise).then((data) => {
        console.log(data)
      }, (error) => {
        console.log(error)
      });
    }
  },
  //判断是否已经关注
  isAttentionProject() {
    let promise = this.data.attentionList
    let cityPromise = wx.getStorageSync("cityPromise")
    promise.currentCity = cityPromise.currentCity
    promise.positionCity = cityPromise.positionCity
    $http(apiSetting.projectApiUpdateMyConc, promise).then((data) => {
      if (data.code === -1) {    //返回值为-1，表示项目暂时没有被关注
        this.setData({
          isAttention: false
        })
      } else {
        $http(apiSetting.projectApiInsertMyConc, promise).then((data) => { //返回值为0，表示已经被关注，取消后发起请求重新关注
          if (data.data) {
            this.setData({
              isAttention: true
            })
          }
        }, (error) => {
          console.log(error)
        });
      }
    }, (error) => {
      console.log(error)
    });
  },

  // 主力均价提示 
  handleOpen2(e) {
    let type = e.currentTarget.dataset.type
    if (type === 0) {
      this.setData({
        mainpriceOrCommission: 0
      })
    }
    if (type === 1) {
      this.setData({
        mainpriceOrCommission: 1
      })
    }
    this.setData({
      visible2: true
    });
  },
  handleClose2() {
    this.setData({
      visible2: false
    });
  },
  // 查看全部
  lookAll() {
    this.setData({
      islookall: !this.data.islookall
    })
  },
  // 初始化轮播图
  resetBanner(url) {
    this.setData({
      imgUrls: url
    })
    //初始化轮播展示图数量
    this.setData({
      bannerlength: this.data.imgUrls.length
    }) 
  },
  //图片轮播
  bannerChange(e) {
    let current = e.detail.current
    let source = e.detail.source
    if (source != "touch") return
    if (current === 0 && this.data.videoPath!=''){
      this.setData({isVideo:true})
    }else{
      this.setData({ isVideo: false })
    }
    this.setData({
      bannerindex: current
    })
  },
  //查看更多详细信息
  getMoreInfo() {
    this.setData({
      isMoreInfo: false,
      projectInfoNum: this.data.projectInfo.length
    })
  },
  //判断亮点条数
  getSpotLength(list) {
    let spots = list.length
    if (spots > 4) {
      ishaveall: true
      this.setData({
        ishaveall: true,
        spots: 4
      })
    }
    else {
      this.setData({
        spots: spots
      })
    }
  },
  
  //去推荐
  goRecommend() {
    wx.navigateTo({
      url: '../recommend/recommend?project_id=' + this.data.project_id,
    })
  },

  toPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone
    })
  },
 

  //点击导航，判断授权
  pageToMap(e) {
    let that=this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.openSetting({
            success(res) {
              if (!res.authSetting['scope.userLocation']) {
                return
              } else {
                that.openMapInWx(e.target.dataset.type)
              }
            }
          })
        } else {
          that.openMapInWx(e.target.dataset.type)
        }
      }
    })
  },
  //打开内置地图
  openMapInWx(type){
    let that=this
    if (type == 1) {
      if (!this.data.mapInfo.salesLatitude || !this.data.mapInfo.salesAddress ){
        return
      }
      wx.getLocation({
        type: 'wgs84',
        success: (res) => {
          var latitude = res.latitude
          var longitude = res.longitude
          wx.openLocation({
            latitude: Number(that.data.mapInfo.salesLatitude),
            longitude: Number(that.data.mapInfo.salesLongitude),
            name: that.data.mapInfo.name,
            address: that.data.mapInfo.salesAddress,
            scale: 5
          })
        },
        fail:(err)=>{
          wx.showToast({
            title: '请检查您的设备是否开启定位',
            icon:'none'
          })
          console.log(err)
        }
      })
    }
    if (type == 2) {
      if (!this.data.mapInfo.showLlatitude || !this.data.mapInfo.showLongitude) {
        return
      }
      wx.getLocation({
        type: 'wgs84',
        success: (res) => {
          var latitude = res.latitude
          var longitude = res.longitude
          wx.openLocation({
            latitude: Number(that.data.mapInfo.showLlatitude),
            longitude: Number(that.data.mapInfo.showLongitude),
            name: that.data.mapInfo.name,
            address: that.data.mapInfo.showAddress,
            scale: 5
          })
        },
        fail: (err) => {
          wx.showToast({
            title: '请检查您的设备是否开启定位',
            icon: 'none'
          })
          console.log(err)
        }
      })
    }
  },
//滑动bug
  stopMove(){
    return
  },
  //户型图片错误
  erroImage1(e){
    if (e.type == 'error') {
      this.data.upload_file_path = this.data.defaultImg
      this.setData({
        upload_file_path: this.data.upload_file_path
      })
    }
  },
  //项目主图错误
  erroImage2(e){
    if (e.type == 'error') {
      this.data.imgUrls[e.target.dataset.index] = this.data.defaultImg
      this.setData({
        imgUrls: this.data.imgUrls
      })
    }
  },
  //楼盘图错误
  erroImage3(e){
    let index = e.target.dataset.index
    let name = e.target.dataset.name
    if (e.type == 'error') {
      let _buildsimgArr = this.data.buildsimg
      for (let i = 0; i < _buildsimgArr.length;i++){
        if (_buildsimgArr[i].name==name){
          let t = 'buildsimg[' + i + '].imgs['+index+']'
          this.setData({
            [t]: this.data.defaultImg
          })
        }
      }

      // if(name=='实景图'){
      //   this.data.buildsimg[0].imgs[index] = this.data.defaultImg
      //   this.setData({
      //     'buildsimg[0]': this.data.buildsimg[0]
      //   })
      // }
      // else if(name=='效果图'){
      //   this.data.buildsimg[1].imgs[index] = this.data.defaultImg
      //   this.setData({
      //     'buildsimg[1]': this.data.buildsimg[1]
      //   })
      // } 
      // else if (name == '配套图') {
      //   this.data.buildsimg[2].imgs[index] = this.data.defaultImg
      //   this.setData({
      //     'buildsimg[2]': this.data.buildsimg[2]
      //   })
      // }
      //   else if (name == '规划图') {
      //   console.log("规划图:",this.data.buildsimg)
      //   this.data.buildsimg[3].imgs[index] = this.data.defaultImg
      //   this.setData({
      //     'buildsimg[3]': this.data.buildsimg[3]
      //   })
      // }
    }
  },

  //转发
  onShareAppMessage:function(res) {
    let project_id = this.data.project_id         // 分享产品的project_id
    if (res.from === 'button') {                  // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '',
      path: `pages/information/information?project_id=${project_id} `,    // 分享后打开的页面
    }
  },



  // 下拉刷新
  onPullDownRefresh() {
    // 显示导航栏加载框
    wx.showNavigationBarLoading()
    this.onLoad(this.data.optionsObj)
  },
  // 停止刷新
  stopRefresh() {
    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
  }
})