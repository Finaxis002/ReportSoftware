import { Font } from "@react-pdf/renderer";

export const checkAndRegisterFont = async (
  fontName,
  regularFontFile,
  boldFontFile
) => {
  try {
    const reader = (file) =>
      new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });

    const regularFontData = await reader(regularFontFile);
    const boldFontData = await reader(boldFontFile);

    console.log("📄 Regular Font base64 (short):", regularFontData.slice(0, 50));
    console.log("📄 Bold Font base64 (short):", boldFontData.slice(0, 50));

    const registeredFonts = Font.getRegisteredFonts?.();
    const fontAlreadyRegistered =
      Array.isArray(registeredFonts) &&
      registeredFonts.some((f) => f?.family === fontName);

    if (fontAlreadyRegistered) {
      console.log(`ℹ️ Font '${fontName}' is already registered.`);
      return;
    }

    Font.register({
      family: fontName,
      fonts: [
        { src: regularFontData, fontWeight: "normal" },
        { src: boldFontData, fontWeight: "bold" },
      ],
    });

    console.log("✅ Font registered:", fontName);
  } catch (err) {
    console.error("❌ Error in checkAndRegisterFont:", err);
    throw err;
  }
};
