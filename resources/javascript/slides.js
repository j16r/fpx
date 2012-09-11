var $window = $(window);
var socket = null;

var processingHandler = function (processing) {
  var slides = [];
  var currentSlide = null;
  var slidesByName = {
    intro: 0,
    quote: 1,
    presenter: 2,
    credits: 3
  };
  var inTransition = false;
  var previousSlide = null;
  var transitionLifetime = 0;
  var fonts = {};

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

  var fitToWindow = function () {
    processing.size($window.innerWidth(), $window.innerHeight());
  };

  var createSlides = function () {
    var slide = {
      animations: null,
      basePosition: null,
      init: function() {
        this.animations = [];
        this.basePosition = 0;
        this.speed = 2;
      },
      addRainDrop: function () {
        this.animations.push({
          lifetime: Math.random() * 100,
          radius: Math.random() * 100,
          color: [169, 199, 235, 220],
          x: Math.random() * $window.innerWidth(),
          y: Math.random() * $window.innerHeight()});
      },
      render: function () {
        this.animations = $.map(this.animations, function (animation, index) {
          if(--animation.lifetime <= 0) {
            return null;
          }

          processing.noStroke();
          processing.fill(animation.color[0], animation.color[1], animation.color[2], animation.color[3]);
          processing.ellipse(animation.x, animation.y, animation.lifetime, animation.lifetime);

          return animation;
        });

        processing.textFont("Helvetica");
        processing.fill(0);
        processing.textAlign(processing.PConstants.LEFT);
        processing.textSize(36);
        processing.text("PLAY >>>>", this.basePosition + 100, 350);

        processing.textSize(112);
        processing.text("fp(x)", this.basePosition + 100, 300);

        processing.fill(0, 0, 0, 20);
        processing.textSize(412);
        processing.text("fp(x)", this.basePosition + $window.innerWidth() / 3, $window.innerHeight() / 1.1);
      },
      draw: function () {
        this.addRainDrop();
        this.render();
      },
      outTransition: function () {
        this.speed *= 2;
        this.basePosition += this.speed;
        this.render();
      },
      inTransition: function () {
        this.draw();
      }};

    slides.push(slide);

    slide = {
      animations: null,
      alpha: null,
      init: function () {
        this.alpha = 0;
        this.animations = [];
      },
      render: function () {
        processing.fill(0, 0, 0, this.alpha);
        processing.textFont(fonts.quicksandLarge)
        processing.textAlign(processing.PConstants.CENTER);
        processing.text("PowerPoint is just simulated acetate overhead slides, and to me,\nthat is a kind of a moral crime", $window.innerWidth() / 2, $window.innerHeight() / 2);
        processing.textFont(fonts.quicksand)
        processing.text("-- Alan Kay", $window.innerWidth() / 1.8, $window.innerHeight() / 1.5);
      },
      draw: function () {
        this.render();
      },
      outTransition: function () {
        this.alpha -= 8;
        this.render();
      },
      inTransition: function () {
        this.alpha += 8;
        this.render();
      }};

    slides.push(slide);

    slide = {
    };
  };

  var loadFonts = function () {
    fonts.quicksandLarge = processing.createFont("Quicksand", 36);
    fonts.quicksand = processing.createFont("Quicksand", 24);
  };

  var setInitialSlide = function () {
    $(window).trigger('hashchange');
  };

  var clear = function () {
    processing.background(processing.color(159, 189, 225));
  };

  processing.setup = function () {
    loadFonts();
    createSlides();
    fitToWindow();
    setInitialSlide();

    socket = new WebSocket("ws://" + location.host);

    socket.onmessage = function(message) {
      var command = JSON.parse(message.data);

      if(command.command === "mouseClick") {
        var slide = slides[currentSlide];
        slide.animations.push({
          color: [169, 230, 235, 220],
          lifetime: Math.random() * 100,
          radius: Math.random() * 100,
          x: command.x,
          y: command.y});
      }
    };
  };

  processing.draw = function() {
    clear();

    var slide = slides[currentSlide];
    if(inTransition && slide.inTransition) {
      if(previousSlide !== null) {
        var oldSlide = slides[previousSlide]
        if(oldSlide.outTransition) {
          oldSlide.outTransition();
        }
      }

      slide.inTransition();

      if(transitionLifetime-- == 0) {
        inTransition = false;
      }
    } else {
      slide.draw();
    }
  };

  var moveNextSlide = function () {
    if(currentSlide < slides.length - 1) {
      $.bbq.pushState({slide: findSlideName(currentSlide + 1)}, 2);
    }
  };

  var movePreviousSlide = function () {
    if(currentSlide > 0) {
      $.bbq.pushState({slide: findSlideName(currentSlide - 1)}, 2);
    }
  };

  processing.keyReleased = function () {
    if(this.key.code != this.PConstants.CODED) {
      return;
    }

    if(this.keyCode == this.PConstants.RIGHT) {
      moveNextSlide();
    } else if(this.keyCode == this.PConstants.LEFT) {
      movePreviousSlide();
    }

    return false;
  };

  processing.mouseClicked = function () {
    socket.send(JSON.stringify({command: "mouseClick", x: this.mouseX, y: this.mouseY}));
  };

  var switchToSlide = function(slide) {
    previousSlide = currentSlide;

    currentSlide = findSlideIndex(slide);
    slides[currentSlide].init();

    inTransition = true;
    transitionLifetime = 30;
  };

  $(window).on('hashchange', function (event) {
    var nextSlide = event.getState('slide');
    switchToSlide(nextSlide);
  });

  $(window).on('resize', function () {
    fitToWindow();
  });
};

$(function () {
  var canvas = $('canvas')[0];
  var processing = new Processing(canvas, processingHandler);
});
