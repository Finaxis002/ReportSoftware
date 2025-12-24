import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP } from "./Styles"; // Import necessary styles
import PDFHeader from "./HeaderFooter/PDFHeader";
import PDFFooter from "./HeaderFooter/PDFFooter";
import { totalCost } from "../Utils/generatedPDFUtils/PDFCaclculationsExportor";

const CostOfProject = ({ formData, formatNumber }) => {
  

  return (
    <Page size="A4" style={styles.page}>
      <PDFHeader />
      <View style={stylesCOP.heading}>
        <Text>Cost Of Project</Text>
      </View>

      <View style={[styles.table, { paddingBottom: 0 }]}>
        <View style={styles.tableHeader}>
          <Text style={[styles.serialNoCell, { width: 100 }]}>S.No.</Text>
          <Text style={styles.particularsCell}>Particulars</Text>
          <Text style={[styles.detailsCell, {borderRight:0}]}>Amount</Text>
        </View>

      
        {(() => {
          const costItems = Object.entries(
            formData?.CostOfProject || {}
          ).filter(([_, field]) => parseFloat(field?.amount || 0) > 0);

          const normalItems = costItems.filter(
            ([_, field]) => !field?.isPreliminary
          );
          const preliminaryItems = costItems.filter(
            ([_, field]) => field?.isPreliminary
          );

          let serial = 1;

          // Total of preliminary expenses
          const preliminaryTotal = preliminaryItems.reduce(
            (sum, [_, field]) => sum + parseFloat(field?.amount || 0),
            0
          );

          return (
            <>
              {/* Normal Items */}
              {normalItems.map(([key, field]) => (
                <View key={key} style={styles.tableRow}>
                  <Text style={[stylesCOP.serialNoCellDetail, { width: 100 }]}>
                    {serial++}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      { textAlign: "left" },
                    ]}
                  >
                    {field?.name || "N/A"}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      { textAlign: "right", borderRight: 0 },
                    ]}
                  >
                    {formatNumber(field?.amount || 0)}
                  </Text>
                </View>
              ))}

              {/* Working Capital */}
              {formData?.MeansOfFinance?.totalWorkingCapital && (
                <View style={styles.tableRow}>
                  <Text style={[stylesCOP.serialNoCellDetail, { width: 100 }]}>
                    {serial++}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      { textAlign: "left" },
                    ]}
                  >
                    Working Capital Required
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      { textAlign: "right", borderRight: 0 },
                    ]}
                  >
                    {formatNumber(formData.MeansOfFinance.totalWorkingCapital)}
                  </Text>
                </View>
              )}

              {/* Parent Row: Preliminary Expense */}
              {preliminaryItems.length > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[stylesCOP.serialNoCellDetail, { width: 100 }]}>
                    {serial++}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      { textAlign: "left", fontWeight: "bold" },
                    ]}
                  >
                    Preliminary Expenses
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      { textAlign: "right", fontWeight: "bold", borderRight: 0 },
                    ]}
                  >
                    {formatNumber(preliminaryTotal)}
                  </Text>
                </View>
              )}

              {/* Sub Items A, B, C */}
              {preliminaryItems.length > 0 &&
                preliminaryItems.map(([key, field], index) => (
                  <View key={key} style={[styles.tableRow]}>
                    <Text
                      style={[stylesCOP.serialNoCellDetail, { width: 100 }]}
                    >
                      {/* A, B, C... */}
                    </Text>
                    <View
                      style={[
                        stylesCOP.particularsCellsDetail,
                        {
                          paddingLeft: 10,
                          flexDirection: "row",
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <Text style={{ width: "5%", textAlign: "left" }}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                      <Text
                        style={{
                          width: "65%",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {field?.name || "N/A"}
                      </Text>
                      <Text style={{ width: "30%", textAlign: "right" , borderRight:0 }}>
                        {formatNumber(field?.amount || 0)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        { textAlign: "right", borderRight: 0  },
                      ]}
                    ></Text>
                  </View>
                ))}

              {/* No data fallback */}
              {costItems.length === 0 &&
                !formData?.MeansOfFinance?.totalWorkingCapital && (
                  <View style={styles.tableRow}>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        { textAlign: "center", width: "100%" },
                      ]}
                    >
                      No cost data available
                    </Text>
                  </View>
                )}
            </>
          );
        })()}

        {/* ✅ Total Cost Row (Including Working Capital) */}
        <View style={styles.tableRow}>
          <Text style={[stylesCOP.serialNoCellDetail, { width: 100 }]}></Text>
          <View
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.boldText,
              styles.Total,
              {
                borderWidth: 0,
                display: "flex",
                alignContent: "flex-end",
                alignItems: "flex-end",
                fontSize: "10px",
                padding: 0,
              },
            ]}
          >
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styles.Total,
                {
                  width: "30%",
                  borderTop: 1,
                  textAlign: "left",
                  borderLeftWidth: 1,
                  borderBottomWidth: 0,
                },
              ]}
            >
              {" "}
              Total{" "}
            </Text>
          </View>

          <Text
            style={[
              stylesCOP.detailsCellDetail,
              stylesCOP.boldText,
              styles.Total,
              {
                borderTop: "1px solid #000",
                borderBottomWidth: 0,
                borderLeftWidth: 0,
                fontWeight: "bold",
                textAlign: "right",
                borderRightWidth:0
              },
            ]}
          >
            {formatNumber(totalCost)}
          </Text>
        </View>
      </View>
     <PDFFooter />
    </Page>
  );
};

export default CostOfProject;
