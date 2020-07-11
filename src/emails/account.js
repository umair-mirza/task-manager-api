const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'robert@helpmegeek.com',
        subject: 'Thanks for joining in',
        text: `Welcome to the App, ${name}. Let me know how you get along with the app`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'robert@helpmegeek.com',
        subject: 'Its sad to see you go',
        text: `Hi ${name}. Kindly tell us if there's anything we can do to get you back?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}

