const _ = require('./utils.js');
// const TimelineLite = require('../lib/TimelineLite.js');
// require('../lib/EasePack.js');
// require('../lib/CSSPlugin.js');
function TimelineLite(){}

const SvgElement = function(tag, attrs) {
  var elem = document.createElementNS("http://www.w3.org/2000/svg", tag);

  Object.keys(attrs).forEach(function(name) {
    if(name.toLowerCase().indexOf('xlink:') == 0){
      elem.setAttributeNS('http://www.w3.org/1999/xlink',
                     name, attrs[name]);
    }else{
      elem.setAttribute(name, attrs[name]);
    }
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
  menusMap: {},
  events:{},
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
        "xlink": 'http://www.w3.org/1999/xlink',
        "preserveAspectRatio": "xMinYMin meet",
        "viewBox": "0 0 " + this.width + " " + this.height,
        "class": this.options.svgClz
    });

    this.drawPizzas(Math.min(this.centerPoint.x, this.centerPoint.y)*0.6,this.options.menuList,{hide:true});
    this.drawCircle();
    this.element.appendChild(this.svg);
    this.bindEvent();
  },
  drawCircle: function(){
    var width = this.width,
        height = this.height,
        cx = this.centerPoint.x,
        cy = this.centerPoint.y,
        r = Math.min(cx, cy)/5;

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
  drawPizzas: function(r,menuDatas,settings) {
    var width = this.width,
        height = this.height,
        cx = this.centerPoint.x,
        cy = this.centerPoint.y,
        start_angle = 0,
        perPizza,
        pizzaCount,
        startAngleRadian,
        big = 0,
        menusMap;

    menusMap = this.menusMap;

    settings = settings || {};
    var cls = settings.cls || '',
        scaleStyle = settings.hide ? ' scale(0)' : '';

    var transformOrigin = cx + 'px ' + cy + 'px';

    pizzaCount = menuDatas.length;
    perPizza = 360 / pizzaCount;

    this.menuGroupRotate = 'rotate(-' + perPizza/2 + 'deg)';
    var pathGroup = new SvgElement("g",{
      "class": "menus-group " + cls,
      "transform-origin": transformOrigin,
      style:'transform:'+this.menuGroupRotate+ scaleStyle
    }),
    childPathGroup = new SvgElement("g",{
      "class": "child-menus-group",
      "transform-origin": transformOrigin,
      style:'transform:'+this.menuGroupRotate+ ' scale(0)'
    }), pathLink, text,textPathTemp;

    if (_.angleToRadian(perPizza) > Math.PI) big = 1;

    for(var i=0; i<pizzaCount; i++){
      var item = menuDatas[i],
          childMenus = item.childMenus,
          textOriginRotate = 0,
          txtCy;

      start_angle = i* perPizza;
      startAngleRadian = _.angleToRadian(start_angle);
      var path = new SvgElement("path", {
        fill: '#f2753f',
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
        style: 'transform: rotate(-' + perPizza*i + 'deg)',
        'data-id': item.id
      });

      if(perPizza*i > 90 && perPizza*i < 270)
        textOriginRotate = 180;

      txtCy = cy - r * 0.8;

      if(!settings.isChild){
        menusMap[item.id] = item;
        txtCy = cy - r * 0.7;
      }

      text = new SvgElement("text",{
        x: cx,
        y: txtCy,
        'font-size':'0.9em',
        'fill': '#fff',
        'transform-origin': transformOrigin,
        transform: 'rotate(' + (perPizza*i+perPizza/2) + ', ' + cx +' ' + cy +') rotate(' + (textOriginRotate) +', ' + cx +' ' + txtCy+')'
      });
      text.innerHTML = item.value;
      pathLink.appendChild(path);
      pathLink.appendChild(text);
      pathGroup.appendChild(pathLink);

      if(childMenus && childMenus.length > 0){
        this.addEvent('hover',item.id,(cms,e,menuId)=>{
          if(this.hoverEles === menuId)
            return;

          this.packUpChildMenus();

          this.hoverEles = menuId;
          this.drawPizzas(r / 0.6 - 5,cms[0],{cls: 'child-menus'+ menuId,first:true,isChild:true});
          document.querySelectorAll(`.child-menus${menuId} .menu-item`).forEach((item)=>{
            item.style.transform = 'rotate(0deg)';
          })
        },childMenus)
      }

      this.addEvent('click',item.id,item.click);
    }
    if(settings.first)
      this.svg.insertBefore(pathGroup,this.svg.firstChild);
    else
      this.svg.appendChild(pathGroup);
  },
  packUpChildMenus: function(){
    if(!!this.hoverEles){
      var preChildMenus = this.menusMap[this.hoverEles].childMenus || [];

      document.querySelector('.child-menus' + this.hoverEles).remove();

      preChildMenus.forEach((childmu)=>{
        Object.keys(childmu).forEach((key)=>{
          if(typeof childmu[key] == 'function'){
            this.removeEvent(key,childmu.id);
          }
        })
      });
      this.hoverEles = '';
    }
  },
  getCirclePoint: function(cx,cy,r,angle){
    var radian = _.angleToRadian(angle);
    return {x: cx + r * Math.sin(radian), y: cy - r * Math.cos(radian)};
  },
  toggleMenu: function(){
    var items = document.querySelectorAll('.menu-item'),
        tl = this.timelineLite,
        menuGroupDom = document.querySelector('.menus-group'),
        childMenuGroupDom = document.querySelector('.child-menus-group');

    if(!tl){
      tl = new TimelineLite();
    }
    if(this.opened){
      menuGroupDom.style.transitionDelay = '0s';
      if(!this.timelineLite){
        tweenTime.to(menuGroupDom,{transform:this.menuGroupRotate + " scale(1)"});
        // tweenTime.to(childMenuGroupDom,{transform:this.menuGroupRotate + " scale(1)"});
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
  dispatchMenu: function(evtName,e){
    var target = e.target,
        menuItem = target.closest('.menu-item'),
        evtList = this.events[evtName],
        menuId,
        callback;

    if(menuItem && evtList){
      menuId = menuItem.getAttribute('data-id');

      evtList.forEach((item)=>{
        if(item[0] == menuId && item[1]){
          if(item[2])
            item[1](item[2],e,menuId);
          else{
            item[1](e,menuId);
          }
        }
      });
    }
  },
  destroy:function(){
    this.triggleBtn.removeEventListener('click',this.proxyToggleMenu);
    this.svg.removeEventListener('click',this.proxyClickDispatch);
    this.triggleBtn.removeEventListener('mouseenter',this.proxyRemoveChildMenus);
    document.querySelector('.menus-group').removeEventListener('mouseover',this.proxyHoverDispatch);
    this.events = {};
    this.hoverEles = '';
    this.menusMap = {};
  },
  bindEvent: function(){
    this.proxyToggleMenu = this.toggleMenu.bind(this);
    this.proxyClickDispatch = this.dispatchMenu.bind(this,'click');
    this.proxyHoverDispatch = this.dispatchMenu.bind(this,'hover');
    this.proxyRemoveChildMenus = this.packUpChildMenus.bind(this);

    this.triggleBtn.addEventListener('click',this.proxyToggleMenu,false);
    this.svg.addEventListener('click',this.proxyClickDispatch,false);
    this.triggleBtn.addEventListener('mouseenter',this.proxyRemoveChildMenus,false);
    document.querySelector('.menus-group').addEventListener('mouseover',this.proxyHoverDispatch,false);
  },
  addEvent:function(evtName,name,fn){
    var arg = Array.prototype.slice.call(arguments,3);
    var eventList = this.events[evtName]
    if(!eventList)
      eventList = this.events[evtName] = [];

    arg = arg.length == 0 ? undefined : arg;
    eventList.push([name,fn,arg]);
  },
  removeEvent: function(evtName,name,fn){
    var eventList = this.events[evtName],
        item;
    if(!eventList || eventList.length == 0)
      return;

    for(var i=0,len=eventList.length; i < len; i++){
      item = eventList[i];
      if(item[0] == name){
        eventList.splice(i,1);
        return item;
      }
    }
  },
  hoverEles:''
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
        _.assign(dom.style,originAttrs);
      }.bind(this,item));
    }
  }
}
module.exports = circleMenus;