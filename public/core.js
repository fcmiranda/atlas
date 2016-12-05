var app = angular.module('app', ['ui.bootstrap', 'checklist-model', 'ngStorage', 'ngSanitize']);

app.run(function($rootScope, $http, $timeout, $interval, $localStorage) {
	$rootScope.count = 0;	
	$rootScope.formData = {
		expression: 'falha',
		start: moment(0, "HH"),
		end: moment()		
	};
	$rootScope.localStorage = $localStorage;
	$rootScope.localStorage.mode = $rootScope.localStorage.mode || "date";
	$rootScope.files = [];
	$rootScope.clicked = false;

	$http.get('/files').then(
		function (response) {					
			$rootScope.files = response.data;
		}, function (response) {

		});	

	$rootScope.exportByDate = function () {
		$rootScope.alerts = [];
		delete $rootScope.extracted;
		$rootScope.alerts = [{msg: 'processando...', type: 'warning'}];
		$rootScope.savedExpression =  $rootScope.formData.expression;

		$http.post('/extractInterval', {
			start: moment($rootScope.formData.start).format("YYYYMMDD-HHmmss"),
			end: moment($rootScope.formData.end).format("YYYYMMDD-HHmmss"),
			expression: $rootScope.formData.expression,
		})
		.then(
			function (response) {					
				$rootScope.session = response.data.session;
				$rootScope.extracted = response.data.extracted;
				$rootScope.extractedHTML = asHTML(response.data.extracted);
				$rootScope.alerts = [];				
			}, function (response) {
				$rootScope.alerts = [{msg: response.data.message, type: 'danger'}];
			}
		);			
	};

	$rootScope.exportByFiles = function () {
		$rootScope.alerts = [];
		delete $rootScope.extracted;
		$rootScope.alerts = [{msg: 'processando...', type: 'warning'}];
		$rootScope.savedExpression =  $rootScope.formData.expression;			

		$http.post('/extractFiles', {
			expression: $rootScope.formData.expression,
			files: $rootScope.formData.files
		})
		.then(
			function (response) {					
				$rootScope.session = response.data.session;
				$rootScope.extracted = response.data.extracted;
				$rootScope.extractedHTML = asHTML(response.data.extracted);
				$rootScope.alerts = [];		
			
			}, function (response) {
				$rootScope.alerts = [{msg: response.data.message, type: 'danger'}];
			}
		);			
	};

	function asHTML(text) {

		var expression = new RegExp($rootScope.savedExpression, "g");
		
		return text.replace(/(?:\r\n|\r|\n)/g, '<span>\n</span>')
					.replace(expression, '<span class="ex-1">'+ $rootScope.savedExpression + '</span>');
	}

	$rootScope.closeAlert = function(index) {
	    $rootScope.alerts.splice(index, 1);
	};

	$rootScope.transform = function () {
		$rootScope.extracted = $rootScope.extracted;
	}

});