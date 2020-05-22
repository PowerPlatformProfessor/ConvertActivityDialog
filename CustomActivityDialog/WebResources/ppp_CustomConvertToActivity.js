var convertToActivity = (function(){
    var my = {};

    my.events = {
        okClick: function(executionContext){
            var formContext = executionContext.getContext();
            my.events.convertToActivityAndOpenForm(formContext);
        },
        cancelClick: function(executionContext){
           Xrm.Page.ui.close(); 
        },
        convertToActivityAndOpenForm: function(formContext){
            var param_entityId = Xrm.Page.data.attributes.get("param_entityId")
            && Xrm.Page.data.attributes.get("param_entityId").getValue() ? 
            Xrm.Page.data.attributes.get("param_entityId").getValue(): ""; 

            var param_entityTypeCode =  Xrm.Page.data.attributes.get("param_entityTypeCode") 
            && Xrm.Page.data.attributes.get("param_entityTypeCode").getValue() ? 
            Xrm.Page.data.attributes.get("param_entityTypeCode").getValue(): ""; 

            var param_subject = Xrm.Page.data.attributes.get("param_subject") 
            && Xrm.Page.data.attributes.get("param_subject").getValue() ? 
            Xrm.Page.data.attributes.get("param_subject").getValue(): "";

            var customerLookup = Xrm.Page.data.attributes.get("customerLookup")
            && Xrm.Page.data.attributes.get("customerLookup").getValue() && Xrm.Page.data.attributes.get("customerLookup").getValue().length > 0 ?
            Xrm.Page.data.attributes.get("customerLookup").getValue()[0].id.replace('{','').replace('}',''): "";

            if(!customerLookup){
                Xrm.Navigation.openAlertDialog({title:"No customer selected!", text:"Pick a customer for the opportunity."});
                return;
            }

            var param_currencyId = Xrm.Page.data.attributes.get("param_currencyId")
            && Xrm.Page.data.attributes.get("param_currencyId").getValue() ?
            Xrm.Page.data.attributes.get("param_currencyId").getValue().replace('{','').replace('}',''): "";

            var param_ownerType = Xrm.Page.data.attributes.get("param_ownerType")
            && Xrm.Page.data.attributes.get("param_ownerType").getValue() ?
            Xrm.Page.data.attributes.get("param_ownerType").getValue().replace('{','').replace('}',''): "";

            var param_ownerId = Xrm.Page.data.attributes.get("param_ownerId")
            && Xrm.Page.data.attributes.get("param_ownerId").getValue() ? 
            Xrm.Page.data.attributes.get("param_ownerId").getValue().replace('{','').replace('}',''): "";

            Xrm.Utility.showProgressIndicator("Loading..");

            var reqObj = {
                "ActivityId":param_entityId,
                "ActivityEntityName":param_entityTypeCode,
                "TargetEntity":{
                    "@odata.type":"#Microsoft.Dynamics.CRM.opportunity",
                    "name": param_subject,
                    "customerid_account@odata.bind":"/accounts("+ customerLookup +")",
                    "transactioncurrencyid@odata.bind":"/transactioncurrencies("+ param_currencyId + ")", 
                    "ownerid@odata.bind":"/"+ param_ownerType +"s("+ param_ownerId + ")" 
                    },
                    "TargetEntityName":"opportunity",
                    "CreateCampaignResponse":false
            }

            var req = new XMLHttpRequest();
            req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v9.0/ConvertActivity", true);
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.onreadystatechange = function() {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 200) {
                        Xrm.Utility.closeProgressIndicator()
                        var resp = JSON.parse(this.response);
                        Xrm.Navigation.openForm({entityId:resp.RecordId, entityName:"opportunity"})
                    } else {
                        Xrm.Utility.closeProgressIndicator()
                    }
                }
            };
            req.send(JSON.stringify(reqObj));
        }
    }

    return my;
})();