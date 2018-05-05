const mainStyleCss = require('../css/index.less');
const _ = require('./utils.js');
const Point = require('./Point.js');
const getMenuConfig = require('./menuConfig.js');
const circleMenus = require('./circleMenus.js');
const guideLinePlugin = require('./GuideLinePlugin.js');
require('./tap.js');

const devTool = {
  isMobile: (function(){
    var ua = navigator.userAgent;
    return ua.indexOf('Mobile') > -1 || ua.indexOf('Android') > -1;
  })(),
  opacitys:[1,0.8,0.5,0.3,0],
  currentOpacityIdx:0,
  isLoad: false,
  dispatchEvent: function(e,menuid) {
    var target = e.target,
        cvasW = this.canvasWidth,
        cvasH = this.canvasHeight;

    if(menuid == 'fillScreen'){
      var docWidth = document.documentElement.clientWidth,
          ratio = this.visualImgSize.width / this.visualImgSize.height;

      this.coverImgStyle.width = docWidth + 'px';
      this.coverImgStyle.height = docWidth / ratio + 'px';

      this.caculateCanvas();

      guideLinePlugin.resizeGuideLine(cvasW,cvasH);
    }else if(menuid == 'remainRes'){
      _.assign(this.coverImgStyle,{
        width: this.visualImgSize.width + 'px',
        height: this.visualImgSize.height + 'px'
      });
      this.caculateCanvas();
      guideLinePlugin.resizeGuideLine(cvasW,cvasH);
    }else if(menuid == 'loadImg'){
      document.querySelector('.imgfile').click();
    }else if(menuid == 'toggleShow'){
      var opacity = this.coverImgStyle.opacity;
      if(opacity > 0 || opacity === '')
        this.coverImgStyle.opacity = 0;
      else
        this.coverImgStyle.opacity = 1;
    }else if(menuid == 'fadeout'){
      this.currentOpacityIdx = (this.currentOpacityIdx + 1) % this.opacitys.length;
      this.coverImgStyle.opacity = this.opacitys[this.currentOpacityIdx];
    }else if(menuid == 'fadein'){
      this.currentOpacityIdx = Math.max(this.currentOpacityIdx - 1, 0);
      this.coverImgStyle.opacity = this.opacitys[this.currentOpacityIdx];
    }else if(menuid == 'getColor'){
      this.createColorPanel();
    }else if(menuid == 'createGuideLine'){
      guideLinePlugin.createGuideLine();
    }else if(menuid == 'deleteLastLine'){
      var guideLine = document.querySelectorAll('.guide-line:last-child');
      if(guideLine){
        guideLine[0].remove();
        guideLinePlugin.linePoints.pop();
      }
    }else if(menuid == 'deleteAllLine'){
      var guideLines = _.toArray(document.querySelectorAll('.guide-line'));
      guideLines.forEach((item)=>{
          item.remove();
      });
      guideLinePlugin.linePoints = [];
    }else if(menuid == 'toggleLine'){
      var guideLines = _.toArray(document.querySelectorAll('.guide-line'));

      guideLines.forEach((item)=>{
          if(this.isShowGuideLine){
            item.style.display = 'none';
          }else{
            item.style.display = 'block';
          }
      });
      this.isShowGuideLine = !this.isShowGuideLine;
    }else if(menuid == 'toggleLineCoords'){
      guideLinePlugin.toggleLineCoords();
    }else if(menuid == 'toggleTop'){
      if(this.coverImgStyle.zIndex < 9010){
        this.coverImgStyle.zIndex = 9010;
      }else{
        this.coverImgStyle.zIndex = 0;
      }
    }
    e.stopPropagation();
  },
  loadImg(e){
    var reader = new FileReader(),
      target = e.target;
    reader.onload = (e)=>{
      var result = e.target.result;
      var img = new Image();
      img.src = result;
      img.onload = (e)=>{
        var tg = e.target;

        this.visualImgSize = {width: tg.width, height: tg.height};
        this.createImgCanvas(img);
        img.onload = null;
        img = null;
      };
    };
    reader.readAsDataURL(target.files[0]);
  },
  createImgCanvas(img){
    var canvas = this.canvas,
        ctx;

    if(!canvas){
      canvas = document.createElement('canvas');
      canvas.id = 'visualImg';
      document.body.appendChild(canvas);
      canvas.addEventListener('click',this.proxyClickCanvas,false);
      this.canvas = canvas;
      this.canvasContext = canvas.getContext("2d");
      this.coverImgStyle = canvas.style;
    }

    ctx = this.canvasContext;
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img,0,0,img.width,img.height);

    this.caculateCanvas();
  },
  caculateCanvas(){
    var canvasStyle = this.getStyle(this.canvas);

    this.canvasWidth = parseInt(canvasStyle.width);
    this.canvasHeight = parseInt(canvasStyle.height);
  },
  clickCanvas(e){
    var target = e.target,
        cavX, cavY, imgData,
        canvasPixel;

    if(!this.isColorPicker)
      return;
    cavX = e.pageX - target.offsetLeft;
    cavY = e.pageY - target.offsetTop;

    canvasPixel = this.getCanvasPixel(cavX, cavY);
    imgData = this.canvasContext.getImageData(canvasPixel.x,canvasPixel.y,1,1);
    this.setColorVl(imgData.data.slice(0,4));
  },
  getCanvasPixel(cavX,cavY){
    cavX = this.visualImgSize.width / this.getStyle(this.canvas,'width').replace('px','') * cavX;
    cavY = this.visualImgSize.height / this.getStyle(this.canvas,'height').replace('px','') * cavY;

    return new Point(cavX,cavY);
  },
  createColorPanel(){
    this.canvas.addEventListener('mousemove',this.proxyCanvasMove,false);
    this.canvas.addEventListener('touchmove',this.proxyCanvasMove,false);

    var colorPanel = document.querySelector('._color-panel-fd');

    if(!colorPanel){
      colorPanel = _.createHtmlDom('<aside class="_color-panel-fd"><ul><li><input class="rgbvl" placeholder="rgba值"></li>' +
          '<li><input class="hexvl" placeholder="hex值"></li><li><span class="color-tip">点击获取颜色</span><em class="colorShow"></em></li><em class="closeColorPn">+</em></aside>')
      document.body.appendChild(colorPanel);
    }

    colorPanel.style.display = 'block';
    this.isColorPicker = true;
  },
  closeColorPanel(){
    document.querySelector('._color-panel-fd').style.display = 'none';
    this.canvas.removeEventListener('mousemove',this.proxyCanvasMove);
    this.canvas.removeEventListener('touchmove',this.proxyCanvasMove);
    this.isColorPicker = false;
  },
  canvasMove(evt){
    var touch = evt.touches ? evt.touches[0] : evt;
    if(!this.fixColorPicker)
      this.clickCanvas(touch);
  },
  setColorVl(pixel){
    var values = pixel.map((item)=>{
      return item
    }), hexdatas = [];
    document.querySelector('.rgbvl').value = `rgba(${values.join(',')})`;

    pixel.slice(0,pixel.length-1).forEach((item,idx)=>{
      var hexVl;
      item = item * 1;
      hexVl = item.toString(16);
      if(hexVl == 0)
        hexVl = '00';
      if(hexVl.length == 1)
        hexVl = '0' + hexVl;
      hexdatas[idx] = hexVl;
    });

    document.querySelector('.hexvl').value = `#${hexdatas.join('')}`;
    document.querySelector('.colorShow').style.background = document.querySelector('.rgbvl').value;
  },
  getStyle(dom,prop){
    var computedStyle = getComputedStyle(dom);

    if(!prop)
      return computedStyle;

    return getComputedStyle(dom).getPropertyValue(prop);
  },
  _mouseDown(evt){
    var style = getComputedStyle(this.$drag);
    evt = evt.touches ? evt.touches[0] : evt;
    this.posX = evt.clientX;
    this.posY = evt.clientY;
    this.startX = style.left.replace('px','')*1;
    this.startY = style.bottom.replace('px','')*1;

    this.moveX = 0;
    this.moveY = 0;
    this.lastX = document.body.clientWidth - 30;
    this.lastY = -220;
    this.isDown = true;
  },
  _mousemove(evt){
    if(!this.isDown)
      return;
    var touch = evt.touches ? evt.touches[0] : evt;

    var posX = touch.clientX,
        posY = touch.clientY;

    var offsetX = posX - this.posX,
        offsetY = posY - this.posY,
        lastX, lastY, rect;

    this.moveX += offsetX;
    this.moveY -= offsetY;

    this.posX = posX;
    this.posY = posY;

    lastX = this.startX + this.moveX;
    lastY = this.startY + this.moveY;


    if(lastX > this.lastX)
      lastX = this.lastX;
    if(lastY < this.lastY)
      lastY = this.lastY;

    _.assign(this.$drag.style,{
      left: lastX + 'px',
      bottom: lastY + 'px'
    });

    this.transformContainer();
    evt.preventDefault();
  },
  transformContainer(){
    var winW = window.innerWidth,
        winH = window.innerHeight,
        rect = this.$container.getBoundingClientRect(),
        diffL = rect.right - winW,
        scale = 1;

    if(diffL > -15 && diffL < 79){
      scale = (1 - Math.abs(diffL / rect.width));
    }
    if(scale < 0.4 )
      scale = 0.4;

    this.$container.style.transform = 'scale(' + (scale) + ')';
  },
  _mouseUp(evt){
    this.isDown = false;
  },
  clickBody(e){
    var target = e.target;

    if(!target.closest('#_fd_dev_'))
      this.cm.packUpChildMenus();

    if(target.classList.contains('closeColorPn')){
      this.closeColorPanel();
    }

    if(guideLinePlugin.isCreatingLine){
      guideLinePlugin.stopGuideLine();
    }

    if(this.isColorPicker && !target.closest('._color-panel-fd')){
      if(!this.isMobile){
        if(!this.fixColorPicker){
          document.querySelector('._color-panel-fd .color-tip').innerText = '点击重新选取颜色';
        }else{
          document.querySelector('._color-panel-fd .color-tip').innerText = '点击获取颜色';
        }
      }

      this.fixColorPicker = !this.fixColorPicker;
      e.preventDefault();
    }
  },
  init(){
    var container = document.createElement('div'),
        style = document.createElement('style');


    style.id="fddev-chrome-css";
    style.innerHTML = mainStyleCss;
    document.querySelector('head').appendChild(style);
    container.innerHTML = '<dl class="tool-list">'+
        '<dd><div class="tool-menu">' +
        '<div class="menu-btn"></div>' +
        '<input type="file" class="imgfile">' +
        '</div> </dd></dl>';

    container.id = '_fd_dev_';
    document.body.appendChild(container);

    this.$container = document.querySelector('.tool-list');
    this.mainContainer = container;
    this.isShowGuideLine = true;
    guideLinePlugin.init(this);
  },
  appendContainer(dom){
    this.mainContainer.appendChild(dom);
  },
  handleEvent: function(event){
    switch(event.type) {
      case 'mousedown':
      case 'touchstart':
        this._mouseDown(event);
        break;
      case 'mousemove':
      case 'touchmove':
        this._mousemove(event);
        break;
      case 'mouseup':
      case 'touchend':
        this._mouseUp(event);
        break;
    }
  },
  bindEvent(){
    var container = document.querySelector('.tool-list');

    this.proxyLoadImg = this.loadImg.bind(this);
    this.proxyClickBody = this.clickBody.bind(this);
    this.proxyClickCanvas = this.clickCanvas.bind(this);
    this.proxyCanvasMove = this.canvasMove.bind(this);

    container.addEventListener('mousedown',this,false);
    container.addEventListener('mousemove',this,false);
    container.addEventListener('mouseup',this,false);

    container.addEventListener('touchstart',this,false);
    container.addEventListener('touchmove',this,false);
    container.addEventListener('touchend',this,false);

    document.body.addEventListener('click',this.proxyClickBody,false);
    document.querySelector('.imgfile').addEventListener('change',this.proxyLoadImg,false);

    this.$drag = container;
  },
  destroy(){
    var container = this.$drag;
    container.removeEventListener('mousedown',this);
    container.removeEventListener('mousemove',this);
    container.removeEventListener('mouseup',this);

    container.removeEventListener('touchstart',this);
    container.removeEventListener('touchmove',this);
    container.removeEventListener('touchend',this);

    document.body.removeEventListener('click',this.proxyClickBody);


    if(this.canvas){
      this.canvas.removeEventListener('mousemove',this.proxyCanvasMove);
      this.canvas.removeEventListener('touchmove',this.proxyCanvasMove);
      this.canvas.removeEventListener('click',this.proxyClickCanvas);
      this.canvas.remove();
      this.canvas = null;
    }

    if(document.querySelector('#_fd_dev_')){
      this.cm.destroy();
      document.querySelector('.imgfile').removeEventListener('change',this.proxyLoadImg);
      document.querySelector('#_fd_dev_').remove();
      document.querySelector('#fddev-chrome-css').remove();
    }

    this.isLoad = false;
    localStorage.removeItem('_fd_dev_');
  },
  start(){
    this.init();
    this.bindEvent();
    this.cm = new circleMenus(document.querySelector('.menu-btn'),getMenuConfig(this), this);
    this.cm.toggleMenu();
    this.isLoad = true;
  }
};

if(!chrome.extension){
  devTool.start();
}else{
  chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
    var data, isActived;

    if (request.command == "toggleOpen"){
      isActived = false;
      if(!devTool.isLoad){
        devTool.start();
        isActived = true;
        localStorage.setItem('_fd_dev_',JSON.stringify({stu:isActived}));
      }else{
        devTool.destroy();
      }
      data = { status: isActived};
    }else if(request.command == "getStatus"){
      data = { status: devTool.isLoad};
    }

    sendResponse(data);
  });

  var fdStorage = JSON.parse(localStorage.getItem('_fd_dev_'));

  if(fdStorage && fdStorage.stu != devTool.isLoad){
    if(devTool.isLoad){
      devTool.destroy();
    }else{
      devTool.start();
    }
    chrome.runtime.sendMessage(null,{command:'toggleIcon',data:{status:devTool.isLoad}},function(){

    });
  }
}
