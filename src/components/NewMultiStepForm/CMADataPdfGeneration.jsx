import { saveAs } from "file-saver";
import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { PDFDownloadLink, PDFViewer, BlobProvider } from "@react-pdf/renderer";
import CMAMultiPagePDF from "./CMAData/CMAMultiPagePDF";
import ConsultantCMAMultipagePDF from "./CMAData/ConsultantCMA/ConsultantCMAMultipagePDF";
import axios from "axios";

const CMADataPdfGeneration = () => {
  const formDataFromLocalStorage =
    JSON.parse(localStorage.getItem("cmaAdvanceFormData")) || {};
  const [formData, setFormData] = useState(formDataFromLocalStorage);
  const source = localStorage.getItem("cmaSource") || "final-step";
  console.log("formDataFromLocalStorage :", formDataFromLocalStorage);

  const selectedVersion = localStorage.getItem("selectedConsultantReportVersion") || "Version 1";
  const versionNum = parseInt(selectedVersion.replace("Version ", "")) || 1;

  const PDFComponent = source === "consultant" ? ConsultantCMAMultipagePDF : CMAMultiPagePDF;

  const [orientation, setOrientation] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("formData"));
    const years = formData?.ProjectReportSetting?.ProjectionYears || 5;
    return years > 6 ? "landscape" : "portrait";
  });

  const businessName =
    formDataFromLocalStorage?.AccountInformation?.businessName;
  const businessOwner =
    formDataFromLocalStorage?.AccountInformation?.businessOwner;

  console.log("Business NAme :", businessName);
  console.log("Client Name :", businessOwner);

  const pdfContainerRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch formData from backend API on component mount
  useEffect(() => {
    const fetchFormData = async () => {
      // Ensure that both businessName and businessOwner are available
      const businessName =
        formDataFromLocalStorage?.AccountInformation?.businessName;
      const businessOwner =
        formDataFromLocalStorage?.AccountInformation?.businessOwner;

      if (!businessName || !businessOwner) {
        // If either value is missing, stop fetching data and show an error
        Swal.fire({
          icon: "error",
          title: "Missing Information",
          text: "Business Name or Client Name is missing.",
          confirmButtonColor: "#6366f1",
        });
        return;
      }

      try {
        // Make the API call to fetch form data
        const response = await axios.get(
          `https://reportsbe.sharda.co.in/fetch-business-data?businessName=${encodeURIComponent(
            businessName
          )}&businessOwner=${encodeURIComponent(businessOwner)}`
        );

        // Check if the API returns data
        if (response.status === 200 && response.data?.data?.length > 0) {
          setFormData(response.data.data[0]); // Set fetched data to formData state
        } else {
          Swal.fire({
            icon: "error",
            title: "No Data Found",
            text: "No matching data was found.",
            confirmButtonColor: "#6366f1",
          });
        }
      } catch (error) {
        // Show error if API call fails
        Swal.fire({
          icon: "error",
          title: "Error Fetching Data",
          text: "Unable to fetch form data from the server.",
          confirmButtonColor: "#6366f1",
        });
      }
    };

    if (!formData) {
      fetchFormData();
    }
  }, [formData]);

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

  const [isLoading, setIsLoading] = useState(true);

  // Handle the state of the PDF generation
  const handleBlobLoading = (loading) => {
    setIsLoading(loading);
  };

   const pdfViewerRef = useRef(null);
  
   useEffect(() => {
      // Poll for the iframe created by @react-pdf/renderer to disable right-click
      const pollIframe = setInterval(() => {
        const iframe = pdfViewerRef.current?.querySelector("iframe");
        if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
          // Disable right-click by adding contextmenu event listener to iframe document
          iframe.contentWindow.document.addEventListener("contextmenu", (e) => {
            e.preventDefault(); // Prevent the default context menu
            alert("Right-click is disabled on this PDF."); // Optional alert
          });
          clearInterval(pollIframe);
        }
      }, 300); // Poll every 300ms
  
      // Cleanup
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
        {/* <div className="w-full bg-gradient-to-r from-blue-900 to-blue-950 p-2 shadow-md flex justify-between items-center">
          <div className="text-white font-normal text-sm px-4 tracking-wide">
            📄 CMA PDF Report Viewer
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setIsLoading(true);
                setOrientation("portrait");
              }}
              className={`text-sm px-2 py-1 rounded ${
                orientation === "portrait"
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-600 text-white"
              }`}
            >
              Portrait
            </button>
            <button
              onClick={() => {
                setIsLoading(true);
                setOrientation("landscape");
              }}
              className={`text-sm px-2 py-1 rounded ${
                orientation === "landscape"
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-600 text-white"
              }`}
            >
              Landscape
            </button>
            <button
              onClick={() => setOrientation("advanced-landscape")}
              className={`text-sm px-2 py-1 rounded ${
                orientation === "advanced-landscape"
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-600 text-white"
              }`}
            >
              Advanced Landscape
            </button>
          </div>
          <BlobProvider
            document={
              <CMAMultiPagePDF formData={formData} orientation={orientation} />
            }
          >
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
                  const businessName =
                    formData?.AccountInformation?.businessName || "Report";
                  const businessOwner =
                    formData?.AccountInformation?.businessOwner || "Owner";
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
        </div> */}

        <div className="w-full bg-[#161616] p-3 py-1 shadow-lg flex flex-wrap justify-between items-center gap-3">
          <div className="text-white font-medium text-sm px-3 py-2 tracking-wide flex items-center bg-white/10 backdrop-blur-sm rounded-lg shadow-md">
            <i className="fas fa-file-pdf mr-2 text-red-400"></i>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300">
              CMA PDF Report Viewer
            </span>
          </div>

          <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 shadow-md">
            <button
              onClick={() => {
                setIsLoading(true);
                setOrientation("portrait");
              }}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-200 ease-out hover:scale-105 hover:shadow-button portrait-btn ${
                orientation === "portrait"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-600"
              }`}
            >
              <i className="fas fa-portrait text-sm"></i>
              <span>Portrait</span>
            </button>
            <button
              onClick={() => {
                setIsLoading(true);
                setOrientation("landscape");
              }}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-200 ease-out hover:scale-105 hover:shadow-button landscape-btn ${
                orientation === "landscape"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-600"
              }`}
            >
              <i className="fas fa-landscape text-sm"></i>
              <span>Landscape</span>
            </button>
            <button
              onClick={() => setOrientation("advanced-landscape")}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-200 ease-out hover:scale-105 hover:shadow-button advanced-landscape-btn ${
                orientation === "advanced-landscape"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-600"
              }`}
            >
              <i className="fas fa-expand-alt text-sm"></i>
              <span>Advanced-Landscape</span>
            </button>
          </div>

          <div className="flex gap-2">
            <BlobProvider
              document={
                <PDFComponent
                  formData={formData}
                  orientation={orientation}
                  versionNum={versionNum}
                />
              }
            >
              {({ blob, url, loading }) => (
                <>
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
                      const businessName =
                        formData?.AccountInformation?.businessName || "Report";
                      const businessOwner =
                        formData?.AccountInformation?.businessOwner || "Owner";
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
                </>
              )}
            </BlobProvider>
          </div>
        </div>
        {/* Show loading spinner when the PDF is being generated */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
              viewBox="0 0 24 24"
              fill="none"
            >
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
              Preparing PDF...
            </span>
          </div>
        )}
        <div
          style={{
            position: "relative",
            width: "100%",
          }}
        >
          <div style={{ height: "calc(100vh - 44px)", width: "100%" }}>
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
              <PDFComponent
                formData={formData}
                orientation={orientation}
                source={source}
                versionNum={versionNum}
                onLoadingComplete={() => handleBlobLoading(false)}
              />
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
