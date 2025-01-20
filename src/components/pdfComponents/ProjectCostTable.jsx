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

// "TotalExpenditure": 2531782

const ProjectCostTable = ({ formDetails }) => {
    console.log(formDetails);

    return (
        <View style={styles.table}>
            <View style={styles.tableHead}>
                <View style={styles.tableHeadCell}>
                    <Text>S.No.</Text>
                </View>
                <View style={styles.tableHeadCell}>
                    <Text>Item</Text>
                </View>
                <View style={styles.tableHeadCell}>
                    <Text>Amount</Text>
                </View>
            </View>
            <View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>1</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>Land</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>{formDetails.Land}</Text>
                    </View>
                </View>
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>2</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>Shed/building/Tank</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>{formDetails.Building}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>3</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>Furniture and Fittings</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>{formDetails.FurnitureandFittings}</Text>
                    </View>
                </View>
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>4</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>Agriculture machinery/motors</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>{formDetails.PlantMachinery}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>5</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>Intangible Assets</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>{formDetails.IntangibleAssets}</Text>
                    </View>
                </View>
                <View style={styles.tableRowEven}>
                    <View style={styles.tableCell}>
                        <Text>6</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>Computers Peripherals</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>{formDetails.ComputersPeripherals}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                        <Text>7</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>Miscellaneous</Text>
                    </View>
                    <View style={styles.tableCell}>
                        <Text>{formDetails.Miscellaneous}</Text>
                    </View>
                </View>
            </View>
        </View >
    )
}

export default ProjectCostTable