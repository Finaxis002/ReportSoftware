import React from "react";
import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { capitalizeWords } from "../../../utils";
import MailIcon from "../Assets/mailIcon.png";


// --------------- IMPORT BACKGROUND + LOGO ----------------
import CoverBackground from "../Assets/Project_Cover.png";
// import FinaxisLogo from "../assets/finaxis_logo.png";

// -------------------- STYLES ----------------------------
const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    position: "relative",
  },

  bgImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },

  container: {
    position: "absolute",
    top: 80,
    right: 20,
    width: "50%",
    textAlign: "right",
  },

  projectTitle: {
    fontSize: 45,
    marginBottom: 10,
    fontWeight: "light"
  },

  subTitle: {
    fontSize: 14,
    marginBottom: 20,
    color: '#043A5E',
  },
  info: {
    marginTop: 20,
  },
  label: {
    fontSize: 20,
    marginVertical: 10,
    color: '#043A5E',
    fontWeight: "bold",

  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10
  },

  logoContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "right",
  },

  logo: {
    width: 200,
    height: "auto",
  },

  email: {
    fontSize: 12,
    color: "#043A5E",
    marginTop: 2,
    letterSpacing: 1.5,
    fontWeight: "bold",
  },
  horizontalLine: {
    borderBottomColor: '#043A5E',
    borderBottomWidth: 3,
    width: "35%",
    marginLeft: "auto",
    marginBottom: 80,

  },

  horizontalLine2: {
    borderBottomColor: '#000000',
    borderBottomWidth: 1.5,
    width: "15%",
    marginLeft: "auto",
    marginTop: -5,
  }

});


// -------------------- COMPONENT -------------------------
const ProjectCoverPage = ({ formData }) => {
  console.log("formData in ProjectCoverPage:", formData);
  const consultantData = JSON.parse(localStorage.getItem("consultantData") || "null");
  console.log("consultantData in ProjectCoverPage:", consultantData);
  return (
    <Page size="A4" style={styles.page}>

      {/* Background Image */}
      <Image src={CoverBackground} style={styles.bgImage} fixed />

      {/* Right-Side Text Content */}
      <View style={styles.container}>

        <Text style={styles.projectTitle}>PROJECT</Text>
        <Text style={styles.projectTitle}>REPORT</Text>

        <View style={styles.horizontalLine} />

        {/* <Text style={styles.subTitle}>
          On {formData?.ProjectType || "Digital Marketing"}
        </Text> */}
        <View style={styles.info}>
          <Text style={styles.label}>Business Name</Text>
          <View style={styles.horizontalLine2} />
          <Text style={styles.value}>
            {capitalizeWords(formData?.AccountInformation?.businessName || "ABC Pvt Ltd.")}
          </Text>

          <Text style={styles.label}>Proprietor Name</Text>
          <View style={(styles.horizontalLine2)} />
          <Text style={styles.value}>
            {capitalizeWords(formData?.AccountInformation?.businessOwner || "Name ABC")}
          </Text>
        </View>
      </View>

      {/* Bottom Right - Consultant Logo */}
      <View style={styles.logoContainer}>
        {consultantData?.logo ? (
          <Image src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${consultantData.logo}`} style={styles.logo} />
        ) : (
          null
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={styles.email}>{consultantData?.email}</Text>
        </View>

      </View>

    </Page>
  );
};

export default ProjectCoverPage;
