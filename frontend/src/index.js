const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const port = 4444;
app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(cors());
app.listen(port, () => {
console.log('We are live on port 4444');
});
app.get('/', (req, res) => {
res.send('Welcome to my api');
})



app.post('/api/v1/contact', (req, res) => {
    var data = req.body;
    var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    auth: {
    user: 'spambytes@gmail.com',
    pass: 'sih'
    }
    });
    var mailOptions = {
    from: data.email,
    replyto: data.email,
    to: 'nodal@gmail.com',
    subject: data.title,
    html: `<p>${data.email}</p>
    <p>${data.message}</p>`,
    attachments: [
    {
    filename: data.title + ".jpg",
    contentType:  'image/jpeg',
    content: new Buffer.from(req.body.image.split("base64,")[1], "base64"),
    }
    ]
    };
    smtpTransport.sendMail(mailOptions,
    (error, response) => {
    if (error) {
    res.status(400).send(error)
    } else {
    res.send('Success')
    }
    smtpTransport.close();
    });
    })