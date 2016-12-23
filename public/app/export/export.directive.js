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
        controller: function (){
            jQuery.fn.onPositionChanged = function (trigger, millis) {
                if (millis == null) millis = 100;
                var o = $(this[0]); // our jquery object
                if (o.length < 1) return o;

                var lastPos = null;
                var lastOff = null;
                setInterval(function () {
                    if (o == null || o.length < 1) return o; // abort if element is non existend eny more
                    if (lastPos == null) lastPos = o.position();
                    if (lastOff == null) lastOff = o.offset();
                    var newPos = o.position();
                    var newOff = o.offset();
                    if (lastPos.top != newPos.top || lastPos.left != newPos.left) {
                        $(this).trigger('onPositionChanged', { lastPos: lastPos, newPos: newPos });
                        if (typeof (trigger) == "function") trigger(lastPos, newPos);
                        lastPos = o.position();
                    }
                    if (lastOff.top != newOff.top || lastOff.left != newOff.left) {
                        $(this).trigger('onOffsetChanged', { lastOff: lastOff, newOff: newOff});
                        if (typeof (trigger) == "function") trigger(lastOff, newOff);
                        lastOff= o.offset();
                    }
                }, millis);

                return o;
            };
        },
        link: function (scope, element, attr) {

            onElementHeightChange($('.toolbar').get(0), function(newHeight){
                 $( "md-tabs-content-wrapper" ).offset({ top: newHeight+52, left: 0});
            });

            function onElementHeightChange(elm, callback){
                var lastHeight = elm.clientHeight, newHeight;
                (function run(){
                    newHeight = elm.clientHeight;
                    if( lastHeight != newHeight )
                        callback(newHeight);
                    lastHeight = newHeight;

                    if( elm.onElementHeightChangeTimer )
                        clearTimeout(elm.onElementHeightChangeTimer);

                    elm.onElementHeightChangeTimer = setTimeout(run, 200);
                })();
            }
        }
    }
})