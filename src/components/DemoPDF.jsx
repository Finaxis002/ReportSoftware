import React, { useEffect, useState } from 'react'
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import cover from "../images/albumCover.png"
import pdfCover from "../images/SA-Cover.png"
import PDFTable from './pdfComponents/PDFTable';
import PDFFooter from './pdfComponents/PDFFooter';
import PDFCharts from './pdfComponents/PDFCharts';
import RepaymentTable from './pdfComponents/RepaymentTable';
import ProfitablityTable from './pdfComponents/ProfitablityTable';
import ProjectCostTable from './pdfComponents/ProjectCostTable';
import RevenueTable from './pdfComponents/RevenueTable';
import RevenueTable2 from './pdfComponents/RevenueTable2';
import PDFIndex from './pdfComponents/PDFIndex';
import officePhoto from '../images/sa-office.jpeg'

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'coloumn',
        backgroundColor: 'white',
        padding: 20,
    },
    section: {
        margin: 5,
        lineHeight: 1.3,
        fontSize: 14,
        paddingHorizontal: 20,
        // padding: 10,        
        // flexGrow: 1
    },
    header: {
        alignSelf: 'center',
        color: 'red',
        fontSize: 26,
        marginBottom: 20,
    },
    text: {
        marginBottom: 10,
        fontSize: 16
    },
    image: {
        width: 200,
        height: 100,
        marginBottom: 10,
    },
    frontPage: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    frontPageHeading: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    frontPageImage: {
        width: '100%',
        height: '100%',
    },
});

const DemoPDF = ({ report }) => {
    console.log(report);
    const data1 = [
        ['Activity', 'Fish', 'farm'],
        ['Email', 'jaikai @gmail.com'],
        ['Phone', '6868686866'],
        ['Constitution', 'Private ltd'],
        ['Scheme', 'mudra'],
        ['Number of employment', '5'], ['Total project cost', '2899999.00'],
        ['Fixed Capital', 2349999.00], ['Working Capital', 550000.00],
        ['Total Bank loan', 2614999.10], ['Promoter(s) contribution', 284999.90],
        ['Term loan', '2114999.10', 'Interest', '11.00 %'],
        ['Working capital loan', '500000.00', 'Interest', '11.00 %']
    ]

    const data2 = [
        ['Name', 'Anugraha Shrda'],
        ['Address', 'Bhopal'],
        ['Phone', '9638527410'],
        ['Designation', 'CA'],
        ['Category', 'General'],
        ['Email', 'anu@gmail.com'],
    ]

    const tableData = [
        { header1: 'Header 1', header2: 'Header 2', header3: 'Header 3' },
        { cell1: 'Cell 1', cell2: 'Cell 2', cell3: 'Cell 3' },
        { cell1: 'Cell 4', cell2: 'Cell 5', cell3: 'Cell 6' },
    ];


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.frontPage}>
                    <Image style={styles.frontPageImage} src={pdfCover} />
                </View>
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Index</Text>
                    <Text style={styles.text}>Jay Farms</Text>
                    <Text style={styles.text}>Kai Nagar 1st Block 21st Cross, KaJayi nagar, Bangalore,560016</Text>
                </View>
                <PDFIndex />
                <PDFFooter pageNumber={2} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Project at a glance</Text>
                    <Text style={styles.text}>Name & Address of Unit</Text>
                    <Text style={styles.text}>Jay Farms</Text>
                    <Text style={styles.text}>Kai Nagar 1st Block 21st Cross, KaJayi nagar, Bangalore,560016</Text>
                </View>
                <PDFTable data={data1} />
                <PDFFooter pageNumber={2} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Name & address of promoter(s)</Text>
                </View>
                <PDFTable data={data2} />
                <PDFFooter pageNumber={3} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>ABOUT THE PROJECT</Text>
                </View>
                <View style={styles.section}>
                    <Text>
                        Fish is the cheapest and most easily digestible animal protein and was obtained from natural sources from time
                        immemorial for consumption by human beings. However, due to over exploitation and pollution, the availability
                        of fish in natural waters have declined considerably forcing scientists to adopt various methods to increase its
                        production. Fish farming in controlled or under artificial conditions has become the easier way of increasing the
                        fish production and its availability for consumption. Farmers can easily take up fish culture in village ponds,
                        tanks or any new water body and can improve their financial position substantially. It also creates gainful
                        employment for skilled and unskilled youths. The technology developed for fish culture in which more than one
                        type of compatible fishes are cultured simultaneous is the most advanced and popular in the country. This
                        technology is known as Composite Fish Culture. This technology enables to get maximum fish production from
                        a pond or a tank through utilization of available fish food organisms in all the natural niches, supplemented by
                        artificial feeding. Any perennial fresh water pond/tank retaining water depth of 2 metres can be used for fish
                        culture purpose. However, the minimum level should not fall below one metre. Even seasonal ponds can also be
                        utilised for short duration fish culture
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text>
                        Fish is the cheapest and most easily digestible animal protein and was obtained from natural sources from time
                        immemorial for consumption by human beings. However, due to over exploitation and pollution, the availability
                        of fish in natural waters have declined considerably forcing scientists to adopt various methods to increase its
                        production. Fish farming in controlled or under artificial conditions has become the easier way of increasing the
                        fish production and its availability for consumption. Farmers can easily take up fish culture in village ponds,
                        tanks or any new water body and can improve their financial position substantially. It also creates gainful
                        employment for skilled and unskilled youths. The technology developed for fish culture in which more than one
                        type of compatible fishes are cultured simultaneous is the most advanced and popular in the country. This
                        technology is known as Composite Fish Culture. This technology enables to get maximum fish production from
                        a pond or a tank through utilization of available fish food organisms in all the natural niches, supplemented by
                        artificial feeding. Any perennial fresh water pond/tank retaining water depth of 2 metres can be used for fish
                        culture purpose. However, the minimum level should not fall below one metre. Even seasonal ponds can also be
                        utilised for short duration fish culture
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text>
                        Fish is the cheapest and most easily digestible animal protein and was obtained from natural sources from time
                        immemorial for consumption by human beings. However, due to over exploitation and pollution, the availability
                        of fish in natural waters have declined considerably forcing scientists to adopt various methods to increase its
                        production. Fish farming in controlled or under artificial conditions has become the easier way of increasing the
                        fish production and its availability for consumption. Farmers can easily take up fish culture in village ponds,
                        tanks or any new water body and can improve their financial position substantially. It also creates gainful
                        employment for skilled and unskilled youths. The technology developed for fish culture in which more than one
                        type of compatible fishes are cultured simultaneous is the most advanced and popular in the country. This
                        technology is known as Composite Fish Culture. This technology enables to get maximum fish production from
                        a pond or a tank through utilization of available fish food organisms in all the natural niches, supplemented by
                        artificial feeding. Any perennial fresh water pond/tank retaining water depth of 2 metres can be used for fish
                        culture purpose. However, the minimum level should not fall below one metre. Even seasonal ponds can also be
                        utilised for short duration fish culture
                    </Text>
                </View>
                <PDFFooter pageNumber={4} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}></Text>
                </View>
                <Image src={officePhoto} style={{ width: 450, margin: 50 }} />
                <Image src={officePhoto} style={{ width: 450, margin: 50 }} />
                <PDFFooter pageNumber={3} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Introduction</Text>
                </View>
                <View style={styles.section}>
                    <Text>Project report for Fish farm is as follows:</Text>
                </View>
                <View style={styles.section}>
                    <Text>
                        Fish is the cheapest and most easily digestible animal protein and was obtained from natural sources from time
                        immemorial for consumption by human beings. However, due to over exploitation and pollution, the availability
                        of fish in natural waters have declined considerably forcing scientists to adopt various methods to increase its
                        production. Fish farming in controlled or under artificial conditions has become the easier way of increasing the
                        fish production and its availability for consumption. Farmers can easily take up fish culture in village ponds,
                        tanks or any new water body and can improve their financial position substantially. It also creates gainful
                        employment for skilled and unskilled youths. The technology developed for fish culture in which more than one
                        type of compatible fishes are cultured simultaneous is the most advanced and popular in the country. This
                        technology is known as Composite Fish Culture. This technology enables to get maximum fish production from
                        a pond or a tank through utilization of available fish food organisms in all the natural niches, supplemented by
                        artificial feeding. Any perennial fresh water pond/tank retaining water depth of 2 metres can be used for fish
                        culture purpose. However, the minimum level should not fall below one metre. Even seasonal ponds can also be
                        utilised for short duration fish culture
                    </Text>
                </View>
                <PDFFooter pageNumber={4} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Project Feasibility Ratio</Text>
                </View>
                <Image src={report.graphs.line} />
                <Image src={report.graphs.pie} />
                <Image src={report.graphs.bar} />

                {/* <PDFTable data={data1} /> */}
                <PDFFooter pageNumber={3} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Cost of Project</Text>
                </View>
                <ProjectCostTable formDetails={report.formDetails} />
                <PDFFooter pageNumber={5} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Balance sheet</Text>
                </View>
                <PDFTable data={data1} />
                <PDFTable data={data1} />
                <PDFFooter pageNumber={6} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Means of Finance</Text>
                </View>
                <ProjectCostTable formDetails={report.formDetails} />
                <PDFFooter pageNumber={7} />
            </Page>

            {
                report.revenueTableData.type === "monthly" &&
                <Page size="A4" style={styles.page}>
                    <View style={styles.section}>
                        <Text style={styles.header}>Revenue</Text>
                    </View>
                    <RevenueTable
                        entries={report.revenueTableData.entries}
                        noOfMonths={report.revenueTableData.noOfMonths}
                        totalMonthlyRevenue={report.revenueTableData.totalMonthlyRevenue}
                        totalRevenue={report.revenueTableData.totalRevenue}
                    />
                    <PDFFooter pageNumber={8} />
                </Page>
            }
            {
                report.revenueTableData.type === "others" &&
                <Page size="A4" style={styles.page}>
                    <View style={styles.section}>
                        <Text style={styles.header}>Revenue</Text>
                    </View>
                    <RevenueTable2
                        entries={report.revenueTableData.entries}
                        totalRevenue={report.revenueTableData.totalRevenueOthers}
                    />
                    <PDFFooter pageNumber={8} />
                </Page>
            }


            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Profitablity Statement</Text>
                </View>
                <ProfitablityTable
                    revenueYearwise={report.profitabilityTableData.revenueYearwise}
                    closingStockYearwise={report.profitabilityTableData.closingStockYearwise}
                    revenue_closingstock_total={report.profitabilityTableData.revenue_closingstock_total}
                    openingStockYearwise={report.profitabilityTableData.openingStockYearwise}
                    expensesYearwiseData={report.profitabilityTableData.expensesYearwiseData}
                    expensesTotal={report.profitabilityTableData.expensesTotal}
                    grossProfitYearwise={report.profitabilityTableData.grossProfitYearwise}
                    directExpensesYearwiseData={report.profitabilityTableData.directExpensesYearwiseData}
                    directExpensesTotal={report.profitabilityTableData.directExpensesTotal}
                    inDirectExpensesYearwiseData={report.profitabilityTableData.inDirectExpensesYearwiseData}
                    inDirentExpensesTotal={report.profitabilityTableData.inDirentExpensesTotal}
                    depriciationYearwise={report.profitabilityTableData.depriciationYearwise}
                    interestOnTLYearwise={report.profitabilityTableData.interestOnTLYearwise}
                    interestOnWCYearwise={report.profitabilityTableData.interestOnWCYearwise}
                    miscTotalYearwise={report.profitabilityTableData.miscTotalYearwise}
                    profitBeforeTaxYearwise={report.profitabilityTableData.profitBeforeTaxYearwise}
                    incomeTaxYearwise={report.profitabilityTableData.incomeTaxYearwise}
                    profitAfterTaxYearwise={report.profitabilityTableData.profitAfterTaxYearwise}
                />
                <PDFFooter pageNumber={9} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Repayment of Term loan</Text>
                </View>
                <RepaymentTable
                    repaymentTable={report.repaymentTable}
                    repaymentTableStartingMonth={report.repaymentTableStartingMonth}
                    tableTotalData={report.tableTotalData}
                />
                <PDFFooter pageNumber={10} />
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Conclusion</Text>
                </View>
                <View style={styles.section}>
                    <Text>The project as a whole describes the scope and viability of the Agriculture industry and mainly of the financial,
                        technical and its market potential.The project guarantee sufficient fund to repay the loan and also give a good
                        return on capital investment. When analyzing the social- economic impact, this project is able to generate an
                        employment of 5 and above. It will cater the demand of Agriculture and thus helps the other business entities to
                        increase the production and service which provide service and support to this industry. Thus more cyclic
                        employment and livelihood generation. So in all ways, we can conclude the project is technically and socially
                        viable and commercially sound too.
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text>
                        When we take a close look at the Debt Service Coverage Ratio (DSCR), the avg: DSCR is 4.07 : 1, which is at a
                        higher proposition and proposes a stable venture
                        The Profit and Loss shows a steady growth in profit throughout the year and the firm has a higher Current Ratio
                        (average) of 10.48, this shows the current assets and current liabilities are managed & balanced well.
                    </Text>
                </View>
                <PDFFooter pageNumber={11} />
            </Page>
        </Document>
    )
}

export default DemoPDF