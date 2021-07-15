// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "egb/employeeui5/model/formatter"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     */
    function (Controller, formatter) {

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onCreateIncidence() {
            var tableIncidence = this.getView().byId("tableIncidence");
            // crear fragment for new incidence data
            var newIncidence = sap.ui.xmlfragment("egb.employeeui5.fragment.NewIncidence", this);
            // get instance of incidence model
            var incidenceModel = this.getView().getModel("incidenceModel");
            // get data from odata model
            var odata = incidenceModel.getData();
            // set index to length of array of incidences into model, add new record 
            var index = odata.length;
            odata.push({index: index+1});
            // refresh model data 
            incidenceModel.refresh();
            // bind model element of index position to fragment
            newIncidence.bindElement("incidenceModel>/" + index);
            // add fragment content to table of incidences
            tableIncidence.addContent(newIncidence);
        };

        function onDeleteIncidence(oEvent) {

            var contextObj = oEvent.getSource().getBindingContext("incidenceModel").getObject();
            // publish event
            this._bus.publish("incidenceChannel", "onDeleteIncidenceEvent", {
                IncidenceId: contextObj.IncidenceId,
                SapId: contextObj.SapId,
                EmployeeId: contextObj.EmployeeId
            });



            /*  OLD version without odata
            // identify item of table incidence 
            var tableIncidence = this.getView().byId("tableIncidence");
            var rowIncidence = oEvent.getSource().getParent().getParent();
            // incidence model
            var incidenceModel = this.getView().getModel("incidenceModel");
            // get data
            var odata = incidenceModel.getData();
            // data of incidence row
            var contextObj = rowIncidence.getBindingContext("incidenceModel");

            // delete row from model
            odata.splice(contextObj.index-1, 1);

            // update index into rows
            for(var i in odata){
                odata[i].index = parseInt(i) + 1;
            };
            incidenceModel.refresh();

            tableIncidence.removeContent(rowIncidence);

            // bind each model row with row in incidence table
            for(var j in tableIncidence.getContent()){
                tableIncidence.getContent()[j].bindElement("incidenceModel>/" + j);
            };
            */
        };

        function onSaveIncidence(oEvent) {
            // obtein incidence
             var Incidence = oEvent.getSource().getParent().getParent();
             var incidenceRow = Incidence.getBindingContext("incidenceModel");
             // publish event
             var dataEvent = { incidenceRow : incidenceRow.sPath.replace("/","")};
             this._bus.publish("incidenceChannel", "onSaveIncidenceEvent", dataEvent);
        };

        function onChangeCreationDate(oEvent) {
            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();
            contextObj.CreationDateX = true;
        };

        function onChangeReason(oEvent) {
            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();
            contextObj.ReasonX = true;
        };

        function onChangeType(oEvent) {
            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();
            contextObj.TypeX = true;
        };


        var MainEmployeeDetails = Controller.extend("egb.employeeui5.controller.EmployeeDetails", {});

        MainEmployeeDetails.prototype.onInit = onInit;
        MainEmployeeDetails.prototype.onCreateIncidence = onCreateIncidence;
        MainEmployeeDetails.prototype.Formatter = formatter;
        MainEmployeeDetails.prototype.onDeleteIncidence = onDeleteIncidence;
        MainEmployeeDetails.prototype.onSaveIncidence = onSaveIncidence;
        MainEmployeeDetails.prototype.onChangeCreationDate = onChangeCreationDate;
        MainEmployeeDetails.prototype.onChangeReason = onChangeReason;
        MainEmployeeDetails.prototype.onChangeType = onChangeType;

        return MainEmployeeDetails;
    });