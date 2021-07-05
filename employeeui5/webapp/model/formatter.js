sap.ui.define([

],
    function () {

        function dateFormat(date) {
            var timeDate = 24 * 60 * 60 * 1000;

            if(date){
                // instance of today
                var dateNow = new Date();
                // formatter
                var dateFormatter = sap.ui.core.format.DateFormat.getDateInstance({pattern: 'yyyy/MM/dd'});
                // formatted date
                var dateNowFormat = new Date(dateFormatter.format(dateNow));
                // get instance of i81n model
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();


                switch(true){
                    // today
                    case date.getTime() === dateNowFormat.getTime():
                        return oResourceBundle.getText("today");
                    case date.getTime() === dateNowFormat.getTime() + timeDate:
                        return oResourceBundle.getText("tomorrow");
                    case date.getTime() === dateNowFormat.getTime() - timeDate:
                        return oResourceBundle.getText("yesterday");
                    default: 
                        return "";
                }
            }
        };

        return {
            dateFormat: dateFormat
        }
    });