const maxX = 10,
      maxY = 10,
      maxPassed = 200,
      num = 0;

function createTapListener(dom, fn){
  var selfMouseDown = this.mousedown.bind(this),
      selfMouseMove = this.mousemove.bind(this),
      selfMouseUp = this.mouseup.bind(this);

  this.callback = fn;

	dom.addEventListener('mousedown', selfMouseDown, false);
	dom.addEventListener('mousemove', selfMouseMove, false);
  dom.addEventListener('mouseup', selfMouseUp, false);

  return {
    removeListener: function(){
      dom.removeEventListener('mousedown', selfMouseDown);
      dom.removeEventListener('mousemove', selfMouseMove);
      dom.removeEventListener('mouseup', selfMouseUp);
    }
  }
}

createTapListener.prototype.mousedown = function(evt){
  this.isStart = true;

  this.lastX = evt.clientX;
  this.lastY = evt.clientY;

  this.distanceX = 0;
  this.distanceY = 0;

  this.lastTime = Date.now();
}

createTapListener.prototype.mousemove = function(evt){
  if(!this.isStart)
    return;

  this.distanceX += Math.abs(evt.clientX - this.lastX);
  this.distanceY += Math.abs(evt.clientY - this.lastY);
}

createTapListener.prototype.mouseup = function(evt){
  if(this.distanceX > maxX || this.distanceY > maxY || (Date.now() - this.lastTime > maxPassed))
    return;

  this.callback(evt);

  this.isStart = false;
}

if (!HTMLElement.prototype.addTapListener) {
  Element.prototype.addTapListener = function (fn) {
    
    this.removeTapListener = new createTapListener(this, fn);
  }
}