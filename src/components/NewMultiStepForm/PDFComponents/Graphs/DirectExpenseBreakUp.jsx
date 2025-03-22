import React, { useRef, useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Document, Page, Text, Image, StyleSheet, PDFViewer, BlobProvider } from "@react-pdf/renderer";

const data = [
  { name: "Material Cost", value: 400 },
  { name: "Labour Cost", value: 300 },
  { name: "Overheads", value: 200 },
  { name: "Miscellaneous", value: 100 },
];

const COLORS = ['#2E86C1', '#28B463', '#F39C12', '#E74C3C'];

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  image: {
    width: 400,
    height: 300,
    marginVertical: 10,
    alignSelf: 'center',
  }
});

const DirectExpenseBreakUp = () => {
  const chartRef = useRef(null);
  const [chartImage, setChartImage] = useState(null);

  // Capture the chart as an image when mounted
  useEffect(() => {
    if (chartRef.current) {
      const canvas = chartRef.current.querySelector('canvas');
      if (canvas) {
        const chartDataURL = canvas.toDataURL('image/png');
        setChartImage(chartDataURL);
      }
    }
  }, []);

  // ✅ PDF Component
  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Direct Expenses</Text>
        {chartImage && (
          <Image style={styles.image} src={chartImage} />
        )}
      </Page>
    </Document>
  );

  return (
    <div>
      {/* ✅ Render the Chart Outside PDF */}
      <div ref={chartRef} style={{ width: 400, height: 300 }}>
        <PieChart width={400} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={120}
            dataKey="value"
            startAngle={450}
            endAngle={90}
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>

      {/* ✅ Render PDF Viewer */}
      {chartImage && (
        <>
          <PDFViewer width="100%" height="500px">
            {MyDocument}
          </PDFViewer>

          {/* ✅ BlobProvider for Download */}
          <BlobProvider document={MyDocument}>
            {({ url, loading }) =>
              loading ? (
                <p>Generating PDF...</p>
              ) : (
                <a href={url} download="Direct_Expenses.pdf">
                  Download PDF
                </a>
              )
            }
          </BlobProvider>
        </>
      )}
    </div>
  );
};

export default DirectExpenseBreakUp;
