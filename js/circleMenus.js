const _ = require('./utils.js');

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
    console.log(getComputedStyle(text).width);
    pathGroup.appendChild(circle);
    pathGroup.appendChild(text);
    this.svg.appendChild(pathGroup);
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

    var pathGroup = new SvgElement("g",{});
    for(var i=0; i<pizzaCount;i++){

      start_angle = i* perPizza;
      startAngleRadian = _.angleToRadian(start_angle);
      var path = new SvgElement("path", {
        fill: 'red',
        'stroke-width': 1,
        stroke: '#000'
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
      pathGroup.appendChild(path);

    }
    this.svg.appendChild(pathGroup);
  }
}

module.exports = circleMenus;