import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: 'grey',
        borderTop: 2,
        borderColor: '#004AAD',
        marginHorizontal: 20
    },
    footerText: {
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: .5,
        lineHeight: 2,
        marginTop: 10
    }
});

const PDFFooter = ({ pageNumber }) => {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>Page {pageNumber}</Text>
        </View>
    );
};

export default PDFFooter;
