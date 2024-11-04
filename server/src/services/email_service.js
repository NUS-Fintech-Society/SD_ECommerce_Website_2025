const nodemailer = require('nodemailer');
require('dotenv');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        text, 
    };

    await transporter.sendMail(mailOptions);
}

transporter.verify((error) => {
    if (error) {
        console.log("SMTP connection error: ", error);
    } else {
        console.log("SMTP services ready");
    }
})

module.exports = { sendEmail };