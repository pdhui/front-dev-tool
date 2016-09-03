require('../css/index.less');
const _ = require('./utils.js');
const circleMenus = require('./circleMenus.js');

const devTool = {
  opacitys:[1,0.8,0.5,0.3,0],
  currentOpacityIdx:0,
  initEvent(){
    document.querySelector('.imgfile').addEventListener('change',(e)=>{
      this.loadImg(e);
    },false);

    document.querySelector('.tool-list').addEventListener('click',(e)=>{
      var target = e.target,
          classList = target.classList;

      if(classList.contains('fillScreen')){
        var docWidth = document.documentElement.clientWidth,
            ratio = this.visualImgSize.width / this.visualImgSize.height;

        this.coverImgStyle.width = docWidth + 'px';
        this.coverImgStyle.height = docWidth / ratio + 'px';
      }else if(classList.contains('remainRes')){
        _.assign(this.coverImgStyle,{
          width: this.visualImgSize.width,
          height: this.visualImgSize.height
        });
      }
    },false);
  },
  dispatchEvent: function(e,menuid) {
    var target = e.target;

    if(menuid == 'fillScreen'){
      var docWidth = document.documentElement.clientWidth,
          ratio = this.visualImgSize.width / this.visualImgSize.height;

      this.coverImgStyle.width = docWidth + 'px';
      this.coverImgStyle.height = docWidth / ratio + 'px';
    }else if(menuid == 'remainRes'){
      _.assign(this.coverImgStyle,{
        width: this.visualImgSize.width,
        height: this.visualImgSize.height
      });
    }else if(menuid == 'loadImg'){
      document.querySelector('.imgfile').click();
    }else if(menuid == 'opacitySet'){
      this.currentOpacityIdx = (this.currentOpacityIdx + 1) % this.opacitys.length;
      this.coverImgStyle.opacity = this.opacitys[this.currentOpacityIdx];
    }
  },
  loadImg(e){
    var reader = new FileReader(),
      target = e.target;
    reader.onload = (e)=>{
      var result = e.target.result;
      var img = new Image();
      img.src = result;
      img.onload = (e)=>{
        var tg = e.target,
            visualImgStyle = document.getElementById('visualImg').style;

        _.assign(visualImgStyle,{
          backgroundImage: 'url(' + result + ')',
          width: tg.width,
          height: tg.height
        });
        this.visualImgSize = {width: tg.width, height: tg.height};
        img.onload = null;
        img = null;
      };
    };
    reader.readAsDataURL(target.files[0]);
  },
  init(){
    var container = document.createElement('div');
    container.innerHTML = '<dl class="tool-list">'+
        '<dd><div class="tool-menu">' +
        '<div class="menu-btn"></div>' +
        '<input type="file" class="imgfile">' +
        '</div> </dd></dl>';

    document.body.appendChild(container);
  },
  start(){
    this.init();
    this.coverImg = document.getElementById('visualImg');
    this.coverImgStyle = this.coverImg.style;
    this.cm = new circleMenus(document.querySelector('.menu-btn'),{
      menuList:[
        {
          value:'1载入图片',
          id: 'loadImg',
          click: this.dispatchEvent.bind(this)
        },
        {
          value:'2图片全屏',
          id: 'fillScreen',
          click: this.dispatchEvent.bind(this)
        },{
          value:'2保持图片原比例',
          id: 'remainRes',
          click: this.dispatchEvent.bind(this)
        },{
          value:'调整透明度',
          id: 'opacitySet',
          click: this.dispatchEvent.bind(this)
        }
      ]
    });
    this.initEvent();
  }
};

devTool.start();