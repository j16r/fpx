var $window = $(window);

var animations = [];
var slides = [];
var currentSlide = 0;
var slidesByName = {
  intro: 0,
  quote: 1,
};

var processing_handler = function (processing) {
  var findSlideIndex = function (name) {
    return slidesByName[name] || 0;
  };

  var findSlideName = function (index) {
    var slideName = null;
    _.each(slidesByName, function (slide, name) {
      if(slide == index) {
        slideName = name;
        return true;
      }
    });
    return slideName;
  };

  var fit_to_window = function () {
    processing.size($window.innerWidth(), $window.innerHeight());

    var params = $.deparam.querystring();
    if(params.slide) {
      currentSlide = findSlideIndex(params.slide);
    }
  };

  var create_slides = function () {
    var slide = {
      animations: [],
      draw: function () {
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
      },
      outTransition: function () {
      },
      inTransition: function () {
      }};

    slides.push(slide);

    slide = {
      animations: [],
      draw: function () {
        processing.fill(0);
        processing.textSize(36);
        processing.text("PowerPoint is just simulated acetate overhead slides, and to me,\nthat is a kind of a moral crime", 100, 350);
      },
      outTransition: function () {
      },
      inTransition: function () {
      }};

    slides.push(slide);
  };

  processing.setup = function () {
    fit_to_window();

    create_slides();

    $(window).on('resize', function () {
      fit_to_window();
    });
  };

  var clear = function () {
    processing.background(processing.color(159, 189, 225));
  };

  processing.draw = function() {
    clear();

    var slide = slides[currentSlide];
    slide.draw();
  };

  var nextSlide = function () {
    if(currentSlide < slides.length - 1) {
      $.bbq.pushState({slide: findSlideName(currentSlide + 1)}, 2);
    }
  };

  var previousSlide = function () {
    if(currentSlide > 0) {
      $.bbq.pushState({slide: findSlideName(currentSlide - 1)}, 2);
    }
  };

  processing.keyReleased = function () {
    if(this.key.code != this.PConstants.CODED) {
      return;
    }

    if(this.keyCode == this.PConstants.RIGHT) {
      nextSlide();
    } else if(this.keyCode == this.PConstants.LEFT) {
      previousSlide();
    }
  };

  $(window).bind('hashchange', function (event) {
    var slideIndex = event.getState('slide');
    currentSlide = findSlideIndex(slideIndex);
  });
};

$(function () {
  var canvas = $('canvas')[0];
  var processing = new Processing(canvas, processing_handler);
});
