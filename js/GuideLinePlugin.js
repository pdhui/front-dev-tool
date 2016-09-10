const _ = require('./utils.js');
const Point = require('./Point.js');

module.exports = {
  isCreatingLine: false,
  activedLine: null,
  linePoints: [],
  init(context){
    this.context = context;
    this.proxyLineMove = this.guideLineMove.bind(this);
  },
  createGuideLine(){
    var newLine = _.createHtmlDom('<div class="guide-line"><i class="ver-guide-line"></i><i class="hor-guide-line"></i><span class="guide-txt"></span></div>');

    newLine.querySelector('.ver-guide-line').style.height = this.context.canvasHeight;
    newLine.querySelector('.hor-guide-line').style.width = this.context.canvasWidth;
    document.body.appendChild(newLine);

    document.body.addEventListener('mousemove',this.proxyLineMove,false);
    document.body.addEventListener('touchmove',this.proxyLineMove,false);
    document.body.addEventListener('keydown',this.proxyLineMove,false);

    this.isCreatingLine = true;
    this.activedLine = newLine;
    this.createZoom();
    // document.body.style.overflow = 'hidden';
  },
  createZoom(){
    var canvas = _.createHtmlDom('<canvas class="guide-zoom"></canvas>'),
        ctx = canvas.getContext("2d");

    canvas.width = 50;
    canvas.height = 50;
    document.body.appendChild(canvas);
    this.guideZoomCanvas = canvas;
    this.guideZoomCtx = canvas.getContext('2d');
  },
  createLineLabel(p1,p2){
    var label = _.createHtmlDom('<div class="line-label"><em class="ver-label"></em><em class="hor-label"></em><strong class="ver-h"></strong><strong class="hor-w"></strong></div>'),
        width = p2.x - p1.x,
        height = p2.y - p1.y,
        absHeight = Math.abs(height);

    _.assign(label.querySelector('.hor-label').style,{
      left: (width > 0 ? p1.x : p1.x + width) + 'px',
      top: p2.y + 'px',
      width: Math.abs(width) + 'px'
    });

    _.assign(label.querySelector('.ver-label').style,{
      left: p2.x  + 'px',
      top: (height > 0 ? p1.y : p1.y + height) + 'px',
      height: absHeight + 'px'
    });

    _.assign(label.querySelector('.hor-w').style,{
      left: (width > 0 ? p1.x : p1.x + width) + 'px',
      top: p2.y + 'px'
    });

    label.querySelector('.hor-w').innerText = Math.abs(width.toFixed(2));

    _.assign(label.querySelector('.ver-h').style,{
      left: p2.x - 15 + 'px',
      top: (height > 0 ? p1.y : p1.y + height) + (absHeight - 16) / 2 + 'px'
    });

    label.querySelector('.ver-h').innerText = absHeight.toFixed(2);
    this.activedLine.appendChild(label);
  },
  guideLineMove(evt){
    var touch = evt.touches ? evt.touches[0] : evt;
    var pageX = touch.pageX,
        pageY = touch.pageY,
        guideTxt;

    var dom = this.activedLine;

    if(evt.type == 'keydown'){
      var keyCode = evt.keyCode;
      pageX = dom.querySelector('.ver-guide-line').style.left.replace('px','') * 1;
      pageY = dom.querySelector('.hor-guide-line').style.top.replace('px','') * 1;

      if(keyCode == '40'){//up
        pageY += 1;
      }else if(keyCode == '38'){
        pageY -= 1;
      }else if(keyCode == '37'){
        pageX -= 1;
      }else if(keyCode == '39'){
        pageX += 1;
      }else if(keyCode == 13){
        this.stopGuideLine();
        return;
      }
    }
     _.assign(dom.querySelector('.ver-guide-line').style,{
      left: pageX
    });
    _.assign(dom.querySelector('.hor-guide-line').style,{
      top: pageY
    });

    guideTxt = dom.querySelector('.guide-txt');

    _.assign(guideTxt.style,{
      left: pageX + 10 + 'px',
      top: pageY + 10 + 'px'
    });

    guideTxt.innerText = '(' + pageX + ',' + pageY + ')';

    this.zoomIn(pageX, pageY);
    evt.preventDefault();
  },
  stopGuideLine(){
    var posX, posY,
        lastPoint, startPoint;

    document.body.removeEventListener('mousemove',this.proxyLineMove);
    document.body.removeEventListener('touchmove',this.proxyLineMove);
    document.body.removeEventListener('keydown',this.proxyLineMove);

    var guideTxt = this.activedLine.querySelector('.guide-txt');

    posX = guideTxt.style.left.replace('px','') * 1 - 10;
    posY = guideTxt.style.top.replace('px','') * 1 - 10;

    _.assign(guideTxt.style,{
      left: posX + 'px',
      top: posY + 'px',
    });

    this.isCreatingLine = false;
    lastPoint = new Point(posX,posY);
    if(this.linePoints.length > 0){
      startPoint = this.linePoints[this.linePoints.length - 1];
      this.createLineLabel(startPoint,lastPoint);
    }
    this.linePoints.push(lastPoint);
    this.guideZoomCanvas.remove();
    this.guideZoomCtx = null;
    this.guideZoomCanvas = null;
  },
  zoomIn(x,y){
    if(!this.guideZoomCtx)
      return;

    var point = this.context.getCanvasPixel(x,y);
    this.guideZoomCtx.drawImage(this.context.canvas,point.x-10,point.y-10,20,20,0,0,50,50);
    this.drawLine(new Point(25,0),new Point(25,50));
    this.drawLine(new Point(0,25),new Point(50,25));
    _.assign(this.guideZoomCanvas.style,{
      left: x - 25 + 50,
      top: y - 25 + 50
    })
  },
  drawLine(p1,p2){
    var ctx = this.guideZoomCtx;

    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.stroke();
  },
  resizeGuideLine(preW, preH){
    var lines = document.querySelectorAll('.guide-line'),
        cvasW = this.context.canvasWidth,
        cvasH = this.context.canvasHeight,
        prePoint;

    this.linePoints.forEach((linePoint)=>{
      linePoint.x = (linePoint.x * cvasW / preW).toFixed(2) * 1;
      linePoint.y = (linePoint.y * cvasH / preH).toFixed(2) * 1;
    });

    lines.forEach((line,idx)=>{
      var point = this.linePoints[idx],
          guideTxt = line.querySelector('.guide-txt');

      _.assign(line.querySelector('.ver-guide-line').style,{
        height: cvasH,
        left: point.x
      });

      _.assign(line.querySelector('.hor-guide-line').style,{
        height: cvasW,
        top: point.y
      });

      _.assign(guideTxt.style,{
        left: point.x + 'px',
        top: point.y + 'px'
      });
      guideTxt.textContent = '(' + point.x + ',' + point.y + ')';

      if(prePoint){
        line.querySelector('.line-label').remove();
        this.createLineLabel(prePoint,point);
      }

      prePoint = point;
    });
  }
};