/************正则验证**************** */
//禁止输入中文
 function checkZhReplace(obj){
   var checkZh = new RegExp("[\\u4E00-\\u9FFF]+", "g");
   if (checkZh.test(obj)){
        return false;
   }else{
     return true;
   }
};
//禁止输入表情包
function emojiReplace(obj){
  var emoji = new RegExp(/[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g);
  if (emoji.test(obj)) {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  checkZhReplace: checkZhReplace,
  emojiReplace: emojiReplace
}