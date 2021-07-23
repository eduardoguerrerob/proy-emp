// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.ui.core.routing.History} History
     * @param {typeof sap.m.MessageBox} MessageBox
     */
    function (Controller, History, MessageBox) {

        // private area - bind element to model
        function _onObjectMatched(oEvent) {

            this.onClearSignature();

            this.getView().bindElement({
                path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
                model: "odataNorthwind",
                events: {
                    dataReceived: function(oData) {
                        _readSignature.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);
                    }.bind(this)
                }
            });

            // read signature using odata service
            const objContext = this.getView().getModel("odataNorthwind").getContext("/Orders(" +
                oEvent.getParameter('arguments').OrderID + ")").getObject();
            if (objContext) {
                _readSignature.bind(this)(objContext.OrderID, objContext.EmployeeID);
            }
        };

        function _readSignature(orderId, employeeId) {

            const argRead = "/SignatureSet(OrderId='" + orderId.toString()
                + "',SapId='" + this.getOwnerComponent().SapId
                + "',EmployeeId='" + employeeId.toString() + "')";

            this.getView().getModel("incidenceModel").read(argRead, {
                success: function (data) {
                    const signature = this.getView().byId("signature");
                    if (data.MediaContent !== "") {
                        signature.setSignature("data:image/png;base64," + data.MediaContent);
                    }
                }.bind(this),
                error: function () {

                }
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
                                contentMiddle: new sap.m.ObjectStatus({
                                    text: "{i18n>availableStock}" + "(" + unitsInStock + ")",
                                    state: "Error"
                                }),
                                contentRight: new sap.m.Label({ text: "{parts: [{path: 'odataNorthwind>UnitPrice'},{path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}" })
                            })
                        ]
                    });
                    return customListItem;
                }

            },

            onSaveSignature: function (oEvent) {
                // obtain instance of signature
                const signature = this.getView().byId("signature");
                const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                let signaturePng;

                if (!signature.isFill()) {
                    MessageBox.error(oResourceBundle.getText("fillSignature"))
                }
                else {
                    signaturePng = signature.getSignature().replace("data:image/png;base64,", "");
                    // call odata service
                    let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
                    const body = {
                        OrderId: objectOrder.OrderID.toString(),
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: objectOrder.EmployeeID.toString(),
                        MimeType: "image/png",
                        MediaContent: signaturePng
                    };
                    this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
                        success: function () {
                            MessageBox.information(oResourceBundle.getText("signatureSave"));
                        },
                        error: function () {
                            MessageBox.error(oResourceBundle.getText("signatureNotSave"));
                        }
                    });
                }
            }

        })
    });
