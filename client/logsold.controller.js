(function (angular, io, console, moment) {
    'use strict';
    var app = angular.module('atlas', ['ngAnimate','ngMaterial', 'ngSanitize', 'ngMaterialDatePicker', 'ngMessages','ui.router']);
    app.config(AppConfig);

    AppConfig.$inject = ['$locationProvider','$stateProvider','$mdThemingProvider'];
    function AppConfig ($locationProvider,$stateProvider) {
    	$locationProvider
    	.html5Mode({
                enabled: true, // set HTML5 mode
                requireBase: false // I removed this to keep it simple, but you can set your own base url
            });

    	$stateProvider
        .state('home', {
    		url: '/',
    		templateUrl: 'main.html',
            controller: 'LogsController',
            controllerAs: 'logsCtrl',
    	}).state('home.aplicacao', {
    		url: ':app',
            controller: function ($scope, $stateParams){
                $scope.socket.on('listApps', function (apps) {
                    $scope.logsCtrl.selectedApps = $scope.logsCtrl.apps.filter((app) => {return $stateParams.app.toUpperCase() === app.name.toUpperCase()});
                });
            },
    	});
    }

    app.run(function () {})
    .controller('LogsController', ['$scope', '$rootScope', '$filter', '$timeout', '$mdSidenav', '$http', '$element', '$mdToast', '$state', '$stateParams',
    function ($scope, $rootScope, $filter, $timeout, $mdSidenav, $http, $element, $mdToast, $state, $stateParams) {
        var socket = io.connect(),
            controller = this;

        $scope.socket = socket;
        controller.expressions = [];
        controller.apps = [];
        controller.tabs = [];
        controller.selectedApps = [];
        controller.pesquisando = false;
        //controller.dateTimeStart = moment('2017-09-18 12:00:25').subtract(1, 'h');
        controller.dateTimeStart = moment('2017-09-18 12:00:25');
        controller.dateTimeEnd = moment('2017-09-18 12:30:25');

        controller.removeTab = function (tab) {
            controller.tabs.splice(controller.tabs.indexOf(tab), 1);
        };

        controller.tratarTab = function (tab) {
            tab.content = $filter('orderBy')(tab.lines).join('\n');
            tab.highlights.forEach(function (search, index) {
                tab.content = tab.content.replace(new RegExp(search, 'g'), '<span class="ç' + index + '">' + search + '</span>');
            });
        };

        controller.tratarTabs = function () {
            if (controller.tabPromise) {
                $timeout.cancel(controller.tabPromise);
            }
            controller.tabPromise = $timeout(function () {
                controller.tabs.forEach(function (tab) {
                    controller.tratarTab(tab);
                });
            }, 250);
        };

        controller.pesquisar = function () {
            if (controller.pesquisando) {
                return;
            } else if (controller.expressions.length > 0 && controller.dateTimeStart && controller.dateTimeEnd && controller.selectedApps.length > 0) {
                //controller.pesquisando = true;
                socket.emit('pesquisar', {
                    apps: controller.selectedApps,
                    expressions: controller.expressions,
                    dateTimeStart: controller.dateTimeStart.valueOf(),
                    dateTimeEnd: controller.dateTimeEnd.valueOf()
                });
            }
        };

        controller.submitForm = function(form){
            if(controller.expressions.length > 0){
                form.chips.$error.validationError = false;
            } else {
                form.chips.$error.validationError = true;
            }
            if(form) {
                controller.pesquisar();
            }
        };

        socket.on('putInTabs', function (line) {
            controller.pesquisando = false;
            var tabIdsPreenchidos = [];
            controller.tabs.forEach(function (tab) {
                if (tab && line.tabIds.indexOf(tab.id) >= 0) {
                    tabIdsPreenchidos.push(tab.id);
                    if (tab.lines.indexOf(line.line) < 0) {
                        tab.lines.push(line.line);
                    }
                }
            });
            line.tabIds.forEach(function (tabId) {
                if (tabIdsPreenchidos.indexOf(tabId) < 0) {
                    controller.tabs.push({
                        id: tabId,
                        lines: [line.line],
                        content: "",
                        highlights: []
                    });
                }
            });
            controller.tratarTabs();
        });

        socket.on('listApps', function (apps) {
            controller.apps = apps;
        });

        socket.emit('listApps');
    }]);
}(window.angular, window.io, window.console, window.moment));
