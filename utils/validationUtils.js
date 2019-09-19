/************正则验证**************** */
//禁止输入中文
 function checkZhReplace(obj){
   return obj = obj.replace(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/g, '');
};
//禁止输入表情包
function emojiReplace(obj){
  var emoji = new RegExp(/[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g);
  return obj = obj.replace(emoji,"");
};

module.exports = {
  checkZhReplace: checkZhReplace,
  emojiReplace: emojiReplace
}