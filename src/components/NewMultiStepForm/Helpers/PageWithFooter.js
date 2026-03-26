// components/PageWithFooter.js
import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';

const pageStyles = {
  page: {
    padding: 40,
    paddingTop: 50,
    paddingBottom: 60,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: "Helvetica",
    position: "relative",
    minHeight: "100%",
  },
  content: {
    flex: 1,
    minHeight: '85%',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  pageNumber: {
    fontSize: 10,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingRight: 5,
    paddingVertical: 4,
    borderRadius: 12,
    border: '1px solid #e0e0e0',
    textAlign: 'center',
    minWidth: 40,
    fontFamily: 'Helvetica-Bold',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
};

const PageWithFooter = ({ 
  children, 
  size = "A4", 
  orientation = "portrait", 
  style = {},
  watermark = null 
}) => {
  return (
    <Page 
      size={size} 
      orientation={orientation} 
      style={[pageStyles.page, style]}
    >
      {watermark}
      <View style={pageStyles.content}>
        {children}
      </View>
      
      {/* <View style={pageStyles.footer} fixed>
        <Text 
          render={({ pageNumber, totalPages }) => (
            <Text style={pageStyles.pageNumber}>
              {pageNumber} / {totalPages}
            </Text>
          )} 
        />
      </View> */}
    </Page>
  );
};

export default PageWithFooter;