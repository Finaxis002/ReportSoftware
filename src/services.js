//no. of years  = projectionMonth / 12
//take starting month in consideration

import { write } from "@popperjs/core";

const getMonth = (monthNumber) => {
    switch (+monthNumber) {
        case 1: return "Apr"; break;
        case 2: return "May"; break;
        case 3: return "Jun"; break;
        case 4: return "Jul"; break;
        case 5: return "Aug"; break;
        case 6: return "Sep"; break;
        case 7: return "Oct"; break;
        case 8: return "Nov"; break;
        case 9: return 'Dec'; break;
        case 10: return "Jan"; break;
        case 11: return "Feb"; break;
        default: return "Mar"; break;
    }
}

export const getTotalCostOfProject = (costOfProject) => {
    let total = 0;
    costOfProject.map((entry) => {
        total += entry.amount
    })
    return total
}

export const generateRepaymentTable = (reportSettings, meansOfFinance) => {

    console.log(meansOfFinance);
    console.log(reportSettings);

    let tableData = [];
    let tableTotalData = [];
    let MoratoriumPeriod = reportSettings.MoratoriumPeriod;
    let startingMonth = reportSettings.SelectStartingMonth;

    let repaymentTotal = 0;
    let interestTotal = 0;
    let totalTotal = 0;

    for (let i = 1; i <= reportSettings.RepaymentMonths; i++) {
        let sno = i;
        let month = getMonth(startingMonth);
        let principal = 0;
        let repayment = 0;
        let closingBalance = 0;
        let interestAmount = 0;
        let total = 0;

        if (MoratoriumPeriod > 0) {
            //Idhar term loan aana hai----------------------------------
            // meansOfFinance.termLoan.termLoan
            principal = Number(meansOfFinance.termLoan.termLoan);
            repayment = 0;
            closingBalance = Number(meansOfFinance.termLoan.termLoan);
            interestAmount = Math.round((principal * reportSettings.rateOfInterest) / (12 * 100));
            total = repayment + interestAmount;
            MoratoriumPeriod -= 1;
        } else {
            // console.log(tableData[i - 2]);
            principal = tableData[i - 2].closingBalance;
            repayment = Math.round(Number(meansOfFinance.termLoan.termLoan) / (reportSettings.RepaymentMonths - reportSettings.MoratoriumPeriod));
            closingBalance = principal - repayment;
            interestAmount = Math.round((principal * reportSettings.rateOfInterest) / (12 * 100));
            total = repayment + interestAmount;
        }

        repaymentTotal += repayment;
        interestTotal += interestAmount;
        totalTotal += total;

        // console.log(i, repayment);
        // console.log(i, repaymentTotal);

        if (startingMonth === 12) {
            console.log("hello");
            startingMonth = 0;
            tableTotalData.push({ repaymentTotal, interestTotal, totalTotal })
            repaymentTotal = 0;
            interestTotal = 0;
            totalTotal = 0;
        }
        startingMonth++;

        tableData.push({ sno, month, principal, repayment, closingBalance, interestAmount, total })

    }

    tableTotalData.push({ repaymentTotal, interestTotal, totalTotal })

    console.log(tableData);
    console.log(tableTotalData);
    const reportData = {
        tableData: tableData,
        tableTotalData: tableTotalData,
        startingMonth: reportSettings.SelectStartingMonth
    }
    console.log(reportData);
    // setRepaymentTable(tableData)
    // setReport({ ...report, repaymentTable: tableData })
    return reportData
}

//Depriciation Table
export const generateDepreciationTable = (reportSettings, costOfProject) => {
    const years = reportSettings.ProjectionYears;

    const GrossFixedAssets = [];
    const Depreciation = [];
    const CummulativeDepreciation = [];
    const NetFixedAssets = [];

    const totalGrossFixedAssets = Array.from({ length: years }).fill(0)
    const totalDepreciation = Array.from({ length: years }).fill(0)
    const totalCummulativeDepreciation = Array.from({ length: years }).fill(0)
    const totalNetFixedAssets = Array.from({ length: years }).fill(0)

    costOfProject.map((particular, index) => {
        let name = particular.name
        let id = particular.id
        let amount = Number(particular.amount)
        let rate = Number(particular.rate)
        let isCustom = particular.isCustom

        let tempGrossFixedAssets = [];
        let tempDepreciation = [];
        let tempCummulativeDepreciation = [];
        let tempNetFixedAssets = [];

        let MoratoriumPeriod = reportSettings.MoratoriumPeriod;
        let startingMonth = Number(reportSettings.SelectStartingMonth);

        for (let i = 1; i <= years; i++) {
            //GrossFixedAssets
            if (i === 1) {
                tempGrossFixedAssets.push(amount)
            } else {
                tempGrossFixedAssets.push(tempNetFixedAssets[i - 2]);
            }

            //Depreciation
            let dep = (tempGrossFixedAssets[i - 1] * rate) / 100;

            //Moratorium period changes on depriciation
            if (MoratoriumPeriod > 0) {
                let noOfMonthsLeftInCurrentYear = 13 - startingMonth;
                MoratoriumPeriod -= noOfMonthsLeftInCurrentYear;

                if (MoratoriumPeriod > 0) {
                    dep = 0;
                    startingMonth = 1;
                } else {
                    MoratoriumPeriod = 0 - MoratoriumPeriod;
                    dep = (dep * MoratoriumPeriod) / 12;
                    //To make the moratorioum period null because it is full filled
                    MoratoriumPeriod = 0;
                }
            }

            tempDepreciation.push(dep)

            //CummulativeDepreciation
            if (i === 1) {
                tempCummulativeDepreciation.push(tempDepreciation[i - 1])
            } else {
                tempCummulativeDepreciation.push((tempCummulativeDepreciation[i - 2] + tempDepreciation[i - 1]))
            }

            //NetFixedAssets
            tempNetFixedAssets.push((tempGrossFixedAssets[i - 1] - tempDepreciation[i - 1]))
        }

        GrossFixedAssets.push({
            name,
            id,
            yearWiseData: tempGrossFixedAssets
        });
        Depreciation.push({
            name,
            id,
            rate,
            yearWiseData: tempDepreciation
        });
        CummulativeDepreciation.push({
            name,
            id,
            yearWiseData: tempCummulativeDepreciation
        });
        NetFixedAssets.push({
            name,
            id,
            yearWiseData: tempNetFixedAssets
        });

        //Total
        for (let i = 1; i <= years; i++) {
            totalGrossFixedAssets[i - 1] += tempGrossFixedAssets[i - 1]
            totalDepreciation[i - 1] += tempDepreciation[i - 1]
            totalCummulativeDepreciation[i - 1] += tempCummulativeDepreciation[i - 1]
            totalNetFixedAssets[i - 1] += tempNetFixedAssets[i - 1]
        }

    })

    const dt = {
        grossFixedAsset: GrossFixedAssets,
        depreciation: Depreciation,
        cummulativeDepreciation: CummulativeDepreciation,
        netFixedAsset: NetFixedAssets,
        totalGrossFixedAssets,
        totalDepreciation,
        totalCummulativeDepreciation,
        totalNetFixedAssets
    }
    console.log(dt);

    return dt
}

export const generateProfitablityTable = (reportSettings, expenses, revenue, moreDetails, depreciationData, repaymentData, meansOfFinance) => {
    //projection years
    let years = reportSettings.ProjectionYears;

    //expense rate
    let rate = reportSettings.rateOfExpense;

    //direct expenses
    let directExpenses = []
    console.log(expenses);
    expenses.normalExpense.map((entry) => {
        directExpenses.push({
            name: entry.name,
            key: entry.key,
            amount: entry.amount,
            quantity: entry.quantity,
            value: entry.value,
            type: entry.type
        })
    })
    expenses.directExpense.map((entry) => {
        if (entry.type === "direct") {
            directExpenses.push({
                name: entry.name,
                key: entry.key,
                amount: 1,
                quantity: 1,
                value: entry.value,
                type: entry.type
            })
        }
    })

    //indirect expenses
    let inDirectExpenses = []
    expenses.directExpense.map((entry) => {
        if (entry.type === "inDirect") {
            inDirectExpenses.push({
                name: entry.name,
                key: entry.key,
                amount: 1,
                quantity: 1,
                value: entry.value,
                type: entry.type
            })
        }
    })

    //yearwise calculation of expenses..................................................
    let directExpensesYearwiseData = [];
    let inDirectExpensesYearwiseData = [];

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

    console.log(directExpensesYearwiseData);
    console.log(inDirectExpensesYearwiseData);

    //Monotorium period changes on expenses.............................
    for (let i = 0; i < directExpensesYearwiseData.length; i++) {
        let MoratoriumPeriod = reportSettings.MoratoriumPeriod;
        let startingMonth = Number(reportSettings.SelectStartingMonth);
        let currentYear = 1;
        let yearlyData = [...directExpensesYearwiseData[i].values];
        console.log(yearlyData);
        while (MoratoriumPeriod > 0) {
            let noOfMonthsLeftInCurrentYear = 13 - startingMonth;
            MoratoriumPeriod -= noOfMonthsLeftInCurrentYear;
            if (MoratoriumPeriod > 0) {
                yearlyData[currentYear - 1] = 0;
                currentYear += 1;
                startingMonth = 1;
            } else {
                MoratoriumPeriod = 0 - MoratoriumPeriod;
                yearlyData[currentYear - 1] = (yearlyData[currentYear - 1] * MoratoriumPeriod) / 12;
                break;
            }
        }
        console.log(yearlyData);
        console.log("--------------------------------");
        directExpensesYearwiseData[i].values = [...yearlyData]
    }

    for (let i = 0; i < inDirectExpensesYearwiseData.length; i++) {
        let MoratoriumPeriod = reportSettings.MoratoriumPeriod;
        let startingMonth = Number(reportSettings.SelectStartingMonth);
        let currentYear = 1;
        let yearlyData = [...inDirectExpensesYearwiseData[i].values];

        while (MoratoriumPeriod > 0) {
            let noOfMonthsLeftInCurrentYear = 13 - startingMonth;
            MoratoriumPeriod -= noOfMonthsLeftInCurrentYear;

            if (MoratoriumPeriod > 0) {
                yearlyData[currentYear - 1] = 0;
                currentYear += 1;
                startingMonth = 1;
            } else {
                MoratoriumPeriod = 0 - MoratoriumPeriod;
                yearlyData[currentYear - 1] = (yearlyData[currentYear - 1] * MoratoriumPeriod) / 12;
                break;
            }
        }
        inDirectExpensesYearwiseData[i].values = [...yearlyData]
    }


    console.log(directExpensesYearwiseData);
    console.log(inDirectExpensesYearwiseData);

    //expenses total calculation......................................................
    let directExpensesTotal = [];
    let inDirentExpensesTotal = [];

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

    //all expenses total ..........................................................
    let expensesTotal = [...directExpensesTotal];
    inDirentExpensesTotal.forEach((data, i) => {
        expensesTotal[i] += data
    })


    //revenue yearwise.............................................................
    const revenueYearwise = [...revenue.totalRevenue]

    //closing stock yearwise........................................................
    const closingStockYearwise = moreDetails.closingStock.map((entry) => {
        return (Number(entry))
    })


    //revenue + closingstock........................................................
    let revenue_closingstock_total = [];
    for (let i = 0; i < years; i++) {
        revenue_closingstock_total.push(Math.round(revenueYearwise[i] + closingStockYearwise[i]));
    }

    //opening stock yearwise........................................................
    let openingStockYearwise = moreDetails.openingStock.map((entry) => {
        return (Number(entry))
    })

    //totalRevenue..................................................................
    let totalRevenue = [];
    for (let i = 0; i < years; i++) {
        totalRevenue[i] = Math.round(revenueYearwise[i] + closingStockYearwise[i] - openingStockYearwise[i]);
    }


    //adding opening stock to expenses total
    let expenses_openingStock_total = [...expensesTotal]
    for (let i = 0; i < years; i++) {
        expenses_openingStock_total[i] = Math.round(expensesTotal[i] + openingStockYearwise[i]);
    }

    //grossProfit...................................................................
    let grossProfitYearwise = [];
    for (let i = 0; i < years; i++) {
        grossProfitYearwise.push(Math.round(totalRevenue[i] - directExpensesTotal[i]));
    }

    //depriciation yearwise..........................................................
    let depriciationYearwise = [...depreciationData.totalDepreciation];

    //Interest on TL yearwise.........................................................
    let interestOnTLYearwise = [];
    repaymentData.tableTotalData.map((entry, i) => {
        if ((i + 1) <= years)
            interestOnTLYearwise.push(entry.interestTotal)
    })

    //Monotorium period changes on interestOnTLYearwise.............................
    {
        let MoratoriumPeriod = reportSettings.MoratoriumPeriod;
        let startingMonth = Number(reportSettings.SelectStartingMonth);
        let currentYear = 1;
        let yearlyData = [...interestOnTLYearwise];
        let interestOnEachMoratoriumMonth = 0;

        if (MoratoriumPeriod > 0) {
            interestOnEachMoratoriumMonth = repaymentData.tableData[0].interestAmount;
        }

        while (MoratoriumPeriod > 0) {
            let noOfMonthsLeftInCurrentYear = 13 - startingMonth;
            MoratoriumPeriod -= noOfMonthsLeftInCurrentYear;

            if (MoratoriumPeriod > 0) {
                yearlyData[currentYear - 1] = 0;
                currentYear += 1;
                startingMonth = 1;
            } else {
                MoratoriumPeriod = 0 - MoratoriumPeriod;
                yearlyData[currentYear - 1] = yearlyData[currentYear - 1] - ((12 - MoratoriumPeriod) * interestOnEachMoratoriumMonth);
                break;
            }
        }
        interestOnTLYearwise = [...yearlyData]
    }


    //Interest on WC yearwise.........................................................
    //meansOfFinance.workingCapital.termLoan
    //means of finance se working capital se term loan * interestOnWC
    //same for every year
    let interestOnWC = meansOfFinance.workingCapital.termLoan;
    let interestOnWCYearwise = [];
    for (let i = 1; i <= years; i++) {
        interestOnWCYearwise.push(Math.round(((interestOnWC * reportSettings.interestOnWC) / 100)))
    }

    //Monotorium period changes on interestOnWCYearwise.............................
    {
        let MoratoriumPeriod = reportSettings.MoratoriumPeriod;
        let startingMonth = Number(reportSettings.SelectStartingMonth);
        let currentYear = 1;
        let yearlyData = [...interestOnWCYearwise];

        while (MoratoriumPeriod > 0) {
            let noOfMonthsLeftInCurrentYear = 13 - startingMonth;
            MoratoriumPeriod -= noOfMonthsLeftInCurrentYear;

            if (MoratoriumPeriod > 0) {
                yearlyData[currentYear - 1] = 0;
                currentYear += 1;
                startingMonth = 1;
            } else {
                MoratoriumPeriod = 0 - MoratoriumPeriod;
                yearlyData[currentYear - 1] = (yearlyData[currentYear - 1] * MoratoriumPeriod) / 12;
                break;
            }
        }
        interestOnWCYearwise = [...yearlyData]
    }


    //inDirectExpenses + Depreciation + Interest on TL + Interest on WC
    let miscTotalYearwise = [];
    for (let i = 0; i < years; i++) {
        miscTotalYearwise.push(Math.round(
            inDirentExpensesTotal[i] + depriciationYearwise[i] + interestOnTLYearwise[i] + interestOnWCYearwise[i])
        );
    }

    //profit before tax yearwise......................................................
    const profitBeforeTaxYearwise = [];
    for (let i = 0; i < years; i++) {
        profitBeforeTaxYearwise.push(Math.round(grossProfitYearwise[i] - miscTotalYearwise[i]));
    }

    //income tax yearwise.............................................................
    let incomeTaxYearwise = [];
    let incomeTaxRate = reportSettings.incomeTax;
    for (let i = 0; i < years; i++) {
        let tax = ((profitBeforeTaxYearwise[i] * incomeTaxRate) / 100);
        incomeTaxYearwise.push(Math.round(tax));
    }

    //profit after tax yearwise........................................................
    let profitAfterTaxYearwise = [];
    for (let i = 0; i < years; i++) {
        profitAfterTaxYearwise.push(Math.round(profitBeforeTaxYearwise[i] - incomeTaxYearwise[i]));
    }

    //withdrawls.......................................................................
    let withdrawlsYerwise = [...moreDetails.withdrawls];

    //Balance trf. To Balance Sheet........................................................
    let balanceTransferToBalanceSheet = [];
    withdrawlsYerwise.map((wd, i) => {
        balanceTransferToBalanceSheet.push((wd - profitAfterTaxYearwise[i]))
    })

    //Cumilative Balance trf. To Balance Sheet............................................
    let cumilativeBalanceTransferToBalanceSheet = [];
    balanceTransferToBalanceSheet.map((bt, i) => {
        if (i === 0) {
            cumilativeBalanceTransferToBalanceSheet.push(bt);
        } else {
            cumilativeBalanceTransferToBalanceSheet.push((balanceTransferToBalanceSheet[i - 1] + bt));
        }
    })

    //Cash Profit.......................................................................
    let cashProfit = [];
    profitAfterTaxYearwise.map((pat, i) => {
        cashProfit.push((depriciationYearwise[i] + pat));
    })

    return {
        years,
        rate,
        directExpenses,
        inDirectExpenses,
        directExpensesYearwiseData,
        inDirectExpensesYearwiseData,
        directExpensesTotal,
        inDirentExpensesTotal,
        expensesTotal,
        revenueYearwise,
        closingStockYearwise,
        revenue_closingstock_total,
        openingStockYearwise,
        totalRevenue,
        expenses_openingStock_total,
        grossProfitYearwise,
        depriciationYearwise,
        interestOnTLYearwise,
        interestOnWCYearwise,
        miscTotalYearwise,
        profitBeforeTaxYearwise,
        incomeTaxYearwise,
        profitAfterTaxYearwise,
        withdrawlsYerwise,
        balanceTransferToBalanceSheet,
        cumilativeBalanceTransferToBalanceSheet,
        cashProfit
    }
}

export const generateCashFlowTable = (reportSettings, profitablityTableData, meansOfFinance, moreDetails, depriciationTableData, repaymentData) => {
    const years = reportSettings.ProjectionYears;

    const { profitBeforeTaxYearwise, interestOnTLYearwise, interestOnWCYearwise } = profitablityTableData;

    //Net profit before interest and tax
    const netProfitBeforeInterestAndTax = [];
    profitBeforeTaxYearwise.map((pbt, i) => {
        netProfitBeforeInterestAndTax.push(pbt + interestOnTLYearwise[i] + interestOnWCYearwise[i]);
    })

    //Capital
    const capital = Array.from({ length: years }).fill(0);
    capital[0] = Number(meansOfFinance.totalPC);

    //Reserves and subsidies
    const reservesAndSubsidies = Array.from({ length: years }).fill(0);

    //Bank loan
    const bankLoan = Array.from({ length: years }).fill(0);
    bankLoan[0] = Number(meansOfFinance.termLoan.termLoan);

    //Government Grants
    const governmentGrants = Array.from({ length: years }).fill(0);

    //Working capital loan
    const workingCapitalLoan = Array.from({ length: years }).fill(Number(meansOfFinance.workingCapital.termLoan));

    //Depriciation -> profitablity se aana hai
    const depriciation = profitablityTableData.depriciationYearwise;

    //Current Libalities
    const currentLibalities = moreDetails.currentLibalities;

    //Current liabilities total
    const currentLibalitiesTotal = Array.from({ length: years }).fill(0);
    console.log(currentLibalities);
    currentLibalities.map((entry) => {
        entry.years.map((val, j) => {
            currentLibalitiesTotal[j] += val;
        })
    })

    //Total 1
    const total1 = Array.from({ length: years }).fill(0);
    for (let i = 0; i < years; i++) {
        total1[i] = netProfitBeforeInterestAndTax[i] + capital[i] + reservesAndSubsidies[i]
            + bankLoan[i] + governmentGrants[i] + workingCapitalLoan[i] + depriciation[i]
            + currentLibalitiesTotal[i];
    }

    //-------------------------------------------------

    //gross Fixed assets from depriciation
    const fixedAssets = depriciationTableData.totalGrossFixedAssets;

    //Repayment table se each year ka repayment 
    const repaymentOfTermLoan = [];
    repaymentData.tableTotalData.map((entry) => {
        repaymentOfTermLoan.push(entry.repaymentTotal)
    })

    //Interest on term loan
    const interestOnTermLoan = profitablityTableData.interestOnTLYearwise;

    //Interest on working capital
    const interestOnWorkingCapital = profitablityTableData.interestOnWCYearwise;

    //Income Tax
    const incomeTax = Array.from({ length: years }).fill(0);

    //Withdrawls 
    const withdrawls = moreDetails.withdrawls.map((val) => Number(val));

    //Current assets
    const currentAssets = moreDetails.currentAssets;

    //Current assets total
    const currentAssetsTotal = Array.from({ length: years }).fill(0);
    currentAssets.map((entry) => {
        entry.years.map((val, j) => {
            currentAssetsTotal[j] += val;
        })
    })

    //Total 2
    const total2 = Array.from({ length: years }).fill(0);
    for (let i = 0; i < years; i++) {
        total2[i] = fixedAssets[i] + repaymentOfTermLoan[i] + interestOnTermLoan[i]
            + interestOnWorkingCapital[i] + incomeTax[i] + withdrawls[i] + currentAssetsTotal[i];
    }

    //Opening cash balance
    const openingCashBalance = [];

    //Surplus
    const surplus = [];

    //Closing cash balance
    const closingCashBalance = [];

    for (let i = 0; i < years; i++) {
        if (i === 0) {
            openingCashBalance.push(0);
        } else {
            openingCashBalance.push(closingCashBalance[i - 1]);
        }

        surplus.push(total1[i] - total2[i]);
        closingCashBalance.push(openingCashBalance[i] + surplus[i]);
    }

    return {
        years,
        netProfitBeforeInterestAndTax,
        capital,
        reservesAndSubsidies,
        bankLoan,
        governmentGrants,
        workingCapitalLoan,
        depriciation,
        currentLibalities,
        currentLibalitiesTotal,
        total1,
        fixedAssets,
        repaymentOfTermLoan,
        interestOnTermLoan,
        interestOnWorkingCapital,
        incomeTax,
        withdrawls,
        currentAssets,
        currentAssetsTotal,
        total2,
        openingCashBalance,
        surplus,
        closingCashBalance
    }

}