import nodemailer from "nodemailer"
import Mailgen from "mailgen"

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_Password,
  },
});

let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Mailgen',
        link: 'https://mailgen.js/'
    }
});

const sendmail = async function(options){
    
 let  emailText = mailGenerator.generatePlaintext(options.verificationEmail);
 let emailHtml = mailGenerator.generate(options.verificationEmail);
  const mail = {
     from: 'mail.taskmanager@example.com',
    to:options.email,
    subject: options.subject,
    text: emailText,// plain‑text body
    html: emailHtml, // HTML body
  }
  try{
   await  transporter.sendMail(mail);
  }catch(err){
    console.lo
  }

}

const verificationEmail = (username ,verificationURL) => {
    return {
         body: {
        name: username,
        intro: 'Welcome to Mailgen! We\'re very excited to have you on board.',
        action: {
            instructions: 'Verify your Email',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Confirm your account',
                link: verificationURL,
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
    }
};


export {sendmail,verificationEmail}