/**
 * @directive = sptDataHora
 *
 * Diretiva que cria um calendário
 *
 * Parametros da diretiva (na forma de atributos):
 *
 * model: 'Model na qual a data sera bindada',
 * maxima: 'Data maxima de dias para o componente atual pode atingir,
 * minima: 'Data minima de dias que o componente autal pode atingir,
 * mascara: 'Máscara a ser utilizada no campo',
 * placeholder: 'Placeholder a ser utilizado no campo',
 * required: 'Define se o campo é obrigatório ou não',
 * id: 'Id do campo de data' 
 *
 * Obs: Essa diretiva possui dependências com a fabricas/data-utils-fabrica.
 * 
 */



	angular.module('app').directive('sptData', ['$rootScope', '$timeout', 'DataUtilsFabrica',

		function($rootScope, $timeout, DataUtilsFabrica) {

			return {
				restrict: 'E',
				replace: true,
				controller: 'DataControle',
				templateUrl: 'app/data/spt-data.html',
				scope: {
					model: '=',
					maxima: '=?',
					minima: '=?',					
					mascara: '@?',
					placeholder: '@?',
					required: '=?',
					id: '@?'
				},
				link: function(scope, element, attrs) {
					scope.formato = (!!scope.formato) ? scope.formato : 'L';
					scope.mascara = (!!scope.mascara) ? scope.mascara : '';
					scope.placeholder = (!!scope.placeholder) ? scope.placeholder : '';

					var datepicker = $(element).find('.datepicker-range-input');
					var datepickerRanges = {};
					// faz uma cópia de model para bindar um escopo no input
					// como o valor de model sera um objeto date e o valor no input deve ser apresentado como dd/mm/aaaa					
					if(!!scope.model){
						scope.data = DataUtilsFabrica.formataDataInput(angular.copy(scope.model));	
					}					

					function componenteData(objInput) {
						return objInput.data("daterangepicker");
					}

					function campoValido(data) {
						return new RegExp($rootScope.REGEX.DATA).test(data);
					}

					var config = {
						autoUpdateInput: false,
						singleDatePicker: true,
						showDropdowns: true,
						locale: {
							format: scope.formato
						}
					}
					
					if (!!scope.model && !!scope.model) {
						config.startDate = new Date(scope.model);
					}

					if (!!scope.minima) {
						config.minDate = scope.minima;
					}

					if (!!scope.maxima) {
						config.maxDate = scope.maxima;
					}

					//watcher para escutar model e atualizar escopo data caso model seja limpo
					scope.$watch('model', function(novo, antigo) {
						if (!novo && novo != antigo) {
							delete scope.data;
						} else if (!!novo) {
							scope.data = moment(novo).format(scope.formato);
						}
					});

					scope.$watch('minima', function(novo, antigo) {
						if (!!novo && novo != antigo) {
							var dataAtual = (!!scope.model) ? scope.model : novo;

							componenteData(datepicker).minDate = moment(novo);
							componenteData(datepicker).startDate = moment(dataAtual);
							componenteData(datepicker).endDate = moment(dataAtual);
						} else if (!novo) {
							// se novo valor não existir remove data miníma
							delete componenteData(datepicker).minDate;
						}
					});

					scope.$watch('maxima', function(novo, antigo) {
						if (!!novo && novo != antigo) {
							var dataAtual = (!!scope.model) ? scope.model : novo;

							componenteData(datepicker).maxDate =  moment(novo);
							componenteData(datepicker).startDate = moment(dataAtual);
							componenteData(datepicker).endDate = moment(dataAtual);
						} else if (!novo) {
							// se novo valor não existir remove data maxima
							delete componenteData(datepicker).maxDate;
						}
					});

					datepicker.on('blur', function(ev, picker) {

						if (!campoValido(datepicker.val())) {

							//demore valores e atualiza escopo model e data
							datepicker.val('');
							$timeout(function() {
								delete scope.model;
								delete scope.data;
							});
						} else {
							var data = DataUtilsFabrica.formataData(datepicker.val());

							//caso dataAtual seja maior que data minima ou menor que data maxima
							if (!!data && (!!scope.maxima && moment(scope.maxima) < moment(data)) || (!!scope.minima && moment(scope.minima) > moment(data))) {

								var valor = (!!scope.model) ? DataUtilsFabrica.formataDataInput(scope.model) : scope.model;
								datepicker.val(valor);
								//limpa o input
								if (!!scope.model) {
									componenteData(datepicker).startDate = moment(scope.model);
									componenteData(datepicker).endDate = moment(scope.model);
								}
								$timeout(function() {
									scope.data = valor;
								});
							} else {
								//obtem valor do datepicker e seta no objeto model e data
								$timeout(function() {
									scope.model = componenteData(datepicker).startDate.format();
								})
							}
						}
					});

					//bloqueia tecla "enter"
					datepicker.on('keyup keypress', function(e) {
						var keyCode = e.keyCode || e.which;
						if (keyCode === 13) {
							e.preventDefault();
							return false;
						}
					});

					datepicker.daterangepicker(config);

					//quando aplica daterangepicker
					datepicker.on('apply.daterangepicker', function(event, picker) {
						scope.$apply(function() {
							var data = picker.startDate;

							//caso dataAtual seja maior que data minima ou menor que data maxima
							if (scope.minima > data || scope.maxima < data) {

								//limpa o input
								datepicker.val("");
								$timeout(function() {
									delete scope.data;
								});
							} else {

								//obtem valor do datepicker e seta no objeto model e data
								datepicker.val(picker.startDate.format(scope.formato));
								$timeout(function() {
									scope.model = picker.startDate.format();
									scope.data = datepicker.val();
								})
							}
						});
					});

					datepicker.on('cancel.daterangepicker', function(event, picker) {
						scope.$applyAsync(function() {
							scope.model = null;
							datepicker.val('');
						});
					});

					datepicker.parent().find('i.calendar-daterangepicker').bind('click', function() {
						datepicker.trigger('click');
					});
				}
			}

		}
	])

