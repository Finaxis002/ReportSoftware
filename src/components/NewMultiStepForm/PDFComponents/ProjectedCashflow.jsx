import React from 'react';
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";

Font.register({
    family: "Roboto",
    fonts: [
      { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
      { src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf", fontWeight: "bold" }, // Bold
    ],
});

const ProjectedCashflow = ({ 
    formData = {},
    calculations = {},
    totalDepreciationPerYear =[],
    netProfitBeforeTax = [],
    grossProfitValues = [],
    yearlyInterestLiabilities= [],
    yearlyPrincipalRepayment =[], 
}) => {
    if (!formData || typeof formData !== "object" || !calculations || typeof calculations !== "object") {
        console.error("❌ Invalid formData or calculations provided");
        return null;
    }

    console.log("data for term loan",yearlyInterestLiabilities)
    const startYear = Number(formData?.ProjectReportSetting?.FinancialYear) || 2025;
    const projectionYears = Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

      // ✅ Safe Helper Function to Format Numbers Based on Selected Format
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1":
        return new Intl.NumberFormat("en-IN").format(value); // Indian Format
      case "2":
        return new Intl.NumberFormat("en-US").format(value); // USD Format
      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

    return (
        <Page size={projectionYears > 12 ? "A3" : "A4"} orientation={projectionYears > 7 ? "landscape" : "portrait"}>
            <View style={[styleExpenses.paddingx]}>
                <Text style={[styles.clientName]}>
                    {formData?.AccountInformation?.clientName || "N/A"}
                </Text>
                <View style={[stylesCOP.heading, { fontWeight: "bold", paddingLeft: 10 }]}> 
                    <Text>Projected Cashflow</Text>
                </View>

                <View style={[styles.table]}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.serialNoCell, styleExpenses.sno, { textAlign: "center" }]}>S. No.</Text>
                        <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>Particulars</Text>
                        {Array.from({ length: projectionYears }).map((_, index) => (
                            <Text key={index} style={styles.particularsCell}>
                                {`${startYear + index}-${(startYear + index + 1) % 100}`}
                            </Text>
                        ))}
                    </View>

                    {/* Sources Section */}
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}>A</Text>
                        <Text style={styles.detailsCell}>Sources</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}>1</Text>
                        <Text style={styles.detailsCell}>Net Profit before Interest & Taxes</Text>
                        {Array.from({ length: projectionYears }).map((_, index) => (
                            <Text key={index} style={styles.particularsCell}>{calculations.sources?.NetProfitBeforeInterestAndTaxes?.[index] || '-'}</Text>
                        ))}
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}>2</Text>
                        <Text style={styles.detailsCell}>Promoters’ Capital</Text>
                        {Array.from({ length: projectionYears }).map((_, index) => (
                            <Text key={index} style={styles.particularsCell}>{index === 0 ? formData.MeansOfFinance?.workingCapital?.promoterContribution || '-' : '0'}</Text>
                        ))}
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}>3</Text>
                        <Text style={styles.detailsCell}>Bank Term Loan</Text>
                        {Array.from({ length: projectionYears }).map((_, index) => (
                            <Text key={index} style={styles.particularsCell}>{index === 0 ? formData.MeansOfFinance?.termLoan?.termLoan || '-' : '0'}</Text>
                        ))}
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}>3</Text>
                        <Text style={styles.detailsCell}>Working Capital Loan</Text>
                        {Array.from({ length: projectionYears }).map((_, index) => (
                            <Text key={index} style={styles.particularsCell}>{index === 0 ? formData.MeansOfFinance?.workingCapital?.termLoan || '-' : '0'}</Text>
                        ))}
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}>3</Text>
                        <Text style={styles.detailsCell}>Depreciation</Text>
                        {Array.from({ length: projectionYears }).map((_, index) => (
                            <Text key={index} style={styles.particularsCell}>{totalDepreciationPerYear[index] || '-'}</Text>
                        ))}
                    </View>

                    {/* Total Sources Calculation */}
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}></Text>
                        <Text style={[styles.detailsCell, { fontWeight: "bold" }]}>Total</Text>
                        {Array.from({ length: projectionYears }).map((_, index) => {
                            const total = (Number(calculations.sources?.NetProfitBeforeInterestAndTaxes?.[index] || 0) +
                                Number(index === 0 ? formData.MeansOfFinance?.workingCapital?.promoterContribution || 0 : 0) +
                                Number(index === 0 ? formData.MeansOfFinance?.termLoan?.termLoan || 0 : 0) +
                                Number(index === 0 ? formData.MeansOfFinance?.workingCapital?.termLoan || 0 : 0) +
                                Number(Array.isArray(totalDepreciationPerYear) && totalDepreciationPerYear[index] !== undefined ? totalDepreciationPerYear[index] : 0));
                            return <Text key={index} style={[styles.particularsCell, { fontWeight: "bold" }]}>{total || '-'}</Text>;
                        })}
                    </View>

                    
                    {/* Uses Section */}
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}>B</Text>
                        <Text style={styles.detailsCell}>Uses</Text>
                    </View>
                    {/* {['Fixed Assets', 'Repayment of Term Loan', 'Interest of Term Loan', 'Interest on Working Capital', 'Income-tax', 'Withdrawals'].map((item, idx) => (
                        <View style={styles.tableRow} key={idx}>
                            <Text style={styles.serialNoCell}>{idx + 1}</Text>
                            <Text style={styles.detailsCell}>{item}</Text>
                            {Array.from({ length: projectionYears }).map((_, index) => {
                                let value = '-';
                                switch (item) {
                                    case 'Fixed Assets':
                                        value = calculations.sources?.NetProfitBeforeInterestAndTaxes?.[index] || '-';
                                        break;
                                    case 'Promoters’ Capital':
                                        value = index === 0 ? formData.MeansOfFinance?.workingCapital?.promoterContribution || '-' : '0';
                                        break;
                                    case 'Bank Term Loan':
                                        value = index === 0 ? formData.MeansOfFinance?.termLoan?.termLoan || '-' : '0';
                                        break;
                                    case 'Working Capital Loan':
                                        value = index === 0 ? formData.MeansOfFinance?.workingCapital?.termLoan || '-' : '0';
                                        break;
                                    case 'Depreciation':
                                        value = Array.isArray(totalDepreciationPerYear) && totalDepreciationPerYear[index] !== undefined ? totalDepreciationPerYear[index] : '-';
                                        break;
                                    default:
                                        break;
                                }
                                return <Text key={index} style={styles.particularsCell}>{value}</Text>;
})}
                        </View>
                    ))} */}
                    <View style={styles.tableRow}>
                        <Text style={styles.serialNoCell}>1</Text>
                        <Text style={styles.detailsCell}>Gross Profit</Text>
                        {Array.from({ length: projectionYears }).map((_, index) => (
                            <Text key={index} style={styles.particularsCell}>{index === 0 ? (grossProfitValues[index] ? parseFloat(grossProfitValues[index]).toFixed(2).replace(/\.00$/, '') : '-') : '0'}</Text>
                        ))}
                    </View>

                    <View style={[styles.tableRow, styles.totalRow]}>
                               <Text
                                 style={[
                                   stylesCOP.serialNoCellDetail,
                                   styleExpenses.sno,
                                   styleExpenses.bordernone,
                                 ]}
                               >
                                 2
                               </Text>

                               <Text
                                 style={[
                                   stylesCOP.detailsCellDetail,
                                   styleExpenses.particularWidth,
                                   styleExpenses.bordernone,
                                 ]}
                               >
                                 Repayment of Term Loan
                               </Text>

                               {/* ✅ Display Principal Repayment Only for Projection Years */}
                               {Array.from({
                                 length: formData.ProjectReportSetting.ProjectionYears || 0,
                               }).map((_, index) => (
                                 <Text
                                   key={index}
                                   style={[
                                     stylesCOP.particularsCellsDetail,
                                     styleExpenses.fontSmall,
                                   ]}
                                 >
                                   {formatNumber(Math.round(yearlyPrincipalRepayment[index] || 0))}
                                 </Text>
                               ))}
                    </View>

                    <View style={styles.tableRow}>
    <Text style={styles.serialNoCell}>6</Text>
    <Text style={styles.detailsCell}>Interest On Term Loan</Text>
    {Array.from({ length: projectionYears }).map((_, index) => (
        <Text key={index} style={styles.particularsCell}>
            {yearlyInterestLiabilities[index] !== undefined ? yearlyInterestLiabilities[index] : '-'}
        </Text>
    ))}
</View>


                    {/* Cash Balance Section */}
                    {['Opening Cash Balance', 'Surplus during the year', 'Closing Cash Balance'].map((item, idx) => (
                        <View style={styles.tableRow} key={idx}>
                            <Text style={styles.serialNoCell}>{idx + 1}</Text>
                            <Text style={styles.detailsCell}>{item}</Text>
                            {Array.from({ length: projectionYears }).map((_, index) => (
                                <Text key={index} style={styles.particularsCell}>{calculations.cashBalances?.[item]?.[index] || '-'}</Text>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        </Page>
    );
};

export default ProjectedCashflow;




// import React from 'react';
// import { Page, View, Text } from "@react-pdf/renderer";
// import { styles, stylesCOP, styleExpenses } from "./Styles";
// import { Font } from "@react-pdf/renderer";

// Font.register({
//     family: "Roboto",
//     fonts: [
//       { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
//       { src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf", fontWeight: "bold" }, // Bold
//     ],
// });

// const ProjectedCashflow = ({ formData = {} }) => {
//     if (!formData || typeof formData !== "object") {
//         console.error("❌ Invalid formData provided");
//         return null;
//     }

//     const startYear = Number(formData?.ProjectReportSetting?.FinancialYear) || 2025;
//     const projectionYears = Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

//     return (
//         <Page size={projectionYears > 12 ? "A3" : "A4"} orientation={projectionYears > 7 ? "landscape" : "portrait"}>
//             <View style={[styleExpenses.paddingx]}>
//                 <Text style={[styles.clientName]}>
//                     {formData?.AccountInformation?.clientName || "N/A"}
//                 </Text>
//                 <View style={[stylesCOP.heading, { fontWeight: "bold", paddingLeft: 10 }]}> 
//                     <Text>Projected Cashflow</Text>
//                 </View>

//                 <View style={[styles.table]}>
//                     <View style={styles.tableHeader}>
//                         <Text style={[styles.serialNoCell, styleExpenses.sno, { textAlign: "center" }]}>S. No.</Text>
//                         <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>Particulars</Text>
//                         {Array.from({ length: projectionYears }).map((_, index) => (
//                             <Text key={index} style={styles.particularsCell}>
//                                 {`${startYear + index}-${(startYear + index + 1) % 100}`}
//                             </Text>
//                         ))}
//                     </View>

//                     {/* Sources Section */}
//                     <View style={styles.tableRow}>
//                         <Text style={styles.serialNoCell}>A</Text>
//                         <Text style={styles.detailsCell}>Sources</Text>
//                     </View>
//                     {['Net Profit before Interest & Taxes', 'Promoters’ Capital', 'Bank Term Loan', 'Working Capital Loan', 'Depreciation'].map((item, idx) => (
//                         <View style={styles.tableRow} key={idx}>
//                             <Text style={styles.serialNoCell}>{idx + 1}</Text>
//                             <Text style={styles.detailsCell}>{item}</Text>
//                             {Array.from({ length: projectionYears }).map((_, index) => (
//                                 <Text key={index} style={styles.particularsCell}>-</Text>
//                             ))}
//                         </View>
//                     ))}

//                     {/* Uses Section */}
//                     <View style={styles.tableRow}>
//                         <Text style={styles.serialNoCell}>B</Text>
//                         <Text style={styles.detailsCell}>Uses</Text>
//                     </View>
//                     {['Fixed Assets', 'Repayment of Term Loan', 'Interest of Term Loan', 'Interest on Working Capital', 'Income-tax', 'Withdrawals'].map((item, idx) => (
//                         <View style={styles.tableRow} key={idx}>
//                             <Text style={styles.serialNoCell}>{idx + 1}</Text>
//                             <Text style={styles.detailsCell}>{item}</Text>
//                             {Array.from({ length: projectionYears }).map((_, index) => (
//                                 <Text key={index} style={styles.particularsCell}>-</Text>
//                             ))}
//                         </View>
//                     ))}

//                     {/* Opening Cash Balance, Surplus, Closing Cash Balance */}
//                     {['Opening Cash Balance', 'Surplus during the year', 'Closing Cash Balance'].map((item, idx) => (
//                         <View style={styles.tableRow} key={idx}>
//                             <Text style={styles.serialNoCell}> </Text>
//                             <Text style={styles.detailsCell}>{item}</Text>
//                             {Array.from({ length: projectionYears }).map((_, index) => (
//                                 <Text key={index} style={styles.particularsCell}>-</Text>
//                             ))}
//                         </View>
//                     ))}
//                 </View>
//             </View>
//         </Page>
//     );
// };

// export default ProjectedCashflow;




