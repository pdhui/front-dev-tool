const _ = require('./utils.js');
const TimelineLite = require('../lib/TimelineLite.js');
require('../lib/EasePack.js');
require('../lib/CSSPlugin.js');

var SvgElement = function(tag, attrs) {
  var elem = document.createElementNS("http://www.w3.org/2000/svg", tag);

  Object.keys(attrs).forEach(function(name) {
      elem.setAttribute(name, attrs[name]);
  });

  return elem;
};

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
    var width = this.size,
        height = this.size,
        cx = width / 2,
        cy = height / 2,
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
  },
  drawPizzas: function(n) {
    var width = this.size,
        height = this.size,
        cx = width / 2,
        cy = height / 2,
        start_angle = 0,
        r = Math.min(cx, cy) - 2,
        perPizza = 60,
        pizzaCount = 360 / perPizza,
        startAngleRadian;

    var transformOrigin = cx + 'px ' + cy + 'px';

    this.menuGroupRotate = 'rotate(-' + perPizza/2 + 'deg)';
    var pathGroup = new SvgElement("g",{
      "class": "menus-group",
      "transform-origin": transformOrigin,
      style:'transform:'+this.menuGroupRotate+ ' scale(0)'
    }), pathLink, text,textPathTemp;

    for(var i=0; i<pizzaCount;i++){

      start_angle = i* perPizza;
      startAngleRadian = _.angleToRadian(start_angle);
      var path = new SvgElement("path", {
        fill: 'red',
        'stroke-width': 1,
        stroke: '#000',
        id: 'path'+i
        // class: 'menu-item',
        // 'transform-origin': transformOrigin,
        // style: 'transform: rotate(-' + perPizza*i + 'deg)'
      });

      var end_angle = startAngleRadian + _.angleToRadian(perPizza);

      var big = 0,
          direct = 1;

      if (end_angle - start_angle > Math.PI) big = 1;

      var x1 = cx + r * Math.sin(startAngleRadian) ,
          y1 = cy - r * Math.cos(startAngleRadian),
          x2 = cx + r * Math.sin(end_angle),
          y2 = cy - r * Math.cos(end_angle);

      var d = "M" + cx + "," + cy + " " + x1 + ',' + y1;

      d += " A" + r + "," + r + // Draw an arc of radius r
           " 0 " + big + ' ' + direct + ' ' +// Arc details...
           x2 + "," + y2;
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
        transform: 'rotate(' + (perPizza*i+perPizza/2) + ', ' + cx +' ' + cy +')'
      });
      text.innerHTML = 'ff';
      pathLink.appendChild(path);
      pathLink.appendChild(text);
      pathGroup.appendChild(pathLink);
    }
    this.svg.appendChild(pathGroup);
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

    }else{
      // this.timelineLite.reverse();
      menuGroupDom.style.transitionDelay = '0.8s';
      tweenTime.reverse();
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