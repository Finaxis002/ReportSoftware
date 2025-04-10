import React from "react";
import { Page, View, Text, Image, Font } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

// ✅ Register Font
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: require("../Assets/Fonts/times-new-roman.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/times-new-roman-bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

const PromoterDetails = ({ formData, pdfType, formatNumber }) => {
  const projectionYears = formData?.ProjectReportSetting?.ProjectionYears || 5;

  // ✅ Determine pronouns based on gender

  return (
    <Page size="A4" style={styles.page}>
      {/* ✅ Watermark */}
      {pdfType &&
        pdfType !== "select option" &&
        (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
          <View
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 500,
              height: 700,
              marginLeft: -250,
              marginTop: -350,
              opacity: 0.4,
              zIndex: -1,
            }}
            fixed
          >
            <Image
              src={pdfType === "Sharda Associates" ? SAWatermark : CAWatermark}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        )}

      <View style={styleExpenses?.paddingx}>
        {/* ✅ Business name and financial year */}
        <View>
          <Text style={styles.businessName}>
            {formData?.AccountInformation?.businessName || "Business Name"}
          </Text>
          <Text style={styles.FinancialYear}>
            Financial Year{" "}
            {formData?.ProjectReportSetting?.FinancialYear
              ? `${formData.ProjectReportSetting.FinancialYear}-${(
                  parseInt(formData.ProjectReportSetting.FinancialYear) + 1
                ).toString()}`
              : "2025-26"}
          </Text>
        </View>

        {/* ✅ Table Heading */}
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
              marginTop: "10px",
            },
          ]}
        >
          <Text>Promoter Details</Text>
        </View>

        {/* ✅ Promoter Details Section */}
        <View>
          <View>
            <Text style={{ fontSize: 10 }}>
            
              {formData?.AccountInformation?.businessOwner || "Owner Name"} aged{" "}
              {new Date().getFullYear() -
                new Date(
                  formData?.AccountInformation?.clientDob
                ).getFullYear()}{" "}
              years having high business acumen in the field of{" "}
              {formData?.AccountInformation?.industryType || "Business"}{" "}
              Business.{" "}
              {formData?.AccountInformation?.gender?.toLowerCase() === "female"
                ? "She"
                : "He"}{" "}
              is a dynamic entrepreneur and this provides{" "}
              {formData?.AccountInformation?.gender?.toLowerCase() === "female"
                ? "her"
                : "him"}{" "}
              with an edge while setting up the current business.{" "}
             
              {formData?.AccountInformation?.businessOwner || "Client Name"} is a
              resident of{" "}
              {formData?.AccountInformation?.location||
                "Business Address Not Available"}
              .{" "}
              {formData?.AccountInformation?.gender?.toLowerCase() === "female"
                ? "She"
                : "He"}{" "}
              is willing to set up a{" "}
              {formData?.AccountInformation?.industryType || "Business"}{" "}
              Business at{" "}
              {formData?.AccountInformation?.businessAddress ||
                "Business Address Not Available"}
              , {formData?.AccountInformation?.pincode || "000000"}.
            </Text>
          </View>

          <View style={{ marginTop: "10px" }}>
            <Text style={{ fontSize: 10 }}>
              Promoter and{" "}
              {formData?.AccountInformation?.gender?.toLowerCase() === "female"
                ? "her"
                : "his"}{" "}
              family have got a fair amount of goodwill in the market which will
              aid{" "}
              {formData?.AccountInformation?.gender?.toLowerCase() === "female"
                ? "her"
                : "him"}{" "}
              in the successful running of the business.{" "}
              {formData?.AccountInformation?.gender?.toLowerCase() === "female"
                ? "She"
                : "He"}{" "}
              has an adequate amount of required experience in the same line of
              business for the success of the project. The promoter and{" "}
              {formData?.AccountInformation?.gender?.toLowerCase() === "female"
                ? "her"
                : "his"}{" "}
              family have been regular in their banking obligations and have a
              good CIBIL rating as proof for the same.
            </Text>
          </View>
        </View>

        {/* Brief Details  */}
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Text
            style={{
              
              fontWeight: "extrabold",
              textDecoration: "underline",
              fontSize: "12px",
            }}
          >
            Brief Details
          </Text>
        </View>

        {/* brief details table  */}

        <View style={{ borderWidth: 1, marginTop: "10px" }}>
          {/* name  */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.particularsCellsDetail,
                { padding: "8px", width: "40%", textAlign: "left" },
              ]}
            >
              Name
            </Text>
            <Text
              style={[
                styles.separatorCellDetail,
                { padding: "8px", textAlign: "center", width: "5%" },
              ]}
            >
              :
            </Text>
            <Text
              style={[
                styles.detailsCellDetail,
                { padding: "8px", width: "55%", textAlign: "left" },
              ]}
            >
              {formData?.AccountInformation?.businessOwner}
            </Text>
          </View>

          {/* address  */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.particularsCellsDetail,
                { padding: "8px", width: "40%", textAlign: "left" },
              ]}
            >
              Address
            </Text>
            <Text
              style={[
                styles.separatorCellDetail,
                { padding: "8px", textAlign: "center", width: "5%" },
              ]}
            >
              :
            </Text>
            <Text
              style={[
                styles.detailsCellDetail,
                { padding: "8px", width: "55%", textAlign: "left" },
              ]}
            >
              {formData?.AccountInformation?.businessAddress}
            </Text>
          </View>

          {/* phone number */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.particularsCellsDetail,
                { padding: "8px", width: "40%", textAlign: "left" },
              ]}
            >
              Phone Number
            </Text>
            <Text
              style={[
                styles.separatorCellDetail,
                { padding: "8px", textAlign: "center", width: "5%" },
              ]}
            >
              :
            </Text>
            <Text
              style={[
                styles.detailsCellDetail,
                { padding: "8px", width: "55%", textAlign: "left" },
              ]}
            >
              {formData?.AccountInformation?.businessContactNumber}
            </Text>
          </View>

          {/* email id  */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.particularsCellsDetail,
                { padding: "8px", width: "40%", textAlign: "left" },
              ]}
            >
              Email Id
            </Text>
            <Text
              style={[
                styles.separatorCellDetail,
                { padding: "8px", textAlign: "center", width: "5%" },
              ]}
            >
              :
            </Text>
            <Text
              style={[
                styles.detailsCellDetail,
                { padding: "8px", width: "55%", textAlign: "left" },
              ]}
            >
              {formData?.AccountInformation?.businessEmail}
            </Text>
          </View>

          {/* Aadhar number  */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.particularsCellsDetail,
                { padding: "8px", width: "40%", textAlign: "left" },
              ]}
            >
              Aadhar Number
            </Text>
            <Text
              style={[
                styles.separatorCellDetail,
                { padding: "8px", textAlign: "center", width: "5%" },
              ]}
            >
              :
            </Text>
            <Text
              style={[
                styles.detailsCellDetail,
                { padding: "8px", width: "55%", textAlign: "left" },
              ]}
            >
              {formData?.AccountInformation?.adhaarNumber}
            </Text>
          </View>

          {/* PAN  */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.particularsCellsDetail,
                { padding: "8px", width: "40%", textAlign: "left" },
              ]}
            >
              PAN
            </Text>
            <Text
              style={[
                styles.separatorCellDetail,
                { padding: "8px", textAlign: "center", width: "5%" },
              ]}
            >
              :
            </Text>
            <Text
              style={[
                styles.detailsCellDetail,
                { padding: "8px", width: "55%", textAlign: "left" },
              ]}
            >
              {formData?.AccountInformation?.PANNumber}
            </Text>
          </View>

          {/* Date of Birth  */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.particularsCellsDetail,
                {
                  padding: "8px",
                  width: "40%",
                  textAlign: "left",
                  borderBottomWidth: 0,
                },
              ]}
            >
              Date of Birth
            </Text>
            <Text
              style={[
                styles.separatorCellDetail,
                {
                  padding: "8px",
                  textAlign: "center",
                  width: "5%",
                  borderBottomWidth: 0,
                },
              ]}
            >
              :
            </Text>
            <Text
              style={[
                styles.detailsCellDetail,
                {
                  padding: "8px",
                  width: "55%",
                  textAlign: "left",
                  borderBottomWidth: 0,
                },
              ]}
            >
              {formData?.AccountInformation?.clientDob
                ? `${new Date(
                    formData?.AccountInformation?.clientDob
                  ).getDate()}-${(
                    new Date(
                      formData?.AccountInformation?.clientDob
                    ).getMonth() + 1
                  )
                    .toString()
                    .padStart(2, "0")}-${new Date(
                    formData?.AccountInformation?.clientDob
                  ).getFullYear()}`
                : "Not Available"}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
};

// ✅ Utility function to format numbers (if not defined elsewhere)
const formatNumber = (num) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export default PromoterDetails;
