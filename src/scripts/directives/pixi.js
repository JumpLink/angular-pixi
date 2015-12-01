angular.module('angular-pixi').directive('pixi', function ($parse, $window, PIXI) {
  return {
    restrict: 'E',
    template: '<canvas>Not supported</canvas>',
    scope: {
      width: '=',
      height: '=',
      stage: '=',
      renderer: '@?',
      fps: '@?',
      renderFunc: '=?',
      autoResize: '@?',
      transparent: '@?',
      clearBeforeRender: '=?',
      backgroundColor: '=?',
    },
    controller: function ($scope, $element, $attrs) {
      var self = this;

      if (!$scope.stage) {
        console.log("create default pixi container");
        $scope.stage = new PIXI.Container();
        //TODO: reassign to attribute
      }

      var renderer;

      var view = $element.find('canvas')[0];

      var options = {
        view: view,
        transparent: $scope.transparent || false,
        antialias: $scope.antialias || false,
        resolution: $scope.resolution || 1,
        clearBeforeRender: $scope.clearBeforeRender || false,
        autoResize: $scope.autoResize || false,
        backgroundColor: $scope.backgroundColor || 0x000000,
      };

      console.log(options);

      switch ($scope.renderer) {
        case 'canvas':
          renderer = new PIXI.CanvasRenderer(view.width, view.height, options);
          break;
        case 'webgl':
          try {
            renderer = new PIXI.WebGLRenderer(view.width, view.height, options);
          } catch (e) {
            $scope.$emit('pixi.webgl.init.exception', e);
            return;
          }
          break;
        default:
          renderer = PIXI.autoDetectRenderer(view.width, view.height, options);
          break;
      }

      $scope.$watch('width', function(width) {
        renderer.resize($scope.width, $scope.height);
      });

      $scope.$watch('height', function(height) {
        renderer.resize($scope.width, $scope.height);
      });

      this.render = function render(delta, force) {
        var doRender = true;
        if ($scope.renderFunc) {
          doRender = $scope.renderFunc(renderer, $scope.stage, delta);
        }
        if (force || doRender !== false) {
          renderer.render($scope.stage);
        }
      };

      var fps = $scope.fps || 30;

      var interval = 1000 / fps;
      var now,
          delta,
          then = Date.now();
      function renderLoop() {
        requestAnimationFrame(renderLoop);
        now = Date.now();
        delta = now - then;
        if (delta > interval) {
          then = now - (delta % interval);
          self.render(delta);
        }
      }
      requestAnimationFrame(renderLoop);

      this.getContainer = function () {
        return container;
      };

      this.getRenderer = function () {
        return renderer;
      };

      this.getContext = function () {
        if (renderer.gl) {
          return renderer.gl;
        } else {
          return renderer.context;
        }
      };
    }
  };
});
