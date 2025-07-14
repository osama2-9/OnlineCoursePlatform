import PDFDocument from "pdfkit";

async function generateCertificate({
  verificationCode,
  learnerName,
  email,
  courseName,
  completionDate = new Date(),
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 50,
      });

      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks);

        const sanitizedName = learnerName;
        const sanitizedCourse = courseName;
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${sanitizedName}_${sanitizedCourse}_${timestamp}.pdf`;

        resolve({ buffer, filename });
      });

      doc.on("error", (error) => {
        console.error("Error generating certificate:", error);
        reject(error);
      });

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      doc
        .rect(30, 30, pageWidth - 60, pageHeight - 60)
        .stroke("#2c3e50")
        .lineWidth(3);

      doc
        .rect(40, 40, pageWidth - 80, pageHeight - 80)
        .stroke("#3498db")
        .lineWidth(1);

      doc
        .fontSize(24)
        .fillColor("#2c3e50")
        .font("Helvetica-Bold")
        .text("UPLEARN", 0, 80, { align: "center" });

      doc
        .fontSize(36)
        .fillColor("#e74c3c")
        .font("Helvetica-Bold")
        .text("CERTIFICATE OF COMPLETION", 0, 130, { align: "center" });

      doc
        .moveTo(200, 180)
        .lineTo(pageWidth - 200, 180)
        .stroke("#3498db")
        .lineWidth(2);

      doc
        .fontSize(16)
        .fillColor("#2c3e50")
        .font("Helvetica")
        .text("This is to certify that", 0, 220, { align: "center" });

      doc
        .fontSize(28)
        .fillColor("#2c3e50")
        .font("Helvetica-Bold")
        .text(learnerName, 0, 260, { align: "center" });

      doc
        .fontSize(16)
        .fillColor("#2c3e50")
        .font("Helvetica")
        .text("has successfully completed the course", 0, 310, {
          align: "center",
        });

      doc
        .fontSize(24)
        .fillColor("#e74c3c")
        .font("Helvetica-Bold")
        .text(courseName, 0, 350, { align: "center" });

      const formattedDate = completionDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc
        .fontSize(14)
        .fillColor("#2c3e50")
        .font("Helvetica")
        .text(`Completed on: ${formattedDate}`, 0, 400, { align: "center" });

      const footerY = pageHeight - 120;

      doc
        .fontSize(12)
        .fillColor("#7f8c8d")
        .font("Helvetica")
        .text(`Email: ${email}`, 60, footerY);

      doc
        .fontSize(12)
        .fillColor("#7f8c8d")
        .font("Helvetica")
        .text(
          `Verification Code: ${verificationCode}`,
          pageWidth - 250,
          footerY
        );

      doc
        .fontSize(12)
        .fillColor("#2c3e50")
        .font("Helvetica-Bold")
        .text("Uplearn Platform", 0, footerY + 30, { align: "center" });

      doc.circle(100, 200, 30).stroke("#3498db").lineWidth(2);

      doc
        .circle(pageWidth - 100, 200, 30)
        .stroke("#3498db")
        .lineWidth(2);

      doc.end();
    } catch (error) {
      console.error("Error creating PDF:", error);
      reject(error);
    }
  });
}

async function generateCertificateForUpload({
  verificationCode,
  learnerName,
  email,
  courseName,
  completionDate = new Date(),
}) {
  const { buffer, filename } = await generateCertificate({
    verificationCode,
    learnerName,
    email,
    courseName,
    completionDate,
  });

  return {
    buffer,
    filename,
    mimeType: "application/pdf",
  };
}

export { generateCertificate, generateCertificateForUpload };
