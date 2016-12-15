var app = angular.module('app', ['ui.bootstrap', 'checklist-model', 'ngStorage', 'ngSanitize', 'ngMaterial', 'ngMessages', 'cgBusy']);

app.run(function($rootScope, $http, $timeout, $interval, $localStorage, $mdToast) {

})
.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $localStorage, $http, $element, $mdToast) {
    $scope.count = 0;	
	$scope.formData = {
		expression: 'F12345|F11111',
		expressions: ['F4404357'],
		start: moment(0, "HH"),
		end: moment(),		
	};
	$scope.highlights = [];
	$scope.validate = {
		'expressions': false
	}

	$scope.transformChip = function (){
		$scope.validate.expressions = ($scope.formData.expressions.length == 0);
	}

	$scope.transformHighlights = function (){
		$scope.validate.expressions = ($scope.formData.expressions.length == 0);
	}

	$scope.localStorage = $localStorage;
	$scope.localStorage.mode = $scope.localStorage.mode || "date";
	$scope.files = [];
	$scope.clicked = false;
	$scope.searchTerm = '';
	$scope.data = {
      selectedIndex: 0,
      secondLabel:   "Item Two",
      bottom:        false
    };
    $scope.next = function() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
    };
    $scope.previous = function() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };

	$http.get('/files').then(
		function (response) {					
			$scope.files = response.data;
			$scope.formData.selectedFiles = [response.data[0]];
		}
	);

	$scope.exportByDate = function () {
		$scope.alerts = [];
		delete $scope.extracted;
		$scope.alerts = [{msg: 'processando...', type: 'warning'}];
		$scope.savedExpression =  $scope.formData.expression;

		$http.post('/extractInterval', {
			start: moment($scope.formData.start).format("YYYYMMDD-HHmmss"),
			end: moment($scope.formData.end).format("YYYYMMDD-HHmmss"),
			expression: $scope.formData.expression,
		})
		.then(
			function (response) {					
				$scope.session = response.data.session;
				$scope.extracted = response.data.extracted;
				$scope.extractedHTML = asHTML(response.data.extracted);
				$scope.alerts = [];				
			}, function (response) {
				$scope.alerts = [{msg: response.data.message, type: 'danger'}];
			}
		);			
	};

	$scope.exportByFiles = function () {
		$scope.promise = $http.post('/extractFiles', {
			expressions: $scope.formData.expressions,
			files: $scope.formData.selectedFiles
		}).then(
			function (response) {
				$scope.tabs = response.data.extracted;	
				$scope.toast('Sucesso!','success');
			}, function (response) {
				$scope.toast(response.data.message,'error');
			}
		);			
	};

	function asHTML(text) {
		var expression = new RegExp($scope.savedExpression, "g");		
		return text;
		//return text.replace(/(?:\r\n|\r|\n)/g, '<span>\n</span>')	.replace(expression, '<span class="ex-1">'+ $scope.savedExpression + '</span>');
	}

	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};

	$scope.newZip = function () {		
		$http.post('/zip', {
		})
		.then(
			function (response) {					
				$scope.extracted = response.data.extracted;
				$scope.extractedHTML = response.data.extracted;

				$http.get('/files').then(
				function (response) {					
					$scope.files = response.data;
				}, function (response) {

				});
			}, function (response) {
				$scope.alerts = [{msg: response.data.message, type: 'danger'}];
			}
		);
	}

	$scope.clearSearchTerm = function() {
		$scope.searchTerm = ''
	};

	$scope.submit = function (){
		$scope.exportByFiles();	
	}

	$element.find('input').on('keydown', function(ev) {
	  ev.stopPropagation();
	});


	$scope.toast = function(text, type) {
	    $mdToast.show({
          hideDelay   : 3000,
          position    : 'bottom left',
          controller  : 'ToastCtrl',
          templateUrl : 'app/toast/toast.html',
          toast: {
          	text: text,
          	type: type
          } 
        });
	  };

	
	var tabs = [],	
        selected = null,
        previous = null;
    $scope.tabs = [];
    $scope.selectedIndex = 0;
    $scope.$watch('selectedIndex', function(current, old){
      previous = selected;
      selected = tabs[current];
      if ( old + 1 && (old != current)) console.log('Goodbye ' + previous.title + '!');
      if ( current + 1 )                console.log('Hello ' + selected.title + '!');
    });
    $scope.addTab = function (title, view) {
      view = view || title + " Content View";
      tabs.push({ title: title, content: view, disabled: false});
    };
    $scope.removeTab = function (tab) {
      var index = tabs.indexOf(tab);
      tabs.splice(index, 1);
    };

 })
.config(function($mdThemingProvider) {
// Configure a dark theme with primary foreground yellow
$mdThemingProvider.theme('docs-dark', 'default')
  .primaryPalette('yellow')
  .dark();

})
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
})
.value('cgBusyDefaults',{
  backdrop: false,
  templateUrl: 'app/loader/loader.html',
  delay: 300,
  minDuration: 700,
  wrapperClass: 'my-class my-class2'
});