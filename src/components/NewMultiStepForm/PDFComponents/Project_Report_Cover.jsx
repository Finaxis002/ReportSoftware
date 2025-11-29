import React from "react";
import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

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
    right: 60,
    width: "50%",
    textAlign: "right",
  },

  projectTitle: {
    fontSize: 40,
    marginBottom: 10,
    fontWeight: "light"
  },

  subTitle: {
    fontSize: 14,
    marginBottom: 20,
    color: '#043A5E',
  },
info:{
marginTop:20,
},
  label: {
    fontSize: 20,
    marginTop: 10,
    color: '#043A5E',
    fontWeight: "bold",
    textDecoration: "underline",
              
  },

  value: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop:10
  },

  logoContainer: {
    position: "absolute",
    bottom: 50,
    right: 50,
    textAlign: "right",
  },

  logo: {
    width: 120,
    height: "auto",
    marginBottom: 6,
  },

  email: {
    fontSize: 10,
  },
});


// -------------------- COMPONENT -------------------------
const ProjectCoverPage = ({ formData }) => {
  return (
    <Page size="A4" style={styles.page}>

      {/* Background Image */}
      <Image src={CoverBackground} style={styles.bgImage} fixed/>

      {/* Right-Side Text Content */}
      <View style={styles.container}>

        <Text style={styles.projectTitle}>PROJECT</Text>
        <Text style={styles.projectTitle}>REPORT</Text>

        {/* <Text style={styles.subTitle}>
          On {formData?.ProjectType || "Digital Marketing"}
        </Text> */}
<View style={styles.info}>
        <Text style={styles.label}>Business Name</Text>
        <Text style={styles.value}>
          {formData?.AccountInformation?.businessName || "ABC Pvt Ltd."}
        </Text>

        <Text style={styles.label}>Proprietor Name</Text>
        <Text style={styles.value}>
          {formData?.AccountInformation?.businessOwner || "Name ABC"}
        </Text>
        </View>
      </View>

      {/* Bottom Right - Finaxis Logo */}
      <View style={styles.logoContainer}>
        {/* <Image src={FinaxisLogo} style={styles.logo} /> */}
        <Text style={styles.email}> {formData?.AccountInformation?.businessEmail || "finaxis.ai@gmail.com"}</Text>
      </View>

    </Page>
  );
};

export default ProjectCoverPage;
