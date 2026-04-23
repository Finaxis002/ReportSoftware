import { Page, View, Text, Image} from "@react-pdf/renderer";
import { styles, stylesCOP,styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";
import {
  getPromoterAadhaarLabel,
  getPromoterCount,
  getPromoterDinLabel,
  getPromoterNameLabel,
  getPromoterNameOfLabel,
  getPromoterNames,
  getPromoterRoleLabel,
} from "../Utils/promoterLabels";

const PromoterDetails = ({ formData, pdfType }) => {

  // ✅ Determine pronouns based on gender

  const accountInformation = formData?.AccountInformation || {};
  const promoterNames = getPromoterNames(accountInformation);
  const promoterNameLabel = getPromoterNameLabel(
    accountInformation.registrationType,
    getPromoterCount(accountInformation)
  );
  const additionalPromoterCount = accountInformation.allPartners?.length || 1;

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
              {promoterNames || promoterNameLabel} aged{" "}
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
             
              {promoterNames || "Client Name"} is a
              resident of{" "}
              {formData?.AccountInformation?.location ||
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
              {promoterNameLabel}
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
              {promoterNames}
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

        {/* partner details */}
        
        {formData?.AccountInformation?.allPartners?.length >= 1 && (
          <View>
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
          marginBottom: "4px"
        }}>
        {`Additional Details of ${getPromoterRoleLabel(
          accountInformation.registrationType,
          additionalPromoterCount
        )}`}
        </Text>
         </View>
          <View>
            {/* Header */}
            <View style={[styles.tableHeader]}>
              <Text
                style={[styles.serialNoCell, { padding: "8px", width: "10%" }]}
              >
                S. No.
              </Text>
              <Text
                style={[
                  styles.particularsCell,
                  styleExpenses.fontBold,
                  { padding: "8px", width: "45%" },
                ]}
              >
                {getPromoterNameOfLabel(
                  accountInformation.registrationType,
                  additionalPromoterCount
                )}
              </Text>
              <Text
                style={[
                  styles.separatorCell,
                  styleExpenses.fontBold,
                  { textAlign: "center", width: "5%" },
                ]}
              >
                :
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.fontBold,
                  { padding: "8px", width: "27.5%", textAlign: "center" },
                ]}
              >
                {getPromoterAadhaarLabel(
                  accountInformation.registrationType,
                  additionalPromoterCount,
                  "Aadhar No."
                )}
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.fontBold,
                  { padding: "8px", width: "27.5%", textAlign: "center" },
                ]}
              >
                {getPromoterDinLabel(
                  accountInformation.registrationType,
                  additionalPromoterCount
                )}
              </Text>
            </View>

            {/* Body */}
            {formData?.AccountInformation?.allPartners?.map(
              (partner, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.serialNoCellDetail,
                      { padding: "8px", width: "10%",borderLeftWidth: "1px" },
                    ]}
                  >
                    {index + 1}
                  </Text>

                  <Text
                    style={[
                      styles.particularsCellsDetail,
                      { padding: "8px", width: "45%", textAlign: "left" },
                    ]}
                  >
                    {partner.partnerName || "-"}
                  </Text>

                  <Text
                    style={[
                      styles.separatorCellDetail,
                      {
                        padding: "8px",
                        textAlign: "center",
                        width: "5%",
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
                        width: "27.5%",
                        textAlign: "center",
                      },
                    ]}
                  >
                    {partner.partnerAadhar || "-"}
                  </Text>

                  <Text
                    style={[
                      styles.detailsCellDetail,
                      {
                        padding: "8px",
                        width: "27.5%",
                        textAlign: "center",
                        borderLeftWidth: "1px",
                        borderRightWidth: "1px",
                      },
                    ]}
                  >
                    {partner.partnerDin || "-"}
                  </Text>
                </View>
              )
            )}
          </View>
          </View>
        )}
      </View>
    </Page>
  );
};


export default PromoterDetails;
