import React from 'react';
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
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    tableRowEven: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
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
        color: '#3d3d3d',
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

const PDFTable = ({ data }) => {
    return (
        <View style={styles.table}>
            {data.map((row, index) => (
                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                    {row.map((cell, cellIndex) => (
                        <View key={cellIndex} style={cellIndex === 0 ? styles.tableCellDark : styles.tableCell}>
                            <Text>{cell}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

export default PDFTable;
