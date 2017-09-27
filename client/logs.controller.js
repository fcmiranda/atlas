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
        // var socket = io('http://localhost:3000'),
        var socket = io.connect('/'),
            controller = this;

        $scope.socket = socket;
        controller.chips = [];
        controller.apps = [];
        controller.tabs = [];
        controller.regexExpression = '';
        controller.chipsExpression = '';
        controller.selectedApps = [];
        controller.pesquisando = false;
        controller.loading = false;
        controller.isRegex = false;
        controller.dateTimeStart = moment().subtract(1, 'h');
        controller.dateTimeEnd = moment();

        controller.removeTab = function (tab) {
            controller.tabs.splice(controller.tabs.indexOf(tab), 1);
        };

        controller.tratarTab = function (tab) {
            tab.content = controller.sortLines(tab);
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
            if (controller.pesquisando && controller.chips.length > 0 && controller.dateTimeStart && controller.dateTimeEnd && controller.selectedApps.length > 0) {
                return;
            }
            controller.loading = true;
            socket.emit('pesquisar', {
                apps: controller.selectedApps,
                expression: (controller.isRegex) ? controller.regexExpression : controller.chipsExpression,
                dateTimeStart: controller.dateTimeStart.valueOf(),
                dateTimeEnd: controller.dateTimeEnd.valueOf()
            });
        };

        controller.submitForm = function(form){
            if(!controller.isRegex){
                if(controller.chips.length > 0){
                    form.chips.$error.validationError = false;
                } else {
                    form.chips.$error.validationError = true;
                }
            }
            if(form) {
                controller.pesquisar();
            }
        };

        controller.sortLines = function (tab) {
            return insertSort(tab.lines).join('\n');
        }

        controller.addChip = function (chip){
            controller.chips[controller.chips.indexOf(chip)] = escapeRegExp(chip);
            controller.chipsExpression = controller.chips.join('|');
        }

        controller.removeChip = function (chip){
            controller.chipsExpression = controller.chips.join('|');
        }

        socket.on('putInTabs', function (linesObj) {
            controller.pesquisando = false;
            var tabIdsPreenchidos = [];
            controller.tabs.forEach(function (tab) {
                if (tab && linesObj.tabIds.indexOf(tab.id) >= 0) {
                    tabIdsPreenchidos.push(tab.id);
                    tab.lines = tab.lines.concat(linesObj.lines);
                }
            });
            linesObj.tabIds.forEach(function (tabId) {
                if (tabIdsPreenchidos.indexOf(tabId) < 0) {
                    controller.tabs.push({
                        id: tabId,
                        lines: linesObj.lines,
                        content: "",
                        highlights: [],
                        textFormat: false
                    });
                }
            });
        });

        socket.on('complete', function (obj) {
            controller.loading = false;
            obj.message && showToast(obj.message);
            controller.tabs.forEach(function (tab){
                if (tab && !tab.content && obj.tabIds.indexOf(tab.id) >= 0) {
                    $timeout(function() {
                        tab.content = controller.sortLines(tab);
                    })
                }
            })
        });

        socket.on('listApps', function (apps) {
            controller.apps = apps;
        });

        socket.emit('listApps');

        function escapeRegExp(text) {
          return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
        }

        function showToast (toast) {
            var classMap = {
                success: 'md-accent',
                warn: 'md-warn'
            }

            var toast = $mdToast.simple()
              .textContent(toast.description)
              .highlightAction(true)
              .highlightClass(classMap[toast.type])// Accent is used by default, this just demonstrates the usage.
              .position('bottom left');
            $mdToast.show(toast);
        }

        function insertSort(arr) {
            for (var i = 1; i < arr.length; i++) {
              var tmp = arr[i],
                  j = i;
              while (arr[j - 1] > tmp) {
                arr[j] = arr[j - 1];
                --j;
              }
              arr[j] = tmp;
            }
            return arr;
          }
    }]);
}(window.angular, window.io, window.console, window.moment));
