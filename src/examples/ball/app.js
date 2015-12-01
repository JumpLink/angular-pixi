(function() {
  'use strict';
  var ape = angular.module('angular-pixi-example', [
    'angular-pixi',
  ]);
  ape.controller('AppController', function($log, $scope, PIXI) {
    $log.debug("[AppController]");
    $scope.container = new PIXI.Container();

    var g;
    g = new PIXI.Graphics();
    g.beginFill(0xFF0000, 1);
    g.drawCircle(50, 50, 20);
    g.endFill();

    $scope.container.addChild(g);

    $log.debug("[AppController.g]", g);

    var back = false;
    $scope.renderer = function (renderer, container, delta) {
      if (back) {
        g.y -= 1;
      } else {
        g.y += 1;
      }
      if (g.y > 40) {
        back = true;
      } else if (g.y <= 0) {
        back = false;
      }
      return true;
    };
  });
})();