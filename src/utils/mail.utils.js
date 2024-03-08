var nodeMailer = require('nodemailer');
const MAIL_HOST = 'smtp.gmail.com';
const MAIL_PORT = 465;
const MAIL_AUTHENTICATION_USERNAME = 'kirankmr450@gmail.com';
const MAIL_AUTHENTICATION_PASSWORD = 'carp#d13m';

// Please ensure to enable 'Allow less secure apps' in 
// sender's gmail account. Details here:
// https://codeburst.io/sending-an-email-using-nodemailer-gmail-7cfa0712a799

exports.sendWelcomeMailToGuest = function(name, mailId, res) {
      let mailOptions = {
          from: '"Uno Rooms" <unorooms@gmail.com>', // sender address
          to: mailId, // list of receivers
          subject: 'Welcome to Unoroom', // Subject line
          text: 'Hi ' + name, // plain text body
          html: '<b>NodeJS Email Tutorial</b>' // html body
      };

      getSMTPTransporter().sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            return res.status(200).send('');
      });
}

var getSMTPTransporter = () => {
//    return nodeMailer.createTransport({
//        host: MAIL_HOST,
//        port: MAIL_PORT,
//        secure: true,
//        auth: {
//          user: MAIL_AUTHENTICATION_USERNAME,
//          pass: MAIL_AUTHENTICATION_PASSWORD
//        }
//    });
    
    return nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: MAIL_AUTHENTICATION_USERNAME,
            pass: MAIL_AUTHENTICATION_PASSWORD
        }
    });
}
