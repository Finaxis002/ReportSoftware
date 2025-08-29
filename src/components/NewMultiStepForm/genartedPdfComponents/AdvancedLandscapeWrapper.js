import React from "react";
import { View, Text } from "@react-pdf/renderer";

const AdvancedLandscapeWrapper = ({ 
  children, 
  financialYearLabels, 
  formData,
  formatNumber,
  pageNumber,
  orientation,
  isAdvancedLandscape = false,
  chunkIndex = 0,
  totalChunks = 1
}) => {
  const projectionYears = parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 5;
  
  // If not in advanced landscape mode or 10 years or less, use regular layout
  if (orientation !== "advanced-landscape" || projectionYears <= 10) {
    return children;
  }
  
  // Split years into chunks of 10
  const yearChunks = [];
  for (let i = 0; i < financialYearLabels.length; i += 10) {
    yearChunks.push(financialYearLabels.slice(i, i + 10));
  }
  
  return (
    <>
    {yearChunks.map((chunk, idx) => (
  <View key={idx} wrap={false}>
    {idx > 0 && (
      <View style={{
        padding: 5,
        backgroundColor: '#f0f0f0',
        borderBottom: 1,
        borderBottomColor: '#cccccc',
        marginBottom: 5
      }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
          Continued: Years {chunk[0]} to {chunk[chunk.length - 1]}
        </Text>
      </View>
    )}

    {React.cloneElement(children, {
      financialYearLabels: chunk,
      isAdvancedLandscape: true,
      chunkIndex: idx,
      totalChunks: yearChunks.length,
      orientation: "landscape" // Force landscape for advanced landscape mode
    })}

    {idx < yearChunks.length - 1 && (
      <View style={{
        width: '100%',
        height: 1,
        marginVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        borderBottomStyle: 'dashed'
      }} />
    )}
  </View>
))}

    </>
  );
};

export default AdvancedLandscapeWrapper;