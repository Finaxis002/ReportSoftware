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

const RevenueTable = ({
    entries,
    noOfMonths,
    totalMonthlyRevenue,
    totalRevenue
}) => {

    return (
        <View style={styles.table}>
            <View>
                {/* ================Header============== */}
                <View style={styles.tableHead}>
                    <View style={styles.tableHeadCell}>
                        <Text>SNo.</Text>
                    </View>
                    <View style={styles.tableHeadCell}>
                        <Text>Particulars</Text>
                    </View>
                    {
                        totalRevenue.map((data, i) => {
                            return (
                                <View style={styles.tableHeadCell}>
                                    <Text>Year {i + 1}</Text>
                                </View>
                            )
                        })
                    }
                </View>

                {/* ================Revenue============== */}

                {
                    entries.map((row, i) => {
                        return (
                            <View style={styles.tableRowEven} key={i}>
                                <View style={styles.tableCell}>
                                    <Text>{i + 1}.</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Text>{row.particular}</Text>
                                </View>
                                {
                                    row.years.map((val, j) => {
                                        return (
                                            <View style={styles.tableCell} key={j}>
                                                <Text>{val}</Text>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        )
                    })
                }

                {/* ================Gross Profit============== */}
                <View style={styles.tableRowRed}>
                    <View style={styles.tableCell}>
                        <Text>Montly Total</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text> - </Text>
                    </View>
                    {
                        totalMonthlyRevenue.map((yearData, i) => {
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
                        <Text>No. of Months</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text> {noOfMonths} </Text>
                    </View>
                </View>

                <View style={styles.tableRowRed}>
                    <View style={styles.tableCell}>
                        <Text>Total Revenue</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text> - </Text>
                    </View>
                    {
                        totalRevenue.map((yearData, i) => {
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

export default RevenueTable