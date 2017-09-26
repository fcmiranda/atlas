(function (angular) {
    angular
  .module("atlas")
  .directive('ngEnter', function () {
      return function (scope, elements, attrs) {
          elements.bind('keydown keypress', function (event) {
              if (event.which === 13) {
                  scope.$apply(function () {
                      scope.form.$setSubmitted();
                  });
                  event.preventDefault();
              }
          });
      };
  });
})(window.angular);
