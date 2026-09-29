import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 465,
  secure: true,
  auth: {
    user: "mic.morales@kostal.com",
    pass: "Sistemas12#",
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: '"Sistema de Salidas Kostal" <mic.morales@kostal.com>',
      to,
      subject,
      html,
    });
    console.log("Correo enviado a:", to);
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw error;
  }
}