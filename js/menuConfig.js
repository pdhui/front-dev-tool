module.exports = function getConfig(context) {

  function dispatchEvent(e,menuid){
    context.dispatchEvent(e,menuid);
  }

  return {
    size: 300,
    menuList:[
      {
        value:'载入图片',
        id: 'loadImg',
        click: dispatchEvent
      },{
        value:'设置图片大小',
        id: 'setSize',
        childMenus:[
          {
            id: 'fillScreen',
            value: '图片全屏',
            click: dispatchEvent
          },
          {
            id: 'remainRes',
            value: '保持图片原比例',
            click: dispatchEvent
          }
        ]
      },
      {
        value:'获取颜色值',
        id: 'getColor',
        click: dispatchEvent
      },{
        value:'调整透明度',
        id: 'opacitySet',
        childMenus:[
          {
            id: 'toggleShow',
            value: '关闭/隐藏',
            click: dispatchEvent
          },
          {
            id: 'fadeout',
            value: '增加透明度',
            click: dispatchEvent
          },
          {
            id: 'fadein',
            value: '减少透明度',
            click: dispatchEvent
          },
          {
            id: 'toggleTop',
            value: '置顶/默认',
            click: dispatchEvent
          }
        ]
      },
      {
        value:'参考线',
        id: 'guideLine',
        click: dispatchEvent,
        childMenus:[
          {
            id: 'createGuideLine',
            value: '新建',
            click: dispatchEvent
          },
          {
            id: 'deleteLastLine',
            value: '取消新建',
            click: dispatchEvent
          },
          {
            id: 'deleteAllLine',
            value: '删除所有参考线',
            click: dispatchEvent
          },
          {
            id: 'toggleLine',
            value: '隐藏/显示参考线',
            click: dispatchEvent
          },
          {
            id: 'toggleLineCoords',
            value: '隐藏/显示坐标值',
            click: dispatchEvent
          }
        ]
      }
    ]
  };
}