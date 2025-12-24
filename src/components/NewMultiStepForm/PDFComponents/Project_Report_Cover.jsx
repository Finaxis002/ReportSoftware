import { Page, Text, View, Image, } from "@react-pdf/renderer";
import { capitalizeWords } from "../../../utils";
import { coverPageStyle } from "../Consultant/ConsultantPdfComponents/Styles";


// --------------- IMPORT BACKGROUND + LOGO ----------------
import CoverBackground from "../Assets/Project_Cover.png";


// -------------------- COMPONENT -------------------------
const ProjectCoverPage = ({ formData }) => {
  console.log("formData in ProjectCoverPage:", formData);
  const consultantData = JSON.parse(localStorage.getItem("consultantData") || "null");
  console.log("consultantData in ProjectCoverPage:", consultantData);
  return (
    <Page size="A4" style={[coverPageStyle.page]}>

      {/* Background Image */}
      <Image src={CoverBackground} style={coverPageStyle.bgImage} fixed />

      {/* Right-Side Text Content */}
      <View style={coverPageStyle.container}>

        <Text style={coverPageStyle.projectTitle}>PROJECT</Text>
        <Text style={coverPageStyle.projectTitle}>REPORT</Text>

        <View style={coverPageStyle.horizontalLine} />

        {/* <Text style={coverPageStyle.subTitle}>
          On {formData?.ProjectType || "Digital Marketing"}
        </Text> */}
        <View style={coverPageStyle.info}>
          <Text style={coverPageStyle.label}>Business Name</Text>
          <View style={coverPageStyle.horizontalLine2} />
          <Text style={coverPageStyle.value}>
            {capitalizeWords(formData?.AccountInformation?.businessName || "ABC Pvt Ltd.")}
          </Text>

          <Text style={coverPageStyle.label}>Proprietor Name</Text>
          <View style={(coverPageStyle.horizontalLine2)} />
          <Text style={coverPageStyle.value}>
            {capitalizeWords(formData?.AccountInformation?.businessOwner || "Name ABC")}
          </Text>
        </View>
      </View>

      {/* Bottom Right - Consultant Logo */}
      <View style={coverPageStyle.logoContainer}>
        {consultantData?.logo ? (
          <Image src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${consultantData.logo}`} style={coverPageStyle.logo} />
        ) : (
          null
        )}

        <View style={{ flexDirection: "column", alignItems: "flex-end"}}>
          <Text style={coverPageStyle.email}>{consultantData?.email}</Text>
          <Text style={coverPageStyle.email}>{consultantData?.mobile}</Text>
          <Text style={coverPageStyle.addressText}>{capitalizeWords(consultantData?.address)}</Text>
        </View>

      </View>

    </Page>
  );
};

export default ProjectCoverPage;
