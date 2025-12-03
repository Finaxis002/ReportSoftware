// newgenerate3DPieChart.js
export const generate3DPieChart = async (pieData, selectedColor, selectedFont) => {
  return new Promise((resolve) => {
    // Create mount point
    const mountPoint = document.createElement("div");
    mountPoint.style.position = 'absolute';
    mountPoint.style.left = '-9999px';
    document.body.appendChild(mountPoint);

    import("react-dom/client").then(({ createRoot }) => {
      // Dynamically import the 3D chart component
      import("./ThreeJSPieChartPDF").then(({ default: ThreeJSPieChartPDF }) => {
        const root = createRoot(mountPoint);
        
        // Extract labels and values
        const pieLabels = pieData.map(x => x.name);
        const pieValues = pieData.map(x => Number(x.value));
        
        root.render(
          <ThreeJSPieChartPDF
            labels={pieLabels}
            values={pieValues}
            selectedColor={selectedColor}
            selectedFont={selectedFont}
            onBase64Generated={(base64) => {
              // Cleanup
              setTimeout(() => {
                root.unmount();
                if (mountPoint.parentNode) {
                  document.body.removeChild(mountPoint);
                }
                resolve(base64);
              }, 100);
            }}
          />
        );
      });
    });
  });
};