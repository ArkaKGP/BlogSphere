const nodemailer = require('nodemailer');

exports.sendMail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Configure transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_FROM, // full Gmail address
      pass: process.env.EMAIL_PASS  // app password
    },
    tls: {
      rejectUnauthorized: false // only for development
    }
  });

  const emailSubject = subject && subject.trim() ? `[Contact Form] ${subject}` : `New message from ${name}`;
  const formattedDate = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const mailOptions = {
    from: email,
    to: 'blogspherehelpdesk@gmail.com',
    subject: emailSubject,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Submission</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #05070a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #05070a; padding: 40px 10px;">
        <tr>
          <td align="center">
            <!-- Main Card Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0f141c; border-radius: 16px; border: 1px solid #232b38; box-shadow: 0 20px 40px rgba(0,0,0,0.6); overflow: hidden;">
              
              <!-- Header Bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #182030 0%, #0f141c 100%); padding: 32px 30px; text-align: center; border-bottom: 2px solid #2a3547;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <div style="display: inline-block; padding: 6px 16px; background-color: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 50px; color: #f3e5ab; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
                          BlogSphere Support Desk
                        </div>
                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; tracking-tight: -0.5px;">
                          New Contact Form Submission
                        </h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content Area -->
              <tr>
                <td style="padding: 32px 30px;">
                  
                  <!-- Metadata Grid -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                    <!-- Sender Name -->
                    <tr>
                      <td style="padding: 12px 16px; background-color: #171f2b; border-radius: 10px; border-left: 4px solid #d4af37; margin-bottom: 10px; display: block;">
                        <span style="color: #8a99ad; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">SENDER NAME</span>
                        <div style="color: #ffffff; font-size: 16px; font-weight: 600; margin-top: 4px;">${name}</div>
                      </td>
                    </tr>

                    <!-- Sender Email -->
                    <tr>
                      <td style="padding: 12px 16px; background-color: #171f2b; border-radius: 10px; border-left: 4px solid #60a5fa; margin-bottom: 10px; display: block;">
                        <span style="color: #8a99ad; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">EMAIL ADDRESS</span>
                        <div style="margin-top: 4px;">
                          <a href="mailto:${email}" style="color: #60a5fa; font-size: 16px; font-weight: 600; text-decoration: none;">${email}</a>
                        </div>
                      </td>
                    </tr>

                    <!-- Subject -->
                    ${subject ? `
                    <tr>
                      <td style="padding: 12px 16px; background-color: #171f2b; border-radius: 10px; border-left: 4px solid #a78bfa; margin-bottom: 10px; display: block;">
                        <span style="color: #8a99ad; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">SUBJECT</span>
                        <div style="color: #ffffff; font-size: 15px; font-weight: 600; margin-top: 4px;">${subject}</div>
                      </td>
                    </tr>
                    ` : ''}
                  </table>

                  <!-- Message Container -->
                  <div style="background-color: #171f2b; border-radius: 12px; border: 1px solid #2a3547; padding: 20px; margin-top: 10px;">
                    <div style="color: #d4af37; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                      MESSAGE CONTENT
                    </div>
                    <div style="color: #e2e8f0; font-size: 15px; line-height: 1.7; white-space: pre-wrap; font-family: inherit;">
                      ${message.replace(/\n/g, '<br>')}
                    </div>
                  </div>

                  <!-- Action Callout -->
                  <div style="margin-top: 28px; text-align: center;">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your message to BlogSphere')}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #d4af37 0%, #b8943f 100%); color: #000000; font-size: 14px; font-weight: 700; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);">
                      Reply to ${name} &rarr;
                    </a>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0a0d13; padding: 20px 30px; text-align: center; border-top: 1px solid #1e2634;">
                  <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
                    Received on <strong>${formattedDate}</strong><br>
                    Sent securely via <strong>BlogSphere Contact Form</strong>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\nMessage: ${message}`
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
};
