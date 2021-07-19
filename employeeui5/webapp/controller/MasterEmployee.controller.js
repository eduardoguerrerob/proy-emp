// @ts-nocheck

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Controller, JSONModel, Filter, FilterOperator) {
        "use strict";

        var Main = Controller.extend("egb.employeeui5.controller.MasterEmployee", {});

        function onInit() {

            //create attribute - instance of event bus
            this._bus = sap.ui.getCore().getEventBus();

        };

        function onFilter() {
            var oJSONCountries = this.getView().getModel("jsonCountries").getData();
            var aFilters = [];
            if (oJSONCountries.EmployeeId !== "" && oJSONCountries.EmployeeId !== undefined) {
                aFilters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
            }
            if (oJSONCountries.CountryKey !== "" && oJSONCountries.CountryKey !== undefined) {
                aFilters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
            }

            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters);
        };

        function onClearFilter() {
            var oModelCountries = this.getView().getModel("jsonCountries");
            oModelCountries.setProperty("/EmployeeId", "");
            oModelCountries.setProperty("/CountryKey", "");
        };

        function showPostalCode(oEvent) {
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("jsonEmployees");
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show(objectContext.PostalCode);
        };

        function onShowCity() {
            const oJSONModelConfig = this.getView().getModel("jsonConfig");
            oJSONModelConfig.setProperty("/visibleCity", true);
            oJSONModelConfig.setProperty("/visibleBtnShowCity", false);
            oJSONModelConfig.setProperty("/visibleBtnHideCity", true);
        };

        function onHideCity() {
            const oJSONModelConfig = this.getView().getModel("jsonConfig");
            oJSONModelConfig.setProperty("/visibleCity", false);
            oJSONModelConfig.setProperty("/visibleBtnShowCity", true);
            oJSONModelConfig.setProperty("/visibleBtnHideCity", false);
        };

        function showOrders(oEvent) {
            // get selected controller
            var iconPressed = oEvent.getSource();
            // context from model
            var oContext = iconPressed.getBindingContext("odataNorthwind");
            // instance of fragment
            if (!this._oDialogOrders) {
                this._oDialogOrders = sap.ui.xmlfragment("egb.employeeui5.fragment.DialogOrders", this);
                this.getView().addDependent(this._oDialogOrders);  //NO ENTIENDO ESTA FUNCION
            }
            // dialog binding to context for having access to data of seleted item
            this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath());   //NO ENTIENDO ESTA FUNCION
            this._oDialogOrders.open();
        };

        function onCloseOrders() {
            this._oDialogOrders.close();
        };

        function showOrdersOld(oEvent) {
            const $ordersTable = this.getView().byId("ordersTable");
            $ordersTable.destroyItems();

            const itemPressed = oEvent.getSource();
            const oContext = itemPressed.getBindingContext("jsonEmployees");
            const objectContext = oContext.getObject();
            const orders = objectContext.Orders;

            let orderItems = [];
            for (var i in orders) {
                orderItems.push(new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Label({ text: orders[i].OrderID }),
                        new sap.m.Label({ text: orders[i].Freight }),
                        new sap.m.Label({ text: orders[i].ShipAddress })
                    ]
                }));
            }

            let newTable = new sap.m.Table({
                width: "auto",
                columns: [
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>orderID}" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>freight}" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>shipAddress}" }) }),
                ],
                items: orderItems
            }).addStyleClass("sapUiSmallMargin");

            $ordersTable.addItem(newTable);

            ///////////////////////////////////////

            var newTableJSON = new sap.m.Table();
            newTableJSON.width = "auto";
            newTableJSON.addStyleClass("sapUiSmallMargin");

            var columnOrderID = new sap.m.Column();
            var labelOrderID = new sap.m.Label();
            labelOrderID.bindProperty("text", "i18n>orderID");
            columnOrderID.setHeader(labelOrderID);
            newTableJSON.addColumn(columnOrderID);

            var columnFreight = new sap.m.Column();
            var labelFreight = new sap.m.Label();
            labelFreight.bindProperty("text", "i18n>freight");
            columnFreight.setHeader(labelFreight);
            newTableJSON.addColumn(columnFreight);

            var columnShipAddress = new sap.m.Column();
            var labelShipAddress = new sap.m.Label();
            labelShipAddress.bindProperty("text", "i18n>shipAddress");
            columnShipAddress.setHeader(labelShipAddress);
            newTableJSON.addColumn(columnShipAddress);

            var columnListItem = new sap.m.ColumnListItem();

            var cellOrderID = new sap.m.Label();
            cellOrderID.bindProperty("text", "jsonEmployees>OrderID");
            columnListItem.addCell(cellOrderID);

            var cellFreight = new sap.m.Label();
            cellFreight.bindProperty("text", "jsonEmployees>Freight");
            columnListItem.addCell(cellFreight);

            var cellShipAddress = new sap.m.Label();
            cellShipAddress.bindProperty("text", "jsonEmployees>ShipAddress");
            columnListItem.addCell(cellShipAddress);

            var oBindingInfo = {
                model: "jsonEmployees",
                path: "Orders",
                template: columnListItem
            };

            newTableJSON.bindAggregation("items", oBindingInfo);
            newTableJSON.bindElement("jsonEmployees>" + oContext.getPath());

            $ordersTable.addItem(newTableJSON);

        };

        function showEmployee(oEvent) {
            //path of selected employee to send through the bus
            var path = oEvent.getSource().getBindingContext("odataNorthwind").getPath();
            // publish event by bus, it needs category, event name and path
            this._bus.publish("flexible", "showEmployee", path);

        };

        function toOrderDetails(oEvent) {
            var orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteOrderDetails", {
                OrderID : orderID
            });
        };


        // Main.prototype.onValidate = function () {
        //     var inputEmployee = this.getView().byId("inputEmployee");
        //     var valueEmployee = inputEmployee.getValue();

        //     if (valueEmployee.length === 6) {
        //         //inputEmployee.setDescription("OK");
        //         this.getView().byId("labelCountry").setVisible(true);
        //         this.getView().byId("slCountry").setVisible(true);
        //     }
        //     else {
        //         //inputEmployee.setDescription("Not OK");
        //         this.getView().byId("labelCountry").setVisible(false);
        //         this.getView().byId("slCountry").setVisible(false);
        //     };
        // };


        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.showPostalCode = showPostalCode;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.showOrders = showOrders;
        Main.prototype.onCloseOrders = onCloseOrders;
        Main.prototype.showEmployee = showEmployee;
        Main.prototype.toOrderDetails = toOrderDetails;

        return Main;
    });

