app.controller('DataIntervaloControle', DataIntervaloControle);

DataIntervaloControle.$inject = ['$scope', '$rootScope'];

function DataIntervaloControle($scope, $rootScope) {

    $scope.classeLabel = $scope.classeLabel || '';
	$scope.classeData = $scope.classeData || '';
	$scope.classeHora = $scope.classeHora || '';
    $scope.required = $scope.required || false;
    $scope.requiredInicio = $scope.requiredInicio || $scope.required;
    $scope.requiredFim = $scope.requiredFim || $scope.required;
    var labelHoraInicio = (!!$scope.requiredInicio) ? 'Período de:*' : 'Período de:';
    var labelHoraFim = (!!$scope.requiredFim) ? 'Até:*' : 'Até:';
    $scope.labelDataInicio = ($scope.labelDataInicio) ? $scope.labelDataInicio : labelHoraInicio;
    $scope.labelDataFim = ($scope.labelDataFim) ? $scope.labelDataFim : labelHoraFim;
    $scope.labelHora = ($scope.labelHora) ? $scope.labelHora : 'às';
    $scope.labelHoraInicio = ($scope.labelHoraInicio) ? $scope.labelHoraInicio : $scope.labelHora;
    $scope.labelHoraFim = ($scope.labelHoraFim) ? $scope.labelHoraFim : $scope.labelHora;
    $scope.horaPosSelecaoData = ($scope.horaPosSelecaoData) ? $scope.horaPosSelecaoData : true;
    $scope.hora = ($scope.hora) ? $scope.hora : false;
}
	
