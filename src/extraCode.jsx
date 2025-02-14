// const profitablityData = {
//     formInputT: {
//         normalExpense: [
//             { key: "ManagerTotal", value: 50000 },
//             { key: "SkilledLabourTotal", value: 30000 },
//             { key: "LabourTotal", value: 20000 },
//             { key: "SecurityGuardTotal", value: 10000 },
//             { key: "SupervisorTotal", value: 5000 },
//             { key: "ChefTotal", value: 12000 },
//             { key: "AdminStaffTotal", value: 6000 },
//         ],
//         DExpense: [
//             { key: "DRawMaterialExpenses", value: 20000, isDirect: true },
//             { key: "DElectricityExpenses", value: 5000, isDirect: false },
//             { key: "DMarketingExpenses", value: 2000, isDirect: true },
//             { key: "DTransportationExpenses", value: 0, isDirect: true },
//             { key: "DInsuranceExpenses", value: 1010, isDirect: false },
//             { key: "DTelephoneAndInternetExpenses", value: 0, isDirect: false },
//             { key: "DAdministrativeExpenses", value: 80000, isDirect: true },
//             { key: "DRepairsAndMaintanenceExpense", value: 50000, isDirect: true },
//             { key: "DOtherMiscellaneousExpenses", value: 200000, isDirect: true },
//             { key: "DRentExpenses", value: 300000, isDirect: true },
//             { key: "DStationeryExpenses", value: 20000, isDirect: true }
//         ]
//     }
//     ,
//     revenue: {
//         value: 8000000
//     },
//     depreciation: {
//         value: 170000
//     },
//     interestOnTL: {
//         value: 220000
//     },
//     interestOnWC: {
//         value: 55000
//     },
//     startingMonth: {
//         value: 15
//     },
//     rateOfInterest: {
//         value: 10
//     },
//     incomeTax: {
//         value: 10
//     },
//     closingStock: {
//         value: 2000
//     },
//     rateOfExpense: {
//         value: 10
//     }

// }

//----------------------------------------------------------------------------------------

export const generateProfitablityTable2 = (reportSettings, allExpenses, profitablityData, revenueInput, moreDetails) => {
    //profitablityData ==> expenses
    let years = reportSettings.ProjectionYears;

    //rate => projectReportSettings.rateOfExpense;
    let rate = reportSettings.rateOfExpense;

    //direct -> normal + direct
    //indirect

    //types of expenses.................................................................
    let expenses = allExpenses.normalExpense;
    let directExpenses = allExpenses.directExpense.filter((data) => {
        return data.type === "direct"
    });
    let inDirectExpenses = allExpenses.directExpense.filter((data) => {
        return data.type === "inDirect"
    });


    //yearwise calculation of expenses..................................................
    let expensesYearwiseData = [];
    let directExpensesYearwiseData = [];
    let inDirectExpensesYearwiseData = [];

    expenses.map((data) => {
        let value = data.value;
        let values = [Math.round(value)];

        for (let i = 2; i <= years; i++) {
            value = value + ((value * rate) / 100);
            values.push(Math.round(value))
        }

        expensesYearwiseData.push({ ...data, values })
    })

    directExpenses.map((data) => {
        let value = data.value;
        let values = [Math.round(value)];

        for (let i = 2; i <= years; i++) {
            value = value + ((value * rate) / 100);
            values.push(Math.round(value))
        }

        directExpensesYearwiseData.push({ ...data, values })
    })

    inDirectExpenses.map((data) => {
        let value = data.value;
        let values = [Math.round(value)];

        for (let i = 2; i <= years; i++) {
            value = value + ((value * rate) / 100);
            values.push(Math.round(value))
        }

        inDirectExpensesYearwiseData.push({ ...data, values })
    })

    console.log("expensesYearwiseData", expensesYearwiseData);
    console.log("directExpensesYearwiseData", directExpensesYearwiseData);
    console.log("inDirectExpensesYearwiseData", inDirectExpensesYearwiseData);

    //expenses total calculation......................................................
    let expensesTotal = [];
    let directExpensesTotal = [];
    let inDirentExpensesTotal = [];

    expensesYearwiseData.forEach((data, i) => {
        if (i === 0) {
            expensesTotal.push(...data.values)
        } else {
            expensesTotal = expensesTotal.map((ex, a) => {
                return Math.round(ex += data.values[a])
            })
        }
    })
    directExpensesYearwiseData.forEach((data, i) => {
        if (i === 0) {
            directExpensesTotal.push(...data.values)
        } else {
            directExpensesTotal = directExpensesTotal.map((ex, a) => {
                return Math.round(ex += data.values[a])
            })
        }
    })
    inDirectExpensesYearwiseData.forEach((data, i) => {
        if (i === 0) {
            inDirentExpensesTotal.push(...data.values)
        } else {
            inDirentExpensesTotal = inDirentExpensesTotal.map((ex, a) => {
                return Math.round(ex += data.values[a])
            })
        }
    })

    console.log("expensesTotal", expensesTotal);
    console.log("directExpensesTotal", directExpensesTotal);
    console.log("inDirentExpensesTotal", inDirentExpensesTotal);

    //total revenue from revenue input
    //revenue yearwise.............................................................
    let revenue = profitablityData.revenue.value
    let revenueYearwise = [Math.round(revenue)];
    for (let i = 2; i <= years; i++) {
        revenue = revenue + ((revenue * rate) / 100);
        revenueYearwise.push(Math.round(revenue))
    }
    console.log("revenueYearwise", revenueYearwise);

    //closing stock from moreDetails
    //closing stock yearwise........................................................
    let closingStock = profitablityData.closingStock.value
    let closingStockYearwise = [Math.round(closingStock)]
    for (let i = 2; i <= years; i++) {
        closingStock = closingStock + ((closingStock * rate) / 100);
        closingStockYearwise.push(Math.round(closingStock))
    }
    console.log("closingStockYearwise", closingStockYearwise);

    //revenue + closingstock........................................................
    let revenue_closingstock_total = [];
    for (let i = 0; i < years; i++) {
        revenue_closingstock_total.push(Math.round(revenueYearwise[i] + closingStockYearwise[i]));
    }
    console.log("revenue_closingstock_total", revenue_closingstock_total);

    //opening stock yearwise........................................................
    let openingStock = 0;
    let openingStockYearwise = [Math.round(openingStock)]
    for (let i = 2; i <= years; i++) {
        openingStock = closingStockYearwise[i - 2];
        openingStockYearwise.push(Math.round(openingStock))
    }
    console.log("openingStockYearwise", openingStockYearwise);

    //adding opening stock to expenses total
    for (let i = 0; i < years; i++) {
        expensesTotal[i] = Math.round(expensesTotal[i] + openingStockYearwise[i]);
    }
    console.log("expensesTotal + opening stock", expensesTotal);

    //grossProfit...................................................................
    let grossProfitYearwise = [];
    for (let i = 0; i < years; i++) {
        grossProfitYearwise.push(Math.round(revenue_closingstock_total[i] - expensesTotal[i]));
    }
    console.log("grossProfitYearwise", grossProfitYearwise);

    //depriciation total from depriciation table calucation
    //depriciation yearwise..........................................................
    let depreciation = profitablityData.depreciation.value;
    let depriciationYearwise = [Math.round(depreciation)];
    for (let i = 2; i <= years; i++) {
        depreciation = depreciation + ((depreciation * rate) / 100);
        depriciationYearwise.push(Math.round(depreciation))
    }
    console.log("depriciationYearwise", depriciationYearwise);

    //Interest on TL yearwise.........................................................
    //total intrest amount of each year from repayment table
    let interestOnTL = profitablityData.interestOnTL.value;
    let interestOnTLYearwise = [Math.round(interestOnTL)];
    for (let i = 2; i <= years; i++) {
        interestOnTL = interestOnTL + ((interestOnTL * rate) / 100);
        interestOnTLYearwise.push(Math.round(interestOnTL))
    }
    console.log("interestOnTLYearwise", interestOnTLYearwise);

    //Interest on WC yearwise.........................................................
    //means of finance se working capital se term loan * interestOnWC
    //same for every year
    let interestOnWC = profitablityData.interestOnWC.value;
    let interestOnWCYearwise = [Math.round(interestOnWC)];
    for (let i = 2; i <= years; i++) {
        interestOnWC = interestOnWC + ((interestOnWC * rate) / 100);
        interestOnWCYearwise.push(Math.round(interestOnWC))
    }
    console.log("interestOnWCYearwise", interestOnWCYearwise);

    //directExpenses + inDirectExpenses + Depreciation + Interest on TL + Interest on WC
    let miscTotalYearwise = [];
    for (let i = 0; i < years; i++) {
        miscTotalYearwise.push(Math.round(
            directExpensesTotal[i] + inDirentExpensesTotal[i]
            + depriciationYearwise[i] + interestOnTLYearwise[i] + interestOnWCYearwise[i])
        );
    }
    console.log("miscTotalYearwise", miscTotalYearwise);

    //profit before tax yearwise......................................................
    const profitBeforeTaxYearwise = [];
    for (let i = 0; i < years; i++) {
        profitBeforeTaxYearwise.push(Math.round(grossProfitYearwise[i] - miscTotalYearwise[i]));
    }
    console.log("profitBeforeTaxYearwise", profitBeforeTaxYearwise);

    //income tax yearwise.............................................................
    let incomeTaxYearwise = [];
    let incomeTaxRate = profitablityData.incomeTax.value;
    for (let i = 0; i < years; i++) {
        let tax = ((profitBeforeTaxYearwise[i] * incomeTaxRate) / 100);
        incomeTaxYearwise.push(Math.round(tax));
    }
    console.log("incomeTaxYearwise", incomeTaxYearwise);

    //profit after tax yearwise........................................................
    let profitAfterTaxYearwise = [];
    for (let i = 0; i < years; i++) {
        profitAfterTaxYearwise.push(Math.round(profitBeforeTaxYearwise[i] - incomeTaxYearwise[i]));
    }
    console.log("profitAfterTaxYearwise", profitAfterTaxYearwise);

    return {
        revenueYearwise,
        closingStockYearwise,
        revenue_closingstock_total,
        openingStockYearwise, expensesYearwiseData, expensesTotal,
        grossProfitYearwise,
        directExpensesYearwiseData, directExpensesTotal,
        inDirectExpensesYearwiseData, inDirentExpensesTotal,
        depriciationYearwise, interestOnTLYearwise, interestOnWCYearwise,
        miscTotalYearwise,
        profitBeforeTaxYearwise,
        incomeTaxYearwise,
        profitAfterTaxYearwise
    }
}