app.factory('DataUtilsFabrica', DataUtilsFabrica);

DataUtilsFabrica.$inject = [];

function DataUtilsFabrica() {

	return {
		formataData: function(data) {
			switch (true) {
				case new RegExp("[0-9]{2}/[0-9]{2}/[0-9]{4}").test(data):
					data = data.split('/');
					data = new Date(data[2], data[1] - 1, data[0]);
					break;
				case angular.isDate(new Date(data)):
					data = moment(data).format("YYYY-MM-DD");
					break;
			}

			return data;
		},
		formataDataInput: function(data) {
			return moment(data).format("DD/MM/YYYY");
		}
	}
}
