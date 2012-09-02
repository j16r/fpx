var $window = $(window);

var processingHandler = function (processing) {
  var slides = [];
  var currentSlide = 0;
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
    console.log(name);
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

    var params = $.deparam.querystring();
    if(params.slide) {
      switchToSlide(params.slide);
    } else {
      switchToSlide('intro');
    }
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
          x: Math.random() * $window.innerWidth(),
          y: Math.random() * $window.innerHeight()});
      },
      render: function () {
        this.animations = $.map(this.animations, function (animation, index) {
          if(--animation.lifetime <= 0) {
            return null;
          }

          processing.noStroke();
          processing.fill(169, 199, 235, 220);
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
        console.log('alpha', this.alpha);
        processing.fill(0, 0, 0, this.alpha);
        processing.textFont(fonts.quicksandLarge)
        processing.textAlign(processing.PConstants.CENTER);
        processing.text("PowerPoint is just simulated acetate overhead slides, and to me,\nthat is a kind of a moral crime", $window.innerWidth() / 2, $window.innerHeight() / 2);
        processing.textFont(fonts.quicksand)
        processing.text("-- Alan Kay", $window.innerWidth() / 1.8, $window.innerHeight() / 1.5);
      },
      draw: function () {
        //this.animations = $.map(this.animations, function (animation, index) {
          ////if(--animation.lifetime <= 0) {
            ////return null;
          ////}

          //processing.alpha(100);
          //processing.noStroke();
          //processing.fill(169, 199, 235);
          //processing.ellipse(animation.x, animation.y, animation.lifetime, animation.lifetime);

          //return animation;
        //});

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

  processing.setup = function () {
    loadFonts();
    createSlides();
    fitToWindow(); 
  };

  var clear = function () {
    processing.background(processing.color(159, 189, 225));
  };

  processing.draw = function() {
    clear();

    var slide = slides[currentSlide];
    if(inTransition && slide.inTransition) {
      var oldSlide = slides[previousSlide]
      if(oldSlide.outTransition) {
        oldSlide.outTransition();
      }

      slide.inTransition();

      if(transitionLifetime-- == 0) {
        console.log("transition finished");
        inTransition = false;
        previousSlide = currentSlide
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

  var switchToSlide = function(slide) {
    console.log("Slide :", slide);
    currentSlide = findSlideIndex(slide);
    console.log("currentSlide :", currentSlide);
    slides[currentSlide].init();

    if(previousSlide !== null) {
      console.log("inTransition");
      inTransition = true;
      transitionLifetime = 30;
    } else {
      console.log("Saving previous slide", currentSlide);
      previousSlide = currentSlide
    }
  };

  $(window).on('hashchange', function (event) {
    var nextSlide = event.getState('slide');
    console.log('hashchange:', nextSlide);
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
