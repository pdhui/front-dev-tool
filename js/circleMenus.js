var SvgElement = function(tag, attrs) {
  var elem = document.createElementNS("http://www.w3.org/2000/svg", tag);

  $.each(attrs, function(name, value) {
      elem.setAttribute(name, value);
  });

  return elem;
};

const circleMenus = {
  prepare:function(){
    this.svg = SvgElement("svg", {
        "version": "1.1",
        "preserveAspectRatio": "xMinYMin meet",
        "viewBox": "0 0 " + this.width + " " + this.height
    });

    $('<div class="' + this.classes.svg + '"></div>').append(this.svg).appendTo(this.$element);
  }
}