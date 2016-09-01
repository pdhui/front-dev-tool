const _ = require('./utils.js');
const TimelineLite = require('../lib/TimelineLite.js');
require('../lib/EasePack.js');
require('../lib/CSSPlugin.js');

const SvgElement = function(tag, attrs) {
  var elem = document.createElementNS("http://www.w3.org/2000/svg", tag);

  Object.keys(attrs).forEach(function(name) {
      elem.setAttribute(name, attrs[name]);
  });

  return elem;
};

const Point = function(x,y){
  this.x = x;
  this.y = y;
}
const circleMenus = function(element, options){
  this.element = element;
  this.options = _.assign({},circleMenus.defaults, options);
  this.init();
};

circleMenus.defaults = {
  size: 160,
  svgClz: 'rc-circleMenus'
};

circleMenus.prototype = {
  constructor: circleMenus,
  opened: true,
  init: function(){
    this.size = this.options.size;
    this.width = this.size;
    this.height = this.size;
    this.centerPoint = new Point(this.width / 2,this.height/2);
    this.prepare();
  },
  prepare:function(){
    this.svg = SvgElement("svg", {
        "version": "1.1",
        "preserveAspectRatio": "xMinYMin meet",
        "viewBox": "0 0 " + this.width + " " + this.height,
        "class": this.options.svgClz
    });

    this.drawPizzas();
    this.drawCircle();
    this.element.appendChild(this.svg);
    this.bindEvent();
  },
  drawCircle: function(){
    var width = this.width,
        height = this.height,
        cx = this.centerPoint.x,
        cy = this.centerPoint.y,
        r = Math.min(cx, cy)/4;

    var pathGroup = new SvgElement("g",{
      class: 'triggle-btn-group'
    });
    var circle = new SvgElement("circle",{
      cx: cx,
      cy: cy,
      r: r
    });
    var text = new SvgElement("text",{
      x: cx,
      y: cy ,
      fill: '#fff',
      'font-size': '1.5em',
      class: "triggle-btn-txt"
    });
    text.innerHTML = '-';

    pathGroup.appendChild(circle);
    pathGroup.appendChild(text);
    this.svg.appendChild(pathGroup);
    this.triggleBtn = pathGroup;
    this.triggleBtnText = text;
  },
  drawPizzas: function(n) {
    var width = this.width,
        height = this.height,
        cx = this.centerPoint.x,
        cy = this.centerPoint.y,
        start_angle = 0,
        r = Math.min(cx, cy)/2 - 2,
        perPizza,
        pizzaCount,
        startAngleRadian,
        big = 0;

    var transformOrigin = cx + 'px ' + cy + 'px';
    var menuDatas = this.options.menuList;

    pizzaCount = menuDatas.length;
    perPizza = 360 / pizzaCount;

    this.menuGroupRotate = 'rotate(-' + perPizza/2 + 'deg)';
    var pathGroup = new SvgElement("g",{
      "class": "menus-group",
      "transform-origin": transformOrigin,
      style:'transform:'+this.menuGroupRotate+ ' scale(0)'
    }), pathLink, text,textPathTemp;

    if (_.angleToRadian(perPizza) > Math.PI) big = 1;

    for(var i=0; i<pizzaCount; i++){
      var item = menuDatas[i],
          childMenus = item.childMenus;

      start_angle = i* perPizza;
      startAngleRadian = _.angleToRadian(start_angle);
      var path = new SvgElement("path", {
        fill: 'red',
        'stroke-width': 1,
        stroke: '#000'
      });

      var end_angle = start_angle + perPizza;

      var direct = 1;

      var startPoint = this.getCirclePoint(cx,cy,r,start_angle),
          endPoint = this.getCirclePoint(cx,cy,r,end_angle);

      var d = "M" + cx + "," + cy + " " + startPoint.x + ',' + startPoint.y;

      d += " A" + r + "," + r + // Draw an arc of radius r
           " 0 " + big + ' ' + direct + ' ' +// Arc details...
           endPoint.x + "," + endPoint.y;
      d += 'z';

      path.setAttribute("d", d);

      pathLink = new SvgElement("a",{
        class: 'menu-item',
        'transform-origin': transformOrigin,
        style: 'transform: rotate(-' + perPizza*i + 'deg)'
      });

      text = new SvgElement("text",{
        x: cx,
        y: cy - r/2,
        'transform-origin': transformOrigin,
        transform: 'rotate(' + (perPizza*i+perPizza/2) + ', ' + cx +' ' + cy +') rotate(' + (perPizza*i) +', ' + cx +' ' + (cy- r/2)+')'
      });
      text.innerHTML = item.value;
      pathLink.appendChild(path);
      pathLink.appendChild(text);
      pathGroup.appendChild(pathLink);
      this.drawChildMenus(childMenus,start_angle,end_angle,r);
    }
    this.svg.appendChild(pathGroup);
  },
  drawChildMenus: function(childMenus,start_angle,end_angle,r){
    var cx = this.centerPoint.x,
        cy = this.centerPoint.y,
        r = r + 10,
        outerR = r + 20,
        path, d, big=0;

    var startPoint = this.getCirclePoint(cx,cy,r,start_angle),
        endPoint = this.getCirclePoint(cx,cy,r,end_angle),
        outerStartPoint = this.getCirclePoint(cx,cy,outerR,start_angle),
        outerEndPoint = this.getCirclePoint(cx,cy,outerR,end_angle);

    if (_.angleToRadian(end_angle - start_angle) > Math.PI) big = 1;

    var d = "M" + startPoint.x + "," + startPoint.y + " " + outerStartPoint.x + ',' + outerStartPoint.y;

    d += " A" + outerR + "," + outerR + // Draw an arc of radius r
         " 0 " + big + ' ' + 1 + ' ' +// Arc details...
         outerEndPoint.x + "," + outerEndPoint.y /*+
         "M" + endPoint.x + ',' + endPoint.y;*/
    d += 'z';

    path = new SvgElement("path", {
      fill: 'yellow',
      'stroke-width': 1,
      stroke: '#000',
      d: d
    });

    this.svg.appendChild(path);
  },
  getCirclePoint: function(cx,cy,r,angle){
    var radian = _.angleToRadian(angle);
    return {x: cx + r * Math.sin(radian), y: cy - r * Math.cos(radian)};
  },
  toggleMenu: function(){
    var items = document.querySelectorAll('.menu-item'),
        tl = this.timelineLite,
        menuGroupDom = document.querySelector('.menus-group');

    if(!tl){
      tl = new TimelineLite();
    }
    if(this.opened){
      menuGroupDom.style.transitionDelay = '0s';
      if(!this.timelineLite){
        tweenTime.to(menuGroupDom,{transform:this.menuGroupRotate + " scale(1)"});
        for (var i = 0; i < items.length; i++) {
          // tl.to(items[i].style, 0.3, {
          //     transform:"rotateZ(0deg)",
          //     ease: Circ.easeInOut
          // }, 0.05);
          tweenTime.to(items[i],{transform:"rotate(0deg)"});
        }
        // tl.to(items, 0.3, {
        //     scale: 0,
        //     ease: Back.easeIn
        // }, 0.3);
        this.timelineLite = tl;
      }else{

        // this.timelineLite.restart();
        tweenTime.restart();
      }
      this.triggleBtnText.innerHTML = '+';
    }else{
      // this.timelineLite.reverse();
      menuGroupDom.style.transitionDelay = '0.8s';
      tweenTime.reverse();
      this.triggleBtnText.innerHTML = '-';
    }

    this.opened = !this.opened;
  },
  bindEvent: function(){
    this.triggleBtn.addEventListener('click',this.toggleMenu.bind(this),false);
  }
}

var tweenTime ={
  _fns: [],
  cache: {},
  id: 0,
  to: function(dom,attrs){
    var originAttrs = {},
        domStyle = dom.style;

    Object.keys(attrs).forEach((key)=>{
      var value = domStyle[key];
      if(value != null)
        originAttrs[key] = value;
    });

    dom.tweenId = ++ this.id;
    this.cache[dom.tweenId] = originAttrs;
    this._fns.push([dom,function(){
      _.assign(domStyle,attrs);
    }])
    requestAnimationFrame(this._fns[this._fns.length-1][1]);
  },
  restart: function(){
    this._fns.forEach((item)=>{
      var dom = item[0],
          originAttrs = this.cache[dom.tweenId];

      _.assign(dom.style,originAttrs);
      requestAnimationFrame(item[1]);
    });
  },
  reverse: function(){
    var item;
    for(var i=this._fns.length;i--;){
      item = this._fns[i];
      requestAnimationFrame(function(item){
        var dom = item[0],
            originAttrs = this.cache[dom.tweenId];
            console.log('reverse',originAttrs,dom.tweenId);
        _.assign(dom.style,originAttrs);
      }.bind(this,item));
    }
  }
}
module.exports = circleMenus;