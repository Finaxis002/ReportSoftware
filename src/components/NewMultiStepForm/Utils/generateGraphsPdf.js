import jsPDF from "jspdf";

export const generateGraphsPdf = async (imgs) => {
  const pdf = new jsPDF("p", "pt", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const maxImgW = pageW - 80; // left/right margin 40
  let y = 40;

  const add = (label, img) => {
    if (!img) return;
    pdf.setFontSize(14).text(label, 40, y);
    y += 14;
    pdf.addImage(img, "PNG", 40, y, maxImgW, 200);
    y += 210;

    if (y + 210 > pdf.internal.pageSize.getHeight()) {
      pdf.addPage();
      y = 40;
    }
  };

  add("Revenue vs Expense (Bar)", imgs.barChartBase64);
  add("Expense Composition (Pie)", imgs.pieChartBase64);
  add("DSCR Trend", imgs.dscrChartBase64);
  add("Current Ratio Trend", imgs.currentRatioBase64);

  // preview in new tab (change to `pdf.save(...)` to force download)
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url);
};
