var app = angular.module('app', ['ui.bootstrap', 'checklist-model', 'ngStorage', 'ngSanitize', 'ngMaterial']);

app.run(function($rootScope, $http, $timeout, $interval, $localStorage) {

})
.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $localStorage, $http, $element) {
    $scope.count = 0;	
	$scope.formData = {
		expression: 'falha',
		start: moment(0, "HH"),
		end: moment()		
	};
	$scope.localStorage = $localStorage;
	$scope.localStorage.mode = $scope.localStorage.mode || "date";
	$scope.files = [];
	$scope.clicked = false;
	$scope.searchTerm = moment().format('YYYY');

	$http.get('/files').then(
		function (response) {					
			$scope.files = response.data;
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
		$scope.alerts = [];
		delete $scope.extracted;
		$scope.alerts = [{msg: 'processando...', type: 'warning'}];
		$scope.savedExpression =  $scope.formData.expression;			

		$http.post('/extractFiles', {
			expression: $scope.formData.expression,
			files: $scope.formData.files
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

	$element.find('input').on('keydown', function(ev) {
	  ev.stopPropagation();
	});

 })
.config(function($mdThemingProvider) {

// Configure a dark theme with primary foreground yellow

$mdThemingProvider.theme('docs-dark', 'default')
  .primaryPalette('yellow')
  .dark();

})
.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});
;