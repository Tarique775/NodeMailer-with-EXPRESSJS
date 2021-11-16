require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
    res.render('pages/sendEmail', {
        msg: '',
    });
});

app.post('/send', async (req, res, next) => {
    const {
 name, company, email, phone, message, } = req.body;
    const outPut = `
        <p>You have a new contact Details</p>
        <h3>Contact Details</h3>
        <ul>
            <li>Name: ${name}</li>
            <li>Company: ${company}</li>
            <li>Email Address: ${email}</li>
            <li>Phone Number: ${phone}</li>
        </ul>
        <h3>Message</h3>
        <p>${message}</p>
    `;
    const { CL_ID } = process.env;

    const { CL_SC } = process.env;

    const { RED_URL } = process.env;

    const { RE_T } = process.env;

    const oauth2clint = new google.auth.OAuth2(CL_ID, CL_SC, RED_URL);
    try {
        oauth2clint.setCredentials({ refresh_token: RE_T });
        const accessToken = await oauth2clint.generateAuthUrl();
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail', // true for 465, false for other ports
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL, // generated ethereal user
                clientId: CL_ID,
                clientSecret: CL_SC,
                refreshToken: RE_T,
                accessToken, // generated ethereal password
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"Fred Foo 👻" ${process.env.EMAIL}`, // sender address
            to: `${email}`, // list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'Hello world?', // plain text body
            html: outPut, // html body
        });
        console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview only available when sending through an Ethereal account
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        res.render('pages/sendEmail', {
            msg: 'Email Sent',
        });
    } catch (e) {
        next(e);
    }
});

app.use((req, res, next) => {
    res.status(404).json({ message: 'not found!' });
    next();
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    if (err) {
        return res.status(500).json({ message: err.message });
        // console.log(chalk.red.inverse(err.message));
    }
    return res.status(500).json({ message: 'there was a requesting error!' });
    // console.log(chalk.red.inverse('there was a requesting error!'));
});
app.listen(3000, () => {
    console.log('listen on port 3000');
});
