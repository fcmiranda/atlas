
var app = angular.module('app', ['ngStorage', 'ngSanitize', 'ngMaterial', 'ngMessages','ui.router']);

app.run(AppRun)
function AppRun (){};
app.controller('AppCtrl', AppController)
AppController.$inject = ['$scope', '$timeout', '$mdSidenav', '$localStorage', '$http', '$element', '$mdToast', '$state'];
function AppController ($scope, $timeout, $mdSidenav, $localStorage, $http, $element, $mdToast, $state) {
	$scope.count = 0;
	$scope.formData = {		
		expressions: [],
		start: moment(0, "HH"),
		end: moment(),
	};
	$scope.validate = {
		'expressions': false
	}
	$scope.localStorage = $localStorage;
	$scope.localStorage.mode = $scope.localStorage.mode || "date";
	$scope.files = [];
	$scope.clicked = false;
	$scope.searchTerm = '';

	$http.get('api/files').then(
			function (response) {
				$scope.files = response.data;
				$scope.formData.selectedFiles = [];
			}
		);

	/*$scope.exportByDate = function () {
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
	};*/

	$scope.exportByFiles = function () {
		$scope.promise = $http.post('api/extractFiles', {
			expressions: $scope.formData.expressions,
			files: $scope.formData.selectedFiles
		}).then(
			function (response) {
				$scope.tabs = $scope.tabs.concat(response.data.extracted);
				$scope.toast('Sucesso!','success');
			}, function (response) {
				$scope.toast(response.data.message,'error');
			}
		);
	}

	$scope.newZip = function () {
		$http.post('api/zip', {
		})
		.then(
			function (response) {
				$scope.extracted = response.data.extracted;
				$scope.extractedHTML = response.data.extracted;

				$http.get('api/files').then(
					function (response) {
						$scope.files = response.data;
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

	var previous = null;
	$scope.selected = null;
	$scope.tabs = $localStorage.tabs || [];
	delete $localStorage.tabs;
	$scope.selectedTabIndex = 0;
	$scope.$watch('selectedTabIndex', function(current, old){
		previous = $scope.selected;
		$scope.selected = $scope.tabs[current];
		if ( old + 1 && (old != current)) console.log('Goodbye ' + previous.title + '!');
		if ($scope.selected && (current + 1) ) console.log('Hello ' + $scope.selected.title + '!');
	});

	$scope.removeTab = function (tab) {
		var index = $scope.tabs.indexOf(tab);
		$scope.tabs.splice(index, 1);
	};

	$scope.openInNew = function (tab){
		$localStorage.tabs = [tab];
		$timeout(function(){
			var url = $state.href('home');
			window.open(url,'_blank');
			$scope.removeTab(tab);
		},500);
	}

	$scope.validateExpressions = function (){
		$scope.validate.expressions = ($scope.formData.expressions.length == 0);
	}

	var hasInArray = function (array, expression){
		var value = false;

		array.forEach((item) => {
			if(new RegExp(item).test(expression)){
				value = true;
				return;
			}
		});

		return value;
	}

	$scope.addHighlights = function (search, index){

		if(new RegExp(search).test('<span class="ç"><i><\/i><\/span>')){
			var highlights = $scope.tabs[$scope.selectedTabIndex].highlights
			highlights.splice(highlights.indexOf(search), 1);
			return;
		}

		var content = $scope.tabs[$scope.selectedTabIndex].content;
		var highlights = angular.copy($scope.tabs[$scope.selectedTabIndex].highlights);
		var chighlights = $scope.tabs[$scope.selectedTabIndex].chighlights;
		if(chighlights.indexOf() < 0){
			chighlights.push(search);
		}else{
			chighlights[chighlights.indexOf()] = search;
		}
		var index = chighlights.indexOf(search)

		if(search && content){
			if((highlights.length == 1) || (!hasInArray(highlights, search))){
				$scope.tabs[$scope.selectedTabIndex].content = content.replace(new RegExp(search, 'g'),'<span class="ç'+index+'">'+search+'<i id="'+index+'"></i></span>');
				if(!$scope.tabs[$scope.selectedTabIndex].pureContent){
					$scope.tabs[$scope.selectedTabIndex].pureContent = content;
				}
			}else{
				highlights = highlights.sort(function(a, b){
					return b.length - a.length;
				});

				var orig = $scope.tabs[$scope.selectedTabIndex].highlights;
				content = $scope.tabs[$scope.selectedTabIndex].pureContent;

				highlights.forEach((hl) => {
					content = content.replace(new RegExp(hl, 'g'),'<span class="ç'+orig.indexOf(hl)+'">'+hl+'<i id="'+orig.indexOf(hl)+'"></i></span>');
				});

				$scope.tabs[$scope.selectedTabIndex].content = content;
			}
		}
	}

	$scope.removeHighlights = function (search){
		var content = $scope.tabs[$scope.selectedTabIndex].content;
		var chighlights = $scope.tabs[$scope.selectedTabIndex].chighlights;

		if(search && content){
			$scope.tabs[$scope.selectedTabIndex].content = content.replace(new RegExp('<span class="ç'+chighlights.indexOf(search)+'">|'+'<i id="'+chighlights.indexOf(search)+'"></i></span>', 'g'), '');
			chighlights[chighlights.indexOf(search)] = undefined;
		}
	}

	$scope.selectHighlights = function (search){
		console.log(search);
	}
}

app.config(AppConfig);

AppConfig.$inject = ['$locationProvider','$stateProvider','$mdThemingProvider'];
function AppConfig ($locationProvider,$stateProvider) {
	$locationProvider
	.html5Mode({
            enabled: true, // set HTML5 mode
            requireBase: false // I removed this to keep it simple, but you can set your own base url
        });
	var home = {
		name: 'home',
		url: '/',
		templateUrl: 'main.html'
	};
	$stateProvider.state(home);
}
