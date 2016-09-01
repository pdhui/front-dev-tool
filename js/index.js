require('../css/index.less');
const _ = require('./utils.js');
const circleMenus = require('./circleMenus.js');

const devTool = {
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
  start(){
    this.coverImg = document.getElementById('visualImg');
    this.coverImgStyle = this.coverImg.style;
    this.cm = new circleMenus(document.querySelector('.menu-btn'),{
      menuList:[{value:'载入图片'},{value:'调整图片'}]
    });
    this.initEvent();
  }
};

devTool.start();