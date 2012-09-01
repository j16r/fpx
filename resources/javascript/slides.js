var $window = $(window);

var animations = [];

var processing_handler = function (processing) {
  var fit_to_window = function () {
    processing.size($window.innerWidth(), $window.innerHeight());
  };

  processing.setup = function () {
    fit_to_window();

    $(window).on('resize', function () {
      fit_to_window();
    });
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

    processing.textFont(processing.loadFont("FFScala.ttf"));
    processing.fill(0);
    processing.textSize(36);
    processing.text("PLAY >>>>", 100, 350);

    processing.textSize(112);
    processing.text("fp(x)", 100, 300);

    processing.fill(0, 0, 0, 20);
    processing.textSize(412);
    processing.text("fp(x)", $window.innerWidth() / 3, $window.innerHeight() / 1.1);
  };
};

$(function () {
  var canvas = $('canvas')[0];
  var processing = new Processing(canvas, processing_handler);
});
