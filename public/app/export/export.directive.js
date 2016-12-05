app.directive("export",
	function () {
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

app.directive("resize",
    function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var h = $("#filter").height();
            $(element).height($(window).height() - h -50);
            $(window).on("resize", function(){
                $(element).height($(window).height() - h -50);
            });
        }
    }
})