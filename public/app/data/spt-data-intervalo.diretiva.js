/**
 * @directive = sptDataIntervalo
 *
 * Diretiva que cria um calendário de intervalo
 *
 *  inicio: 'Model de data fim',
 *    fim: 'Model de data fim',
 *    classeLabel: 'Classes CSS que é aplicada no label de data',
 *    labelDataInicio: 'Texto a ser exibido para data inicio',
 *    labelDataFim: 'Texto a ser exibido para data fim',
 *    labelHora: 'Texto a ser exibido para para hora ínicio e hora fim caso os mesmos não sejam definidos',
 *    labelHoraInicio: 'Texto a ser exibido para hora início',
 *    labelHoraFim: 'Texto a ser exibido para hora fim',
 *    requiredInicio: 'Bolleano ("true" ou "false") que  define se o campo de data início é obrigatório ou não',
 *    requiredFim: 'Bolleano ("true" ou "false") que  define se o campo de data fim é obrigatório ou não',
 *    required: 'Bolleano ("true" ou "false") que  define o campos de data início e data fim são obrigatórios ou não',
 *    horaPosSelecaoData: 'Bolleano ("true" ou "false") que  define se campo de hora será apresentado somente após ser selecionada uma data',
 *    hora: 'Bolleano ("true" ou "false") que  define se campo de hora será apresentado'
 *
 *  Obs: Essa diretiva contém 2 diretivas de datas e 2 de data-hora no template 'spt-data-intervalo.html'.
 *
 *  Exemplo:
 *
 *  <spt-data-intervalo
 *        inicio="inicioVigencia"
 *        label-data-inicio="Inicio da Vigência:*"
 *        classe-label="col-md-3"
 *        fim="fimVigencia"
 *        label-data-fim="Fim da Vigência:">
 *    </spt-data-intervalo>
 *
 */

app.directive('sptDataIntervalo', sptDataIntervalo);

sptDataIntervalo.inject = [];

function sptDataIntervalo() {

    return {
        restrict: 'E',
        replace: true,
        controller: 'DataIntervaloControle',
        templateUrl: 'app/data/spt-data-intervalo.html',
        scope: {
            inicio: '=?',
            fim: '=?',
            classeLabel: '@?',
			classeData: '@?',
            labelDataInicio: '@?',
            labelDataFim: '@?',
			classeHora: '@?',
            labelHora: '@?',
            labelHoraInicio: '@?',
            labelHoraFim: '@?',
            requiredInicio: '=?',
            requiredFim: '=?',
            required: '=?',
            horaPosSelecaoData: '=?',
            hora: '=?'
        }
    }
}
