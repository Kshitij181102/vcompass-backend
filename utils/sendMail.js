const nodemailer = require('nodemailer');

const sendMail = (otp, email) => {
  try {
    const transport = nodemailer.createTransport({
      service: 'GMAIL',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Reset Password OTP',
      html: `
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #dddddd;">
            <img src="https://drive.google.com/uc?export=view&id=13uiyiXAOOA8YY6yEswhDrb7etwnXafGN" alt="Company Logo" style="max-width: 150px; height: auto;">
          </div>
          <div style="padding: 20px 0;">
            <h2 style="font-size: 24px; font-weight: bold; text-align: center; color: #333333; margin-bottom: 10px;">V-Compass</h2>
            <h3 style="font-size: 20px; text-align: center; color: #666666; margin-bottom: 10px;">The Online Mentorship Platform</h3>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0;">
              Hello,
            </p>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 10px 0;">
              A password reset request has been initiated from this account. Please enter the OTP provided below for authentication purposes.
            </p>
            <p style="font-size: 20px; color: #333333; text-align: center; font-weight: bold; margin: 20px 0;">${otp}</p>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 10px 0;">
              If you have any questions, feel free to reach out to us. Our support team is always ready to assist you with any queries.
            </p>
          </div>
          <div style="font-size: 14px; color: #999999; text-align: center; padding-top: 20px; border-top: 1px solid #dddddd;">
            <p style="margin: 0;">Thank you.</p>
          </div>
        </div>
      `,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error('Failed to send mail');
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = sendMail;
