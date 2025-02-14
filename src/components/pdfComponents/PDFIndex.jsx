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
        width: '10%',
        fontWeight: 100,
        color: '#FFFFFF',
        fontSize: 10
    },
    tableHeadCellHeadings: {
        padding: 8,
        borderStyle: 'solid',
        borderColor: 'white',
        borderWidth: 3,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        width: '90%',
        fontWeight: 100,
        color: 'black',
        fontSize: 10
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        color: 'black',
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
        width: '10%',
        fontWeight: 100,
        fontSize: 10,
        color: 'black',
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

const PDFIndex = () => {
    return (
        <View style={styles.table}>
            <View style={styles.tableHead}>
                <View style={styles.tableHeadCell}>
                    <Text>S.No.</Text>
                </View>
                <View style={styles.tableHeadCellHeadings}>
                    <Text>Headings</Text>
                </View>
            </View>
            <View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>1</Text>
                    </View>
                    <View style={styles.tableHeadCellHeadings}>
                        <Text>Dummy Data</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>2</Text>
                    </View>
                    <View style={styles.tableHeadCellHeadings}>
                        <Text>Dummy Data</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>3</Text>
                    </View>
                    <View style={styles.tableHeadCellHeadings}>
                        <Text>Dummy Data</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>4</Text>
                    </View>
                    <View style={styles.tableHeadCellHeadings}>
                        <Text>Dummy Data</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>5</Text>
                    </View>
                    <View style={styles.tableHeadCellHeadings}>
                        <Text>Dummy Data</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>6</Text>
                    </View>
                    <View style={styles.tableHeadCellHeadings}>
                        <Text>Dummy Data</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>7</Text>
                    </View>
                    <View style={styles.tableHeadCellHeadings}>
                        <Text>Dummy Data</Text>
                    </View>
                </View>
            </View>
        </View >
    )
}

export default PDFIndex