/**
 * @directive = sptDataHora
 *
 * Diretiva que cria campo para hora
 *
 * Parametros da diretiva (na forma de atributos):
 *
 * model: 'model de data na qual a hora será bindada'
 *
 */

app.directive('sptDataHora', sptDataHora);

sptDataHora.inject = [];

function sptDataHora() {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            model: '=',
        },
        controller: function ($scope) {
            $scope.horas = montaTempo(0, 24);
            $scope.minutos = montaTempo(0, 60);

            if (!!$scope.model) {
                $scope.data = {
                    hora: ('0' + moment($scope.model).hours()).slice(-2),
                    minuto: ('0' + moment($scope.model).minutes()).slice(-2)
                }
            }

            function montaTempo(minimo, maximo) {
                var tempo = [];

                for (var i = minimo || 0; i <= maximo - 1; i++) {
                    tempo.push(('0' + i).slice(-2));
                }
                return tempo;
            }

            $scope.$watch('data',function (newVal, old){
                if(newVal != old){
                    $scope.model = moment($scope.model)
                    .hours(newVal.hora)
                    .minutes(newVal.minuto)
                    .format();
                }   
            }, true)

            $scope.$watch('model',function (newVal, old){
                if(newVal != old){
                    $scope.model = moment($scope.model)
                    .hours($scope.data.hora)
                    .minutes($scope.data.minuto)
                    .format();
                }
            }, true)
        },
        templateUrl: 'app/data/spt-data-hora.html'
    }
}

