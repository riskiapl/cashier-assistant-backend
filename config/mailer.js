const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Replace with your SMTP server
  port: 465, // Replace with your SMTP port
  secure: true, // true for 465, false for other ports
  auth: {
    user: "cashierassistantofficial@gmail.com", // Replace with your email
    // pass: "C4sh1erR0x#2025", // Replace with your email password
    pass: "dyde puys bgzv addu",
  },
});

const sendMail = (to, subject, text, html) => {
  const mailOptions = {
    from: '"Cashier Asistant" <cashierassistantofficial@gmail.com>', // Replace with your name and email
    to: to,
    subject: subject,
    text: text,
    html: html || "",
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
