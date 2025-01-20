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
        fontSize: 10
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
        fontSize: 10
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
        fontSize: 11
    },
});


const RepaymentTable = ({ repaymentTable, repaymentTableStartingMonth, tableTotalData }) => {
    let startingMonth = repaymentTableStartingMonth;
    let totalIndex = 0;

    const getTotal = (index) => {
        // console.log("Outer");
        if ((startingMonth === 12 && tableTotalData.length > 0) || index === -1) {
            const totalData = tableTotalData[totalIndex];
            totalIndex++;
            console.log("Inner", totalData);
            startingMonth = 1;
            return (
                < View style={styles.tableRowRed}>
                    <View style={styles.tableCellDark}>
                        <Text>Total</Text>
                    </View>
                    <View style={styles.tableCellDark}>
                        <Text>-</Text>
                    </View>
                    <View style={styles.tableCellDark}>
                        <Text>-</Text>
                    </View>
                    <View style={styles.tableCellDark}>
                        <Text>{totalData.repaymentTotal}</Text>
                    </View>
                    <View style={styles.tableCellDark}>
                        <Text>-</Text>
                    </View>
                    <View style={styles.tableCellDark}>
                        <Text>{totalData.interestTotal}</Text>
                    </View>
                    <View style={styles.tableCellDark}>
                        <Text>{totalData.totalTotal}</Text>
                    </View>
                </View >
            )
        }
        else {
            console.log("Else");
            startingMonth++;
            return (
                <></>
            )
        }


    }


    return (
        <View style={styles.table}>
            <View style={styles.tableHead}>
                <View style={styles.tableHeadCell}>
                    <Text>S.No.</Text>
                </View>
                <View style={styles.tableHeadCell}>
                    <Text>Month</Text>
                </View>
                <View style={styles.tableHeadCell}>
                    <Text>Principal</Text>
                </View>
                <View style={styles.tableHeadCell}>
                    <Text>Repayment</Text>
                </View>
                <View style={styles.tableHeadCell}>
                    <Text>CB</Text>
                </View>
                <View style={styles.tableHeadCell}>
                    <Text>Interest</Text>
                </View>
                <View style={styles.tableHeadCell}>
                    <Text>Total</Text>
                </View>
            </View>
            {
                repaymentTable.map((data, index) => {
                    return (
                        <View key={index}>
                            <View style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                                <View style={styles.tableCell}>
                                    <Text>{data.sno}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Text>{data.month}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Text>{data.principal}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Text>{data.repayment}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Text>{data.closingBalance}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Text>{data.interestAmount}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Text>{data.total}</Text>
                                </View>
                            </View>
                            {
                                getTotal(index)
                            }
                        </View>
                    )
                }
                )
            }
            <>
                {
                    getTotal(-1)
                }
            </>
        </View >
    );
}

export default RepaymentTable