import jsPDF from "jspdf";

const addFontToPdf = (pdf, selectedFont) => {
  console.log("Adding font to PDF:", selectedFont);
  // Register custom fonts if selectedFont is not the default one
  if (selectedFont && selectedFont !== "Arial") {
    pdf.addFont("path/to/font.ttf", selectedFont, "normal"); // Provide the correct font file path
  }
  pdf.setFont(selectedFont || "Arial"); // Fallback to Arial if no font is selected
};

export const generateGraphsPdf = async (imgs, selectedFont) => {
  const pdf = new jsPDF("p", "pt", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const maxImgW = pageW - 80; // left/right margin 40
  let y = 40;

   addFontToPdf(pdf, selectedFont);
  // Function to load image and get its dimensions
  const loadImage = async (imgData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = imgData;
    });
  };

  const add = async (label, img) => {
    if (!img) return;

    // Set the label and move down
    pdf.setFontSize(14).text(label, 40, y);
    y += 14;

    // Load the image and get its dimensions
    const loadedImage = await loadImage(img);
    const imgWidth = 340; // Use the maximum image width available
    const imgHeight = (loadedImage.height / loadedImage.width) * imgWidth; // Calculate height based on aspect ratio
const x = (pageW - imgWidth) / 2;
    // Add the image to the PDF with the calculated dimensions
    pdf.addImage(img, "PNG", x, y, imgWidth, imgHeight);
    y += imgHeight + 20; // Move the y position down by the height of the image

    // If the current position exceeds the page height, add a new page
    if (y + imgHeight > pdf.internal.pageSize.getHeight()) {
      pdf.addPage();
      y = 40;
    }
  };

  // Add charts to PDF
  await add("Revenue vs Expense (Bar)", imgs.barChartBase64);
  await add("Expense Composition (Pie)", imgs.pieChartBase64);
  await add("DSCR Trend", imgs.dscrChartBase64);
  await add("Current Ratio Trend", imgs.currentRatioBase64);

 
  // Preview in new tab (change to `pdf.save(...)` to force download)
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url);
};
