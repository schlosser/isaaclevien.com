(function(global) {
  'use strict';

  function _hasClass(element, className) {
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
  }

  function Staple(options) {
    var opts = options || {};
    this.settings = {
      stapleId: opts.stapleId || 'staple',
      scrollingElementId: opts.scrollingElementId || 'staple-scrolling',
      offset: opts.offset || 0,
      stapledClass: opts.stapledClass || 'stapled-bottom',
      mobileWidth: opts.mobileWidth || 640,
    };
    this.staple = document.getElementById(this.settings.stapleId);
    this.scrollingElement = document.getElementById(this.settings.scrollingElementId);
    this.inRAF = false;
    this.lastYOffset = 0;

    if (!this.staple) {
      console.error('No staple element with ID ' + this.settings.stapleId);
    }

    if (!this.scrollingElement) {
      console.error('No scrollingElement element with ID ' + this.settings.scrollingElementId);
    }

    return this;
  }

  Staple.prototype._stapleBottom = function() {
    if (!_hasClass(this.staple, this.settings.stapledClass)) {
      this.staple.className += ' ' + this.settings.stapledClass;
    }
  };

  Staple.prototype._unStaple = function() {
    this.staple.className = this.staple.className.replace(' ' + this.settings.stapledClass, '');
  };

  Staple.prototype.getOnScroll = function() {
    var _this = this;
    var onScroll = function() {
      _this.lastYOffset = window.pageYOffset;
      if (!_this.inRAF) {
        _this.inRAF = true;
        window.requestAnimationFrame(function() {
          if ((_this.lastYOffset + _this.lastStapleHeight) >= _this.lastScrollingElementBottom /* - _this.settings.offset  ?? */) {
            _this._stapleBottom();
          } else {
            _this._unStaple();
          }
          _this.inRAF = false;
        });
      }
    };
    return onScroll;
  };

  Staple.prototype.getOnResize = function() {
    var _this = this;
    var onResize = function() {
      _this.lastScrollingElementBottom = 
        window.pageYOffset + 
        _this.scrollingElement.getBoundingClientRect().top + 
        _this.scrollingElement.getBoundingClientRect().height;

      _this.lastStapleHeight = _this.staple.getBoundingClientRect().height;
    };
    return onResize;
  };

  Staple.prototype.enable = function() {
    this.onScroll = this.getOnScroll();
    this.onResize = this.getOnResize();
    this.onResize();
    this.onScroll();
    window.addEventListener('scroll', this.onScroll);
    window.addEventListener('resize', this.onResize);
  };

  Staple.prototype.disable = function() {
    this._unStaple();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
  };

  if (typeof define === 'function' && define.amd) {
    define(Staple);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Staple;
  } else {
    global.Staple = Staple;
  }

}(this));
