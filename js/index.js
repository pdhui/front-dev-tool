require('../css/index.less');

const assign = function(){
  var temp = arguments[0];
  var args = [].slice.call(arguments, 1);
  for(var i=0,len=args.length;i<len;i++){
    var item = args[i];
    for(var p in item){
      if(item.hasOwnProperty(p)){
        temp[p] = item[p];
      }
    }
  }
  return temp;
};

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
        assign(this.coverImgStyle,{
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

        assign(visualImgStyle,{
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
    this.initEvent();
  }
};

devTool.start();