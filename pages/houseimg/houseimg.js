// pages/houseimg/houseimg.js
import fileUrl from '../../http/fileServeUrl.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgpath: fileUrl,        //图片根路径
    selItem: 0,              //默认选中第一项
    buildImgList:[],         //楼盘图片列表

    //swiper参数
    indicatorDots: false,
    autoplay: false,
    interval: 100,
    duration: 100,
    imgCurrent:0,   //当前图片下标
    startX:0 ,      //图片滑动开始x坐标
    endX:0,         //图片滑动结束x坐标
  },
  // 户型图切换
  selImg(e){
    let num = e.currentTarget.dataset.num;
    this.setData({ selItem:num})
    if (this.data.imgCurrent===0) return
    this.setData({imgCurrent:0})
  },
  // 获取大图
  getBigImg(e){
    let imgIndex=e.currentTarget.dataset.imgindex
    let imgList = e.currentTarget.dataset.imglist
    for(let i=0;i<imgList.length;i++){
      imgList[i] = imgList[i]
    }
    let current = imgList[imgIndex]
    wx.previewImage({
      current: current,     // 当前显示图片的http链接
      urls: imgList         // 需要预览的图片http链接列表
    })
  },
  
  //项目图册外层图片滑动
  changeImg(e){
    if(this.data.selItem!==e.target.dataset.selitem) return
    this.setData({ imgCurrent: e.detail.current})
  },
  imgTouchStart(e){
    this.setData({ startX: e.changedTouches[0].pageX})
  },
  imgTouchEnd(e){
    let imgCurrent = this.data.imgCurrent
    let selItem = this.data.selItem
    this.setData({ endX: e.changedTouches[0].pageX})
    if (this.data.endX - this.data.startX < -100) {
      if (imgCurrent === this.data.buildImgList[selItem].imgs.length - 1) {
        if (selItem + 1 < this.data.buildImgList.length) {
          selItem++
          this.setData({ selItem: selItem, imgCurrent: 0 })
        }
      }
    } else if (this.data.endX - this.data.startX > 100){
      if(imgCurrent===0){
        if (selItem>0){
          selItem--
          let _current = this.data.buildImgList[selItem].imgs.length
          this.setData({ selItem: selItem, imgCurrent: _current - 1 })
        }
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.selIndex !== "undefined"){
      this.setData({ selItem: Number(options.selIndex)+1})
    }else{
      this.setData({ selItem: 0 })
    }
    let arr = JSON.parse(options.buildsimg)
    let _arr=[]
    for(let i=0;i<arr.length;i++){
      if(arr[i].imgs.length){
        _arr.push(arr[i])
      }
    }
    this.setData({ buildImgList:_arr})
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  }
})