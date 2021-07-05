// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel 
     */
    function (Controller, JSONModel) {
        return Controller.extend("egb.employeeui5.controller.Main", {
            onInit: function () {
                var oView = this.getView();
                //var i18nBundle = oView.getModel("i18n").getResourceBundle();

                var oJSONModelEmp = new JSONModel();
                oJSONModelEmp.loadData("./localService/mockdata/Employees.json", false);
                oView.setModel(oJSONModelEmp, "jsonEmployees");

                var oJSONModelCountries = new JSONModel();
                oJSONModelCountries.loadData("./localService/mockdata/Countries.json", false);
                oView.setModel(oJSONModelCountries, "jsonCountries");

                var oJSONModelLayouts = new JSONModel();
                oJSONModelLayouts.loadData("./localService/mockdata/Layout.json", false);
                oView.setModel(oJSONModelLayouts, "jsonLayouts");

                // config model
                var oJSONModelConfig = new JSONModel({
                    visibleID: true,
                    visibleName: true,
                    visibleCountry: true,
                    visibleCity: false,
                    visibleBtnShowCity: true,
                    visibleBtnHideCity: false
                });

                oView.setModel(oJSONModelConfig, "jsonConfig");

                //get event bus instance
                this._bus = sap.ui.getCore().getEventBus();
                //register event
                this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);
            },

            showEmployeeDetails: function(category, eventName, path) {
                var detailView = this.getView().byId("detailsEmployeeView");
                // bind the path of selected employee to view
                detailView.bindElement("jsonEmployees>" + path);
                //set property with layout 2 columns
                this.getView().getModel("jsonLayouts").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

                // instance of incidence model
                var incidenceModel = new sap.ui.model.json.JSONModel([]);
                // set model to view
                detailView.setModel(incidenceModel, "incidenceModel");
                // clean content of panel element
                detailView.byId("tableIncidence").removeAllContent();

            }

        })
    });