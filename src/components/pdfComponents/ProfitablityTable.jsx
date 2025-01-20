import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderColor: 'white',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableHead: {
        flexDirection: 'row',
        backgroundColor: '#C3CFF4',
        color: '#FFFFFF'
    },
    tableHeadCell: {
        padding: 8,
        borderStyle: 'solid',
        borderColor: 'white',
        borderWidth: 3,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        width: '25%',
        fontWeight: 100,
        color: '#FFFFFF',
        fontSize: 7
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    tableRowEven: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
    },
    tableRowRed: {
        flexDirection: 'row',
        backgroundColor: '#FF0000',
        color: "#FFFFFF"
    },
    tableCellHeader: {
        padding: 8,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'white',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        width: '33.33%',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 8,
        borderStyle: 'solid',
        borderColor: 'white',
        borderWidth: 3,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        width: '25%',
        fontWeight: 100,
        fontSize: 7
    },
    tableCellDark: {
        padding: 8,
        fontWeight: 500,
        borderStyle: 'solid',
        borderColor: 'white',
        borderWidth: 3,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        width: '25%',
        fontSize: 7
    },
});

const ProfitablityTable = ({
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
}) => {

    // const getTotal = (index) => {
    //     // console.log("Outer");
    //     if ((startingMonth === 12 && tableTotalData.length > 0) || index === -1) {
    //         const totalData = tableTotalData[totalIndex];
    //         totalIndex++;
    //         console.log("Inner", totalData);
    //         startingMonth = 1;
    //         return (
    //             < View style={styles.tableRowRed}>
    //                 <View style={styles.tableCellDark}>
    //                     <Text>Total</Text>
    //                 </View>
    //                 <View style={styles.tableCellDark}>
    //                     <Text>-</Text>
    //                 </View>
    //                 <View style={styles.tableCellDark}>
    //                     <Text>-</Text>
    //                 </View>
    //                 <View style={styles.tableCellDark}>
    //                     <Text>{totalData.repaymentTotal}</Text>
    //                 </View>
    //                 <View style={styles.tableCellDark}>
    //                     <Text>-</Text>
    //                 </View>
    //                 <View style={styles.tableCellDark}>
    //                     <Text>{totalData.interestTotal}</Text>
    //                 </View>
    //                 <View style={styles.tableCellDark}>
    //                     <Text>{totalData.totalTotal}</Text>
    //                 </View>
    //             </View >
    //         )
    //     }
    //     else {
    //         console.log("Else");
    //         startingMonth++;
    //         return (
    //             <></>
    //         )
    //     }


    // }


    return (
        <View style={styles.table}>
            <View>
                {/* ================Header============== */}
                <View style={styles.tableHead}>
                    <View style={styles.tableHeadCell}>
                        <Text></Text>
                    </View>
                    {
                        revenueYearwise.map((data, i) => {
                            return (
                                <View style={styles.tableHeadCell}>
                                    <Text>Year {i + 1}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Revenue============== */}
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Revenue</Text>
                    </View>
                    {
                        revenueYearwise.map((revenue, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{revenue}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Closing Stock============== */}
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>Closing Stock</Text>
                    </View>
                    {
                        closingStockYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Revenue +  closing stock============== */}
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Total</Text>
                    </View>
                    {
                        revenue_closingstock_total.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Opening Stock============== */}
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>Opening Stock</Text>
                    </View>
                    {
                        openingStockYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Normal expenses============== */}
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Normal Expenses</Text>
                    </View>
                    {
                        expensesTotal.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text> - </Text>
                                </View>
                            )
                        })
                    }
                </View>
                {
                    expensesYearwiseData.map((expense, i) => {
                        return (
                            <View style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven} key={i}>
                                <View style={styles.tableCell}>
                                    <Text>{expense.key}</Text>
                                </View>
                                {
                                    expense.values.map((yearData, i) => {
                                        return (
                                            <View style={styles.tableCell} key={i}>
                                                <Text>{yearData}</Text>
                                            </View>
                                        )
                                    })
                                }
                            </View>

                        )
                    })
                }
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Total</Text>
                    </View>
                    {
                        expensesTotal.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Gross Profit============== */}
                <View style={styles.tableRowRed}>
                    <View style={styles.tableCell}>
                        <Text>Gross Profit</Text>
                    </View>
                    {
                        grossProfitYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Direct expenses============== */}
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Direct Expenses</Text>
                    </View>
                    {
                        directExpensesTotal.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text> - </Text>
                                </View>
                            )
                        })
                    }
                </View>
                {
                    directExpensesYearwiseData.map((expense, i) => {
                        return (
                            <View style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven} key={i}>
                                <View style={styles.tableCell}>
                                    <Text>{expense.key}</Text>
                                </View>
                                {
                                    expense.values.map((yearData, i) => {
                                        return (
                                            <View style={styles.tableCell} key={i}>
                                                <Text>{yearData}</Text>
                                            </View>
                                        )
                                    })
                                }
                            </View>

                        )
                    })
                }
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Total</Text>
                    </View>
                    {
                        directExpensesTotal.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================In-Direct expenses============== */}
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>In-Direct Expenses</Text>
                    </View>
                    {
                        inDirentExpensesTotal.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text> - </Text>
                                </View>
                            )
                        })
                    }
                </View>
                {
                    inDirectExpensesYearwiseData.map((expense, i) => {
                        return (
                            <View style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven} key={i}>
                                <View style={styles.tableCell}>
                                    <Text>{expense.key}</Text>
                                </View>
                                {
                                    expense.values.map((yearData, i) => {
                                        return (
                                            <View style={styles.tableCell} key={i}>
                                                <Text>{yearData}</Text>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        )
                    })
                }
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Total</Text>
                    </View>
                    {
                        inDirentExpensesTotal.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Depriciation============== */}
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>Depriciation</Text>
                    </View>
                    {
                        depriciationYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Interest on TL============== */}
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Interest on TL</Text>
                    </View>
                    {
                        interestOnTLYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Interest on WC============== */}
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>Interest on WC</Text>
                    </View>
                    {
                        interestOnWCYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Misc total============== */}
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>Total</Text>
                    </View>
                    {
                        miscTotalYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Profit before tax============== */}
                <View style={styles.tableRowRed}>
                    <View style={styles.tableCell}>
                        <Text>Profit Before Tax</Text>
                    </View>
                    {
                        profitBeforeTaxYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Income Tax============== */}
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>Income Tax</Text>
                    </View>
                    {
                        incomeTaxYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Profit after tax============== */}
                <View style={styles.tableRowRed}>
                    <View style={styles.tableCell}>
                        <Text>Profit After Tax</Text>
                    </View>
                    {
                        profitAfterTaxYearwise.map((yearData, i) => {
                            return (
                                <View style={styles.tableCell} key={i}>
                                    <Text>{yearData}</Text>
                                </View>
                            )
                        })
                    }
                </View>



            </View>


        </View>
    )
}

export default ProfitablityTable