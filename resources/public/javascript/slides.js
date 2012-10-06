var $window = $(window);
var socket = null;
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
var images = {};
var width = 0, height = 0;

var randomRange = function (from, to) {
  return (Math.random() * (to - from)) - to;
};

var random = function (to) {
  return Math.random() * (to || 1);
};

var processingHandler = function (processing) {

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
    width = $window.innerWidth();
    height = $window.innerHeight();
    processing.size(width, height);
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
        this.addRainDrop(command.x, command.y, [169, 239, 235, 220]);
      },
      addRandomRainDrop: function () {
        var x = random(width), y = random(height);
        this.addRainDrop(x, y);
      },
      addRainDrop: function (x, y, color) {
        this.animations.push({
          lifetime: random(100),
          radius: random(100),
          color: color || [169, 199, 235, 220],
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

        processing.fill(0);
        processing.textFont("Helvetica");
        processing.textAlign(processing.PConstants.LEFT);
        processing.textSize(36);
        processing.text("PLAY >>>>", this.basePosition + 100, 350);

        processing.textSize(112);
        processing.text("fp(x)", this.basePosition + 100, 300);

        processing.fill(0, 0, 0, 20);
        processing.textSize(412);
        processing.text("fp(x)", this.basePosition + width / 3, height / 1.1);
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
        this.maxAnimations = 200;
      },
      addRandomLeaf: function (x, y) {
        var x, y;
        switch(Math.floor(random(4))) {
          case 0:
            x = -100;
            y = random(height);
            break;
          case 1:
            x = width + 100;
            y = random(height);
            break;
          case 2:
            x = random(width);
            y = -100;
            break;
          case 3:
            x = random(width);
            y = height + 100;
            break;
        };
        this.addLeaf(x, y);
      },
      randomLeaf: function () {
        return images.leaves[Math.floor(random(images.leaves.length))];
      },
      addLeaf: function (x, y, shape) {
        if(this.animations.length > this.maxAnimations) {
          return;
        }
        this.animations.push({
          shape: shape || this.randomLeaf(),
          x_velocity: Math.random(),
          y_velocity: Math.random(),
          direction: random(Math.PI * 2),
          rotation: random(Math.PI * 2),
          rotation_velocity: Math.random() / 20,
          x: x,
          y: y});
      },

      click: function (command) {
        var shape = null;
        if (Math.random() > 0.9) {
          shape = images.piggy;
        }
        this.addLeaf(command.x, command.y, shape);
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
        if(this.animations.length < 20) {
          this.addRandomLeaf();
        }

        this.wind.changeCountdown--;
        this.wind.direction += this.wind.directionDelta;
        this.wind.speed += this.wind.speedDelta;

        if(this.wind.changeCountdown <= 0) {
          var newSpeed = random(8),
              newDirection = randomRange(-Math.PI, Math.PI);

          this.wind.changeCountdown = random(500);
          this.wind.speedDelta = (newSpeed - this.wind.speed) / this.wind.changeCountdown;
          this.wind.directionDelta = (newDirection - this.wind.direction) / this.wind.changeCountdown;
        }

        var windXVelocity, windYVelocity;
        windXVelocity = processing.cos(this.wind.direction) * this.wind.speed;
        windYVelocity = processing.sin(this.wind.direction) * this.wind.speed;

        this.animations = _.compact($.map(this.animations, function (animation, index) {
          animation.x += windXVelocity + animation.x_velocity;
          animation.y += windYVelocity + animation.y_velocity;
          animation.rotation += animation.rotation_velocity;

          if(animation.x > width + 100 ||
              animation.x < -100 ||
              animation.y > height + 100 ||
              animation.y < -100) {
            return null;
          }

          processing.resetMatrix();
          processing.translate(animation.x, animation.y);
          processing.rotate(animation.rotation);

          processing.noStroke();
          processing.shape(animation.shape, 0, 0, 80, 80);

          return animation;
        }));

        processing.resetMatrix();
        processing.fill(0, 0, 0, this.alpha);
        processing.textFont(fonts.quicksandLarge)
        processing.textSize(54);
        processing.textAlign(processing.PConstants.CENTER);
        processing.text("PowerPoint is just simulated acetate overhead slides, and to me, that is a kind of a moral crime\n\n-- Alan Kay", 100, height / 2, width - 300, height);
      },
      draw: function () {
        this.render();
      },
      outTransition: function () {
        this.alpha -= 32;
        this.animations.pop();
        this.render();
      },
      inTransition: function () {
        this.alpha += 8;
        this.render();
      }};

    slides.push(slide);

    slide = {
      init: function () {
        this.background = processing.color(255, 255, 255);
        this.animations = null;
      },
      jaggedText: function(string, x, y) {
        for(var i = 0; i < 5; ++i) {
          processing.resetMatrix();
          processing.textSize(126);
          processing.fill(0, 0, 0, random(90));
          processing.translate(-200 + random(10), -200 + random(10));
          processing.rotate(randomRange(-0.006, 0.006));
          processing.translate(x + 400 + random(10), y + 200 + random(10));
          processing.text(string, 0, 0);
        }
      },
      rightEdgedText: function(string, y) {
        var textWidth = processing.textWidth(string);
        processing.text(string, width - textWidth, y); 
      },
      draw: function () {
        processing.fill(0, 0, 0);
        processing.textFont(fonts.douar)
        processing.textSize(128);
        this.rightEdgedText("John Barker", height - 110);
        this.rightEdgedText("Pivotal Labs", height - 10);

        if(this.animations == null || this.animations.length > 100) {
          this.animations = [[random(width), random(height)]];
        }

        var distance = random(20),
            quadrant = random();

        if(quadrant > 0.25) {
          randX = randY = distance;
        } else if(quadrant > 0.5) {
          randX = randY = -distance;
        } else if(quadrant > 0.75) {
          randX = -distance;
          randY = distance;
        } else {
          randX = distance;
          randY = -distance;
        }
        var lastAnimation = this.animations[this.animations.length - 1];
        randX += lastAnimation[0];
        randY += lastAnimation[1];
        this.animations.push([randX, randY]);

        processing.resetMatrix();
        processing.stroke(0, 0, 0, 10);
        var oldX = lastAnimation[0], oldY = lastAnimation[1];
        _.each(this.animations, function (animation, index) {
          processing.line(oldX, oldY, animation[0], animation[1]);
          oldX = animation[0];
          oldY = animation[1];
        }, this);
      }};

    slides.push(slide);
  };

  var loadFonts = function () {
    fonts.quicksandLarge = processing.createFont("Quicksand", 36);
    fonts.quicksand = processing.createFont("Quicksand", 24);
    fonts.douar = processing.createFont("Douar", 24);
  };

  var loadImages = function () {
    images.piggy = processing.loadShape("/images/piggy.svg");
    images.leaves = [];
    images.leaves[0] = processing.loadShape("/images/leaf0.svg");
    images.leaves[1] = processing.loadShape("/images/leaf1.svg");
    images.leaves[2] = processing.loadShape("/images/leaf2.svg");
    images.leaves[3] = processing.loadShape("/images/leaf3.svg");
  };

  var setInitialSlide = function () {
    $(window).trigger('hashchange');
  };

  var clear = function (slide, previousSlide) {
    if(slide.background) {
      processing.background(slide.background);
    }
  };

  processing.setup = function () {
    loadFonts();
    loadImages();
    createSlides();
    fitToWindow();
    setInitialSlide();

    processing.shapeMode(processing.PConstants.CENTER);

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
