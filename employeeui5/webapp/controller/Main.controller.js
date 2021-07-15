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

            onBeforeRendering: function () {
                // instance of employee view
                this._detailEmployeeView = this.getView().byId("detailsEmployeeView");

            },

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
                // subscribe to event save incidence
                this._bus.subscribe("incidenceChannel", "onSaveIncidenceEvent", this.onSaveIncidenceHandler, this);
                // subscribe to event delete incidence
                this._bus.subscribe("incidenceChannel", "onDeleteIncidenceEvent", function (channelId, eventId, dataEvent) {
                    var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                    var filter = "IncidenceId='" + dataEvent.IncidenceId + "'" +
                        ",SapId='" + dataEvent.SapId + "'" +
                        ",EmployeeId='" + dataEvent.EmployeeId + "'";

                    this.getView().getModel("incidenceModel").remove("/IncidentsSet(" + filter + ")", {
                        success: function () {
                            this.onReadODataIncidence.bind(this)(dataEvent.EmployeeId);
                            sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteOK"));
                        }.bind(this),
                        error: function () {
                            sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteKO"));
                        }.bind(this)
                    });
                }, this);
            },

            showEmployeeDetails: function (category, eventName, path) {
                var detailView = this.getView().byId("detailsEmployeeView");
                // bind the path of selected employee to view
                detailView.bindElement("odataNorthwind>" + path);
                //set property with layout 2 columns
                this.getView().getModel("jsonLayouts").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

                // instance of incidence model
                var incidenceModel = new sap.ui.model.json.JSONModel([]);
                // set model to view
                detailView.setModel(incidenceModel, "incidenceModel");
                // clean content of panel element
                detailView.byId("tableIncidence").removeAllContent();

                // read incidences
                var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
                this.onReadODataIncidence(employeeId);
            },

            onSaveIncidenceHandler: function (channelId, eventId, dataEvent) {
                // i18n
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                // employee 
                var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
                // incidence
                var incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();
                // incidence index
                var idx = dataEvent.incidenceRow;
                if (typeof incidenceModel[idx].IncidenceId == 'undefined') {
                    // body
                    var body = {
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: employeeId.toString(),
                        CreationDate: incidenceModel[idx].CreationDate,
                        Type: incidenceModel[idx].Type,
                        Reason: incidenceModel[idx].Reason
                    };
                    // request OData
                    this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
                        success: function () {
                            this.onReadODataIncidence.bind(this)(employeeId);
                            sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOK"));
                        }.bind(this),
                        error: function () {
                            sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"));
                        }
                    });
                }
                else if (incidenceModel[idx].CreationDateX == true ||
                    incidenceModel[idx].TypeX == true ||
                    incidenceModel[idx].ReasonX == true) {
                    // request odata - update
                    var body = {
                        CreationDate: incidenceModel[idx].CreationDate,
                        CreationDateX: incidenceModel[idx].CreationDateX,
                        Type: incidenceModel[idx].Type,
                        TypeX: incidenceModel[idx].TypeX,
                        Reason: incidenceModel[idx].Reason,
                        ReasonX: incidenceModel[idx].ReasonX
                    };
                    var filter = "IncidenceId='" + incidenceModel[idx].IncidenceId + "'" +
                        ",SapId='" + incidenceModel[idx].SapId + "'" +
                        ",EmployeeId='" + incidenceModel[idx].EmployeeId + "'";

                    this.getView().getModel("incidenceModel").update("/IncidentsSet(" + filter + ")", body, {
                        success: function () {
                            this.onReadODataIncidence.bind(this)(employeeId);
                            sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateOK"));
                        }.bind(this),
                        error: function () {
                            sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateKO"));
                        }.bind(this)
                    });
                }
                else {
                    sap.m.MessageToast.show(oResourceBundle.getText("odataNotChanges"));
                }
            },

            onReadODataIncidence: function (employeeID) {
                // request OData
                this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                    filters: [
                        new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                        new sap.ui.model.Filter("EmployeeId", "EQ", employeeID.toString())
                    ],
                    success: function (data) {
                        // add incidences from results to model 
                        var incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                        incidenceModel.setData(data.results);

                        var tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                        // clear table incidence for avoing multiple adds when user clic many times the same employee
                        tableIncidence.removeAllContent();
                        // crear fragment for new incidence data using Employee Details controller
                        for (var incidence in data.results) {
                            var newIncidence = sap.ui.xmlfragment("egb.employeeui5.fragment.NewIncidence",
                                this._detailEmployeeView.getController());
                            // add dependecies
                            this._detailEmployeeView.addDependent(newIncidence);
                            // bind element
                            newIncidence.bindElement("incidenceModel>/" + incidence);
                            // add content
                            tableIncidence.addContent(newIncidence);
                        }
                    }.bind(this),
                    error: function (e) {

                    }
                });
            }

        })
    });