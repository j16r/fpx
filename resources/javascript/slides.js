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
        this.background = processing.color(159, 189, 225);
      },
      click: function (command) {
        this.addRainDrop(command.x, command.y);
      },
      addRandomRainDrop: function () {
        var x = Math.random() * $window.innerWidth(),
            y = Math.random() * $window.innerHeight();
        this.addRainDrop(x, y);
      },
      addRainDrop: function (x, y) {
        this.animations.push({
          lifetime: Math.random() * 100,
          radius: Math.random() * 100,
          color: [169, 199, 235, 220],
          x: x,
          y: y});
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
        this.addRandomRainDrop();
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
        this.background = processing.color(0x85, 0xB5, 0x84);
        this.maxAnimations = 100;
      },
      addRandomLeaf: function (x, y) {
        var x = Math.random() * $window.innerWidth(),
            y = Math.random() * $window.innerHeight();
        this.addLeaf(x, y);
      },
      addLeaf: function (x, y) {
        if(this.animations.size < this.maxAnimations) {
          return;
        }
        this.animations.push({
          color: [0x41, 0x92 + Math.random() * 90, 0x4b, 90],
          x_velocity: Math.random(),
          y_velocity: Math.random(),
          direction: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotation_velocity: Math.random() / 20,
          x: x,
          y: y});
      },
      click: function (command) {
        this.addLeaf(command.x, command.y);
      },
      wind: {
        speed: 0,
        direction: 0,
        speedDelta: 0,
        directionDelta: 0,
        rotateOverlap: 0,
        changeCountdown: 0,
      },
      render: function () {

        this.wind.changeCountdown--;
        this.wind.direction += this.wind.directionDelta;
        this.wind.speed += this.wind.speedDelta;

        if(this.wind.changeCountdown <= 0) {
          var newSpeed = Math.random() * 8,
              newDirection = Math.random() * Math.PI * 2;

          this.wind.changeCountdown = Math.random() * 500;
          this.wind.speedDelta = (newSpeed - this.wind.speed) / this.wind.changeCountdown;
          this.wind.directionDelta = (newDirection - this.wind.direction) / this.wind.changeCountdown;
          console.log("Wind change: ", this.wind);
        }

        var windXVelocity, windYVelocity;
        windXVelocity = processing.cos(this.wind.direction) * this.wind.speed;
        windYVelocity = processing.sin(this.wind.direction) * this.wind.speed;

        this.animations = $.map(this.animations, function (animation, index) {
          animation.x += windXVelocity + animation.x_velocity;
          animation.y += windYVelocity + animation.y_velocity;
          animation.rotation += animation.rotation_velocity;

          if(animation.x > $window.innerWidth() + 100) {
            animation.x = -10;
            animation.y = Math.random() * $window.innerHeight();
          } else if(animation.x < -100) {
            animation.x = $window.innerWidth() + 10;
            animation.y = Math.random() * $window.innerHeight();
          } else if(animation.y > $window.innerHeight() + 100) {
            animation.y = -10;
            animation.x = Math.random() * $window.innerWidth();
          } else if(animation.y < -100) {
            animation.y = $window.innerHeight() + 10;
            animation.x = Math.random() * $window.innerWidth();
          }

          processing.resetMatrix();
          processing.translate(animation.x, animation.y);
          processing.rotate(animation.rotation);

          processing.noStroke();
          processing.fill(animation.color[0], animation.color[1], animation.color[2], animation.color[3]);
          //processing.bezier(0, 0, 10, 10, 90, 90, 100, 100);
          processing.ellipse(0, 0, 50, 20);

          return animation;
        });

        processing.resetMatrix();
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
        this.alpha -= 32;
        for(var i = 0; i < 5; ++i) {
          this.animations.pop();
        }
        this.render();
      },
      inTransition: function () {
        this.alpha += 8;
        for(var i = 0; i < 5; ++i) {
          this.addRandomLeaf();
        }
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

  var clear = function (slide, previousSlide) {
    processing.background(slide.background);
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
        if(slide.click) {
          slide.click.call(slide, command);
        }
      }
    };
  };

  processing.draw = function() {
    var slide = slides[currentSlide];
    if(inTransition && slide.inTransition) {
      clear(slide, previousSlide);

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
      clear(slide);
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
