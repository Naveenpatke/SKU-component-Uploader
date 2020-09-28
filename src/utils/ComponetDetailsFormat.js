const isEmpty = variable => (
    (!variable || variable === '')
);

const isEmptyNumber = variable => (
    (variable === undefined || variable === null)
);

const isEmptyArray = arrayVar => (
    (!arrayVar || arrayVar.length === 0)
);

/* 
* componentValidator - the handler is used to validate data obtained from the excelFile
* @{param} - {Object} - componentData - It contains data of new component
* return : true (if either or the below mandatory field's are empty)
* */
const componentValidator = (componentData) => {
    if (isEmpty(componentData.Name)) return true;
    if (isEmpty(componentData.Description)) return true;
    if (isEmpty(componentData.isActive)) return true;
    if (isEmptyArray(componentData.QuoteVisible__c.split(";"))) return true;
    if (isEmpty(componentData.Component_Type__c)) return true;
    if (isEmpty(componentData.ProductCode)) return true;
    if (isEmptyNumber(componentData["Standard Price Book"])) return true;
    if (isEmptyNumber(componentData["Bemuda Price Book"])) return true;
    if (isEmptyNumber(componentData["NFR Price Book"])) return true;
    if (isEmpty(componentData.Product_Category__c)) return true;
    if (isEmpty(componentData.Family)) return true;
}

/* 
* excelDataValidator - the handler is used to validate the given set of components by iterating over it and passing 
*                        the components values to componentValidatore function
* @{param} - {Object} - excelData - It contains all the component data in the given excel file
* return : array (this array consist of row number of components whose mandatory field's are empty)
* */
const excelDataValidator = (excelData) => {
    var indexOfComponentWhichHasError = new Set();
    Object.keys(excelData).map((excelComponentData, index) => (
        componentValidator(excelData[excelComponentData]) ? indexOfComponentWhichHasError.add(index + 1) : ''
    ));
    return Array.from(indexOfComponentWhichHasError);
}


export const componentDetailsFormat = (excelData, username) => {
    let componentsToAdd = [];
        let indexNumberOfDataErrorComponent = excelDataValidator(excelData.ProductData);
        if (indexNumberOfDataErrorComponent.length === 0) {
            Object.keys(excelData.ProductData).map((excelComponentData, index) => {
                let component = excelData.ProductData[excelComponentData];
                if (component.ProductCode.slice(-3) !== '-CM' && component.ProductCode.slice(-6) !== '-SW-CM' && component.ProductCode.slice(-3) !== '-SW') {
                    componentsToAdd.push({
                        component: {
                            name: component.Name,
                            description: component.Description,
                            isActive: component.isActive,
                            quoteVisible: component.QuoteVisible__c.split(";"),
                            type: component.Component_Type__c,
                            productCode: component.ProductCode,
                            user: username
                        },
                        price: {
                            Bermuda: component["Bemuda Price Book"],
                            CM: excelData.ProductData[component.ProductCode + "-CM"]["CM Price Book"],
                            Hardware: component["Hardware_Cost__c"],
                            NFR: component["NFR Price Book"],
                            Standard: component["Standard Price Book"]
                        },
                        componentAttributes: {
                            capacity: component.Capacity_for_ABL__c,
                            capacityUnit: component.CAPACITYUNIT__C,
                            family: component.Family,
                            productCategory: component.Product_Category__c,
                            spares: component.Platform_Specific_Spares_Upgrades__c
                        }
                    })
                }
            });
            console.log("Uploaded Excel Data", componentsToAdd);
            return componentsToAdd;
        }else{
            console.log("Few mandatory data elements are missing");
        }
}