// // ThreeJSPieChartPDF.jsx — FINAL FIXED VERSION
// import React, { useEffect, useRef } from "react";
// import * as THREE from "three";

import { version } from "process";

// export default function ThreeJSPieChartPDF({ labels = [], values = [], onBase64Generated }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const size = 500;

//     // Renderer
//     const renderer = new THREE.WebGLRenderer({
//       antialias: true,
//       alpha: true,
//       canvas: canvasRef.current,
//     });
//     renderer.setSize(size, size);
//     renderer.setPixelRatio(2);

//     const scene = new THREE.Scene();

//     // FIX 1: Use Perspective camera instead of Orthographic
//     const camera = new THREE.PerspectiveCamera(
//       45,
//       1,
//       0.1,
//       2000
//     );
//     camera.position.set(0, 300, 600); // FIX 2: Move camera back
//     camera.lookAt(0, 0, 0);

//     // FIX 3: Add light (orthographic lacked depth)
//     const light = new THREE.DirectionalLight(0xffffff, 1.2);
//     light.position.set(0, 1, 1);
//     scene.add(light);

//     const googleColors = [
//       "#67c2ea", "#4a84da", "#6b6de6", "#525db4",
//       "#9a53eb", "#c161bd", "#d55cae", "#de4c88", "#c44758",
//     ];

//     // Data
//     const list = values.map((v, i) => ({
//       label: labels[i] ?? "",
//       value: Number(v),
//     })).filter(x => x.value > 0);

//     const total = list.reduce((a, b) => a + b.value, 0);
//     if (!total) {
//       onBase64Generated(canvasRef.current.toDataURL("image/png"));
//       return;
//     }

//     const radius = 180;
//     let start = 0;

//     list.forEach((item, index) => {
//       const angle = (item.value / total) * Math.PI * 2;

//       const shape = new THREE.Shape();
//       shape.moveTo(0, 0);
//       shape.absarc(0, 0, radius, start, start + angle, false);

//       // FIX 4: Increase depth so chart is visible
//       const geometry = new THREE.ExtrudeGeometry(shape, {
//         depth: 40,
//         bevelEnabled: false,
//         curveSegments: 100,
//       });

//       const material = new THREE.MeshPhongMaterial({
//         color: googleColors[index % googleColors.length],
//         shininess: 50,
//       });

//       const mesh = new THREE.Mesh(geometry, material);

//       // FIX 5: Correct rotation (no flipping)
//       mesh.rotation.x = -Math.PI / 2;

//       mesh.position.y = -20; // center vertically
//       scene.add(mesh);

//       start += angle;
//     });

//     // Render
//     renderer.render(scene, camera);

//     const base64 = canvasRef.current.toDataURL("image/png", 1.0);
//     onBase64Generated && onBase64Generated(base64);
//   }, [labels, values, onBase64Generated]);

//   return (
//     <div style={{ display: "none" }}>
//       <canvas ref={canvasRef} width={500} height={500} />
//     </div>
//   );
// }


//version 2=========================================================================================================



// ThreeJSPieChartPDF.jsx — FINAL FIXED VERSION
// import React, { useEffect, useRef } from "react";
// import * as THREE from "three";

// // ✅ Function to generate color variations based on a base color
// const generateColorVariations = (baseColor) => {
//   const colors = [];

//   // Parse the base color
//   let r, g, b, a = 1;

//   if (baseColor.startsWith('rgb')) {
//     const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
//     if (match) {
//       r = parseInt(match[1]);
//       g = parseInt(match[2]);
//       b = parseInt(match[3]);
//       a = match[4] ? parseFloat(match[4]) : 1;
//     }
//   } else if (baseColor.startsWith('#')) {
//     const hex = baseColor.replace('#', '');
//     if (hex.length === 3) {
//       r = parseInt(hex[0] + hex[0], 16);
//       g = parseInt(hex[1] + hex[1], 16);
//       b = parseInt(hex[2] + hex[2], 16);
//     } else if (hex.length === 6) {
//       r = parseInt(hex.substring(0, 2), 16);
//       g = parseInt(hex.substring(2, 4), 16);
//       b = parseInt(hex.substring(4, 6), 16);
//     }
//   }

//   // Generate variations by adjusting brightness and saturation
//   for (let i = 0; i < 9; i++) {
//     const factor = 0.7 + (i * 0.05); // Vary brightness
//     const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
//     const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
//     const newB = Math.min(255, Math.max(0, Math.round(b * factor)));

//     colors.push(`rgb(${newR}, ${newG}, ${newB})`);
//   }

//   return colors;
// };

// // ✅ Color mapping for common color names
// const colorNameToRGB = {
//   'green': 'rgb(46, 125, 50)',
//   'blue': 'rgb(33, 150, 243)',
//   'red': 'rgb(244, 67, 54)',
//   'purple': 'rgb(156, 39, 176)',
//   'orange': 'rgb(255, 152, 0)',
//   'yellow': 'rgb(255, 235, 59)',
//   'teal': 'rgb(0, 150, 136)',
//   'pink': 'rgb(233, 30, 99)',
//   'indigo': 'rgb(63, 81, 181)',
//   'cyan': 'rgb(0, 188, 212)',
//   'lime': 'rgb(205, 220, 57)',
//   'amber': 'rgb(255, 193, 7)',
//   'brown': 'rgb(121, 85, 72)',
//   'grey': 'rgb(158, 158, 158)',
//   'bluegrey': 'rgb(96, 125, 139)',
// };

// // ✅ Default blue color palette
// const defaultColors = [
//   "#67c2ea", "#4a84da", "#6b6de6", "#525db4",
//   "#9a53eb", "#c161bd", "#d55cae", "#de4c88", "#c44758",
// ];

// export default function ThreeJSPieChartPDF({ labels = [], values = [], onBase64Generated, selectedColor = null, selectedFont = 'Arial' }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const size = 500;

//     // Renderer
//     const renderer = new THREE.WebGLRenderer({
//       antialias: true,
//       alpha: true,
//       canvas: canvasRef.current,
//     });
//     renderer.setSize(size, size);
//     renderer.setPixelRatio(2);

//     const scene = new THREE.Scene();

//     // FIX 1: Use Perspective camera instead of Orthographic
//     const camera = new THREE.PerspectiveCamera(
//       45,
//       1,
//       0.1,
//       2000
//     );
//     camera.position.set(0, 300, 600); // FIX 2: Move camera back
//     camera.lookAt(0, 0, 0);

//     // FIX 3: Add light (orthographic lacked depth)
//     const light = new THREE.DirectionalLight(0xffffff, 1.2);
//     light.position.set(0, 1, 1);
//     scene.add(light);

//     const googleColors = [
//       "#67c2ea", "#4a84da", "#6b6de6", "#525db4",
//       "#9a53eb", "#c161bd", "#d55cae", "#de4c88", "#c44758",
//     ];

//     // Determine colors based on selectedColor
//     let colors = googleColors;
//     if (selectedColor && selectedColor.trim() !== '') {
//       let colorValue = selectedColor.trim().toLowerCase();
//       if (colorNameToRGB[colorValue]) {
//         colorValue = colorNameToRGB[colorValue];
//       }
//       const variations = generateColorVariations(colorValue);
//       if (variations.length > 0) {
//         colors = variations;
//       }
//     }

//     // Data
//     const list = values.map((v, i) => ({
//       label: labels[i] ?? "",
//       value: Number(v),
//     })).filter(x => x.value > 0);

//     const total = list.reduce((a, b) => a + b.value, 0);
//     if (!total) {
//       onBase64Generated(canvasRef.current.toDataURL("image/png"));
//       return;
//     }

//     const radius = 180;
//     let start = 0;

//     list.forEach((item, index) => {
//       const angle = (item.value / total) * Math.PI * 2;

//       const shape = new THREE.Shape();
//       shape.moveTo(0, 0);
//       shape.lineTo(radius * Math.cos(start), radius * Math.sin(start));
//       shape.absarc(0, 0, radius, start, start + angle, false);
//       shape.lineTo(0, 0);

//       // FIX 4: Increase depth so chart is visible
//       const geometry = new THREE.ExtrudeGeometry(shape, {
//         depth: 40,
//         bevelEnabled: false,
//         curveSegments: 100,
//       });

//       const material = new THREE.MeshPhongMaterial({
//         color: colors[index % colors.length],
//         shininess: 50,
//       });

//       const mesh = new THREE.Mesh(geometry, material);

//       // FIX 5: Correct rotation (no flipping)
//       mesh.rotation.x = -Math.PI / 2;

//       mesh.position.y = -20; // center vertically
//       scene.add(mesh);

//       start += angle;
//     });

//     // Render
//     renderer.render(scene, camera);

//     const base64 = canvasRef.current.toDataURL("image/png", 1.0);
//     onBase64Generated && onBase64Generated(base64);
//   }, [labels, values, onBase64Generated, selectedColor]);

//   return (
//     <div style={{ display: "none" }}>
//       <canvas ref={canvasRef} width={500} height={500} />
//     </div>
//   );
// }



// version 3=========================================================================================================


import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// ✅ Fixed: Generate LIGHTER color variations
const generateColorVariations = (baseColor) => {
  const colors = [];

  // Parse the base color
  let r, g, b;

  if (baseColor.startsWith('rgb')) {
    const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  } else if (baseColor.startsWith('#')) {
    const hex = baseColor.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }

  // FIXED: Generate LIGHTER variations
  for (let i = 0; i < 9; i++) {
    // Start from 1.0 (original) and go up to 1.6 for lighter colors
    const brightnessFactor = 1.0 + (i * 0.15);
    
    // Apply brightness factor but keep it within bounds
    const newR = Math.min(255, Math.round(r * brightnessFactor));
    const newG = Math.min(255, Math.round(g * brightnessFactor));
    const newB = Math.min(255, Math.round(b * brightnessFactor));
    
    // Also increase saturation slightly for more vibrant colors
    const hsl = rgbToHsl(newR, newG, newB);
    hsl[1] = Math.min(100, hsl[1] * 1.2); // Increase saturation
    const finalRgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    
    colors.push(`rgb(${finalRgb[0]}, ${finalRgb[1]}, ${finalRgb[2]})`);
  }

  return colors;
};

// Helper function to convert RGB to HSL
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

// Helper function to convert HSL to RGB
const hslToRgb = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// ✅ Updated: Lighter base colors for better visibility
const colorNameToRGB = {
  'green': 'rgb(102, 187, 106)',    // Lighter green
  'blue': 'rgb(66, 165, 245)',      // Lighter blue
  'red': 'rgb(239, 83, 80)',        // Lighter red
  'purple': 'rgb(171, 71, 188)',    // Lighter purple
  'orange': 'rgb(255, 167, 38)',    // Lighter orange
  'yellow': 'rgb(255, 238, 88)',    // Lighter yellow
  'teal': 'rgb(38, 166, 154)',      // Lighter teal
  'pink': 'rgb(236, 64, 122)',      // Lighter pink
  'indigo': 'rgb(92, 107, 192)',    // Lighter indigo
  'cyan': 'rgb(38, 198, 218)',      // Lighter cyan
  'lime': 'rgb(220, 231, 117)',     // Lighter lime
  'amber': 'rgb(255, 202, 40)',     // Lighter amber
  'brown': 'rgb(141, 110, 99)',     // Lighter brown
  'grey': 'rgb(189, 189, 189)',     // Lighter grey
  'bluegrey': 'rgb(120, 144, 156)', // Lighter bluegrey
};

// ✅ Updated: Lighter default colors
const defaultColors = [
  "#8ED6FF", "#6D9EFF", "#8A89FF", "#7B7CD8",
  "#B07CFF", "#D68FD6", "#E58FCF", "#E87CA4", "#D67C87",
];

export default function ThreeJSPieChartPDF({ labels = [], values = [], onBase64Generated, selectedColor = null, selectedFont = 'Arial' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const size = 500;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: canvasRef.current,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(2);

    const scene = new THREE.Scene();

    // Add ambient light for overall brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(0, 300, 600);
    camera.lookAt(0, 0, 0);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Determine colors based on selectedColor
    let colors = defaultColors; // Use the new lighter default colors
    if (selectedColor && selectedColor.trim() !== '') {
      let colorValue = selectedColor.trim().toLowerCase();
      if (colorNameToRGB[colorValue]) {
        colorValue = colorNameToRGB[colorValue];
      }
      const variations = generateColorVariations(colorValue);
      if (variations.length > 0) {
        colors = variations;
      }
    }

    // Data
    const list = values.map((v, i) => ({
      label: labels[i] ?? "",
      value: Number(v),
    })).filter(x => x.value > 0);

    const total = list.reduce((a, b) => a + b.value, 0);
    if (!total) {
      onBase64Generated(canvasRef.current.toDataURL("image/png"));
      return;
    }

    const radius = 180;
    let start = 0;

    list.forEach((item, index) => {
      const angle = (item.value / total) * Math.PI * 2;

      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(radius * Math.cos(start), radius * Math.sin(start));
      shape.absarc(0, 0, radius, start, start + angle, false);
      shape.lineTo(0, 0);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 40,
        bevelEnabled: false,
        curveSegments: 100,
      });

      // Use Lambert material for softer, more diffused lighting
      const material = new THREE.MeshLambertMaterial({
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = -20;
      scene.add(mesh);

      start += angle;
    });

    // Render
    renderer.render(scene, camera);

    const base64 = canvasRef.current.toDataURL("image/png", 1.0);
    onBase64Generated && onBase64Generated(base64);
  }, [labels, values, onBase64Generated, selectedColor]);

  return (
    <div style={{ display: "none" }}>
      <canvas ref={canvasRef} width={500} height={500} />
    </div>
  );
}