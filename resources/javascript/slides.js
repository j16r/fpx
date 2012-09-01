var $window = $(window);

var animations = [];

var processing_handler = function (processing) {
  processing.setup = function () {
    processing.size($window.innerWidth(), $window.innerHeight());
  };

  var clear = function () {
    processing.background(processing.color(159, 189, 225));
  };

  processing.draw = function() {
    clear();

    animations.push({
      lifetime: Math.random() * 100,
      radius: Math.random() * 100,
      x: Math.random() * $window.innerWidth(),
      y: Math.random() * $window.innerHeight()});

    animations = $.map(animations, function (animation, index) {
      if(--animation.lifetime <= 0) {
        return null;
      }

      processing.alpha(100);
      processing.noStroke();
      processing.fill(169, 199, 235);
      processing.ellipse(animation.x, animation.y, animation.lifetime, animation.lifetime);

      return animation;
    });
  };
};

$(function () {
  var canvas = $('canvas')[0];
  var processing = new Processing(canvas, processing_handler);
});
