// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.ui.core.routing.History} History
     */
    function (Controller, History) {

        // private area - bind element to model
        function _onObjectMatched(oEvent) {
            this.getView().bindElement({
                path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
                model: "odataNorthwind"
            });
        };

        return Controller.extend("egb.employeeui5.controller.OrderDetails", {

            onInit: function () {
                // bind element to model when pattern route matchs
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
            },

            onBack: function (oEvent) {
                const oHistory = History.getInstance();
                const sPrivious = oHistory.getPreviousHash();
                if (sPrivious !== undefined) {
                    window.history.go(-1);
                }
                else {
                    const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteMain", true);
                }
            },

            onClearSignature: function (oEvent) {
                var signature = this.byId("signature");
                signature.clear();
            },

            factoryOrderDetails: function (listId, oContext) {

                var contextObject = oContext.getObject();
                contextObject.Currency = 'EUR';
                const propertyUnitInStock = "/Products(" + contextObject.ProductID + ")/UnitsInStock";

                var unitsInStock = oContext.getModel().getProperty(propertyUnitInStock);


                if (contextObject.Quantity <= unitsInStock) {
                    let objectListItem = new sap.m.ObjectListItem({
                        title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                        number: "{parts: [{path: 'odataNorthwind>UnitPrice'},{path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency',formatOptions: {showMeasure: false}}",
                        numberUnit: "{odataNorthwind>Currency}"
                    });
                    return objectListItem;
                }
                else {
                    let labelProd = "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})";
                    let customListItem = new sap.m.CustomListItem({
                        content: [
                            new sap.m.Bar({
                                contentLeft: new sap.m.Label({ text: labelProd }),
                                contentMiddle: new sap.m.ObjectStatus({text: "{i18n>availableStock}" + "(" + unitsInStock + ")", 
                                              state: "Error" }),
                                contentRight: new sap.m.Label({text: "{parts: [{path: 'odataNorthwind>UnitPrice'},{path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}"})
                            })
                        ]
                    });
                    return customListItem;
                }
                
            }

        })
    });
