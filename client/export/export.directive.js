(function (angular) {
    angular.module("atlas")
	.directive("export", function () {
      return {
          restrict: "A",
          scope: {
              text: "=",
              name: "="
          },
          link: function (scope, element, attr) {
              element.bind("click", function () {

                  var link = angular.element('<a/>');
                  link.attr({
                      href: 'data:text/plain;charset=utf-8,' + encodeURI(scope.text),
                      target: '_blank',
                      download : scope.name+".txt"
                  })[0].click();
              });
          }
      }
  })
  // .directive('pCompare', pCompare);
  //     function pCompare($http, $q) {
  //       return {
  //         restrict: 'A',
  //         require: 'ngModel',
  //         link: function(scope, element, attrs, ngModel) {
  //             scope.$watch(attrs.ngModel, function() {
  //               ngModel.$validate();
  //             });
  //             ngModel.$validators.condicao = function(value) {
  //               attrs.useLength && (value = value.length);
  //               return (scope.$eval(value + attrs.pCompare + attrs.param));
  //             };
  //           }
  //       }
  // };
})(window.angular);
