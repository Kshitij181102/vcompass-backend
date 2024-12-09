const nodemailer = require('nodemailer');

const mailNew = (email) => {
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
      subject: 'Welcome to V-Compass',
      html: `
       <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #dddddd;">
    
    <!-- Header Section with Logo -->
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #dddddd;">
      <img src="https://drive.google.com/uc?export=view&id=13uiyiXAOOA8YY6yEswhDrb7etwnXafGN" alt="Company Logo" style="max-width: 150px; height: auto;">
    </div>

    <!-- Main Content -->
    <div style="padding: 20px 0;">
      <h2 style="font-size: 20px; font-weight: bold; color: #333333; text-align: center; margin-bottom: 10px;">V-Compass</h2>
      <h2 style="font-size: 18px; font-weight: bold; color: #333333; text-align: center; margin-bottom: 10px;">The Online Mentorship Platform</h2>
      
      <p style="font-size: 16px; color: #666666; line-height: 1.6;">Hello,</p>
      <p style="font-size: 16px; color: #666666; line-height: 1.6;">We are very excited to welcome you on board!</p>
      <p style="font-size: 16px; color: #666666; line-height: 1.6;">
        In order to avail the services of our platform <b>V-Compass</b>, we kindly request you to make a Discord account and join the server given below.
      </p>

      <a href="https://discord.gg/kx8kjVZ4ey" target="_blank" style="display: block; width: fit-content; margin: 20px auto; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px; text-align: center;">Join Server</a>



    <!-- Footer Section with Thanking Message -->
    <div style="font-size: 14px; color: #999999; text-align: center; padding-top: 20px; border-top: 1px solid #dddddd;">
      <p>Thank you.</p>
    </div>
  </div>
</body>
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

module.exports = mailNew;
