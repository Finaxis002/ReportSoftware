import React from "react";
import { saveAs } from "file-saver";

import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { PDFDownloadLink, PDFViewer, BlobProvider } from "@react-pdf/renderer";
import CMAMultiPagePDF from "./CMAData/CMAMultiPagePDF";
import CMAOperatingStatementPDF from "./CMAData/CMAOperatingStatementPDF";
import CMAAnalysisOfBS from "./CMAData/CMAAnalysisOfBS";

const CMADataPdfGeneration = () => {
  const formData = JSON.parse(localStorage.getItem("cmaAdvanceFormData")) || {};

  const [orientation, setOrientation] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("formData"));
    const years = formData?.ProjectReportSetting?.ProjectionYears || 5;
    return years > 6 ? "landscape" : "portrait";
  });

  const pdfContainerRef = useRef(null);
  const containerRef = useRef(null);

  // Hide any toolbar buttons (if toolbar is visible)
  useEffect(() => {
    // This will still work if you ever turn the toolbar on
    const style = document.createElement("style");
    style.innerHTML = `
      button[aria-label="Download"], 
      button[aria-label="Print"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Disable right click and print
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (containerRef.current && containerRef.current.contains(e.target)) {
        e.preventDefault();
        Swal.fire({
          icon: "error",
          title: "Right-click Disabled",
          text: "Right-click is disabled on this PDF for security reasons.",
          confirmButtonColor: "#6366f1",
          background: "#fff",
          timer: 1600,
          showConfirmButton: false,
        });
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        if (
          containerRef.current &&
          containerRef.current.contains(document.activeElement)
        ) {
          e.preventDefault();
          Swal.fire({
            icon: "error",
            title: "Printing Disabled",
            text: "Printing is disabled for this document.",
            confirmButtonColor: "#6366f1",
            background: "#fff",
            timer: 1600,
            showConfirmButton: false,
          });
        }
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Wait until the iframe loads, then attach contextmenu event
    const pollIframe = setInterval(() => {
      const container = containerRef.current;
      if (!container) return;
      const iframe = container.querySelector("iframe");
      if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
        iframe.contentWindow.document.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          // use window.parent to call Swal from parent scope
          window.parent.Swal.fire({
            icon: "error",
            title: "Right-click Disabled",
            text: "Right-click is disabled on this PDF for security reasons.",
            confirmButtonColor: "#6366f1",
            background: "#fff",
            timer: 1600,
            showConfirmButton: false,
          });
        });
        clearInterval(pollIframe);
      }
    }, 300);

    return () => clearInterval(pollIframe);
  }, []);

  useEffect(() => {
    // Poll for the iframe created by @react-pdf/renderer
    const pollIframe = setInterval(() => {
      const iframe = pdfContainerRef.current?.querySelector("iframe");
      if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
        // Prevent right-click inside PDF
        iframe.contentWindow.document.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          // Optional: show a message
          // alert("Right-click is disabled on this PDF.");
        });
        clearInterval(pollIframe);
      }
    }, 300);

    return () => clearInterval(pollIframe);
  }, []);

  

  return (
    <>
      {/* <div style={{ height: "100vh", width: "100%" }}>
        <PDFViewer
          width="100%"
          height="100%"
          style={{
            height: "100%",
            width: "100%",
            overflow: "auto",
          }}
          showToolbar={false}
        >
          <CMAMultiPagePDF formData={formData} />
        </PDFViewer>
      </div> */}
      {/* 
      ///////////////////////////////////////////////// */}

      {/* <div className="flex flex-col items-center justify-center min-h-screen generatedpdf">
      <BlobProvider document={<CMAMultiPagePDF formData={formData} orientation={orientation} />}>
        {({ url, loading }) => (
          <>
            
            {loading && (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v2.5A5.5 5.5 0 005.5 12H4z"
                  />
                </svg>
                <span className="ml-2 text-gray-500 font-medium">
                  Loading PDF...
                </span>
              </div>
            )}

            
            <div className="w-full bg-gradient-to-r from-blue-900 to-blue-950 p-2 shadow-md flex justify-between items-center">
              <div className="text-white font-normal text-sm px-4 tracking-wide">
                📄 PDF Report Viewer
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setOrientation("portrait")}
                  className={`text-sm px-2 py-1 rounded ${
                    orientation === "portrait"
                      ? "bg-white text-indigo-600"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation("landscape")}
                  className={`text-sm px-2 py-1 rounded ${
                    orientation === "landscape"
                      ? "bg-white text-indigo-600"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

           
            {!loading && url && (
              <iframe
                src={url}
                width="100%"
                height="900px"
                style={{ border: "none", marginTop: 8 }}
                title="CMA PDF"
                onContextMenu={e => {
                  e.preventDefault();
                  Swal.fire({
                    icon: "error",
                    title: "Right-click Disabled",
                    text: "Right-click is disabled on this PDF for security reasons.",
                    confirmButtonColor: "#6366f1",
                    background: "#fff",
                    timer: 1600,
                    showConfirmButton: false,
                  });
                }}
              />
            )}
          </>
        )}
      </BlobProvider>
    </div> */}

      {/* //////////////////////////////////////////////////// */}
      <div
        style={{ height: "100vh", width: "100%", background: "#F3F4F6" }}
        ref={containerRef}
      >
        <div className="w-full bg-gradient-to-r from-blue-900 to-blue-950 p-2 shadow-md flex justify-between items-center">
          <div className="text-white font-normal text-sm px-4 tracking-wide">
            📄 CMA PDF Report Viewer
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setOrientation("portrait")}
              className={`text-sm px-2 py-1 rounded ${
                orientation === "portrait"
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-600 text-white"
              }`}
            >
              Portrait
            </button>
            <button
              onClick={() => setOrientation("landscape")}
              className={`text-sm px-2 py-1 rounded ${
                orientation === "landscape"
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-600 text-white"
              }`}
            >
              Landscape
            </button>
          </div>
          <BlobProvider document={<CMAMultiPagePDF formData={formData} orientation={orientation} />}>
      {({ blob, url, loading }) => (
        <button
          onClick={() => {
            if (!blob) {
              Swal.fire({
                icon: "error",
                title: "PDF is not ready yet!",
                timer: 1300,
                showConfirmButton: false,
              });
              return;
            }
            const businessName = formData?.AccountInformation?.businessName || "Report";
            const businessOwner = formData?.AccountInformation?.businessOwner || "Owner";
            const safeName = `${businessName} (${businessOwner})`
              .replace(/[/\\?%*:|"<>]/g, "-")
              .trim();
            saveAs(blob, `${safeName}.pdf`);
          }}
          className="text-sm px-2 py-1 rounded bg-white text-indigo-600 ml-2 border border-indigo-600 hover:bg-indigo-100 transition"
          disabled={loading}
        >
          {loading ? "Preparing..." : "Download PDF"}
        </button>
      )}
    </BlobProvider>
          
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{ height: "calc(100vh - 44px)", width: "100%" }}
            // onContextMenu={(e) => {
            //   e.preventDefault();
            //   Swal.fire({
            //     icon: "error",
            //     title: "Right-click Disabled",
            //     text: "Right-click is disabled on this PDF for security reasons.",
            //     confirmButtonColor: "#6366f1",
            //     background: "#fff",
            //     timer: 1600,
            //     showConfirmButton: false,
            //   });
            // }}
          >
            <PDFViewer
              width="100%"
              height="100%"
              style={{
                height: "100%",
                width: "100%",
                border: "none",
                overflow: "auto",
                background: "#FFF",
              }}
              showToolbar={false}
              key={orientation}
            >
              <CMAMultiPagePDF formData={formData} orientation={orientation} />
            </PDFViewer>
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "98%",
              height: "100%",
              zIndex: 10,
              backgroundColor: "transparent",
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              Swal.fire({
                icon: "error",
                title: "Right-click Disabled",
                text: "Right-click is disabled on this PDF for security reasons.",
                confirmButtonColor: "#6366f1", // Indigo-500, optional
                background: "#fff", // optional, matches most UIs
                timer: 1600,
                showConfirmButton: false,
              });
            }}
            onWheel={(e) => {
              const pdfIframe = document.querySelector("iframe");
              if (pdfIframe) {
                pdfIframe.contentWindow.scrollBy(0, e.deltaY);
              }
            }}
          />
        </div>
      </div>
    </>
  );
};

export default CMADataPdfGeneration;
