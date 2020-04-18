const mailerEmail = process.env.MAILER_EMAIL || "gllss@grzegorz-kowalczyk.eu";
const mailerPassword = process.env.MAILER_PASS;
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const smtpTransport = nodemailer.createTransport({
  //service: process.env.MAILER_SERVICE_PROVIDER || "serwer2030304.home.pl",
  host: "serwer2030304.home.pl",
  port: 465,
  secure: true,
  auth: {
    user: mailerEmail,
    pass: mailerPassword
  }
});

const handlebarsOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: "./templates/",
    layoutsDir: "./templates/",
  },
  viewPath: "./templates/",
  extName: ".html"
};

smtpTransport.use("compile", hbs(handlebarsOptions));

module.exports = {
  smtpTransport,
  mailerEmail
};