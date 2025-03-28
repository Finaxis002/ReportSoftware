import React, { useEffect } from 'react';
import { safeText } from "../utils/safeText";

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import Step1 from './formComponents/Step1';

// Create styles
const styles = StyleSheet.create({
    page: {
        //flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    header: {
        alignSelf: 'center'
    }
});


// Create Document Component
const ReportPDF = ({ report }) => {
    return (
        <Document>
            {/* <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text>Company Name</Text>
                </View>
                <View style={styles.section}>
                    <Text>{safeText(JSON.stringify(report))}</Text>
                </View>
            </Page> */}
            <Page size="A4" style={styles.page}>
                <View style={{ marginBottom: 20, borderRadius: 1, borderColor: 'black' }}>
                    <Text style={{ color: 'black', fontSize: 20 }}>Personal Details</Text>
                </View>
                <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>Name:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.name}</Text></View>
                </View>
                <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>Email:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.email}</Text></View>
                </View>
                <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>Phone:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.phone}</Text></View>
                </View>
            </Page>
            <Page size="A4" style={styles.page}>
                <View style={{ marginBottom: 20, borderRadius: 1, borderColor: 'black' }}>
                    <Text style={{ color: 'black', fontSize: 20 }}>CA Details</Text>
                </View>
                {report.step2.Building > 0 && <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>Building:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.Building}</Text></View>
                </View>}
                {report.step2.ComputersPerpherals > 0 && <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>Computer Peripherals:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.ComputersPerpherals}</Text></View>
                </View>}
                {report.step2.FurnitureandFittings > 0 && <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>Furniture & Fittings:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.FurnitureandFittings}</Text></View>
                </View>}
                {report.step2.IntangibleAssets > 0 && <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>Intangible Assets:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.IntangibleAssets}</Text></View>
                </View>}
                {report.step2.PlantMachinery > 0 && <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>PlantMachinery:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.PlantMachinery}</Text></View>
                </View>}
                {report.step2.Miscellaneous > 0 && <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>Miscellaneous:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.Miscellaneous}</Text></View>
                </View>}
                {report.step2.TotalExpenditure > 0 && <View style={{ flexDirection: 'row', borderRadius: 1, borderColor: 'black' }}>
                    <View style={{ width: '40%', backgroundColor: 'lime', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>TotalExpenditure:</Text></View>
                    <View style={{ width: '40%', backgroundColor: 'transparent', padding: 10 }}><Text style={{ color: 'black', fontSize: 16 }}>{report.TotalExpenditure}</Text></View>
                </View>}
            </Page>
        </Document>
    )
};


export default ReportPDF