const mailerEmail = process.env.MAILER_EMAIL || "gllss@grzegorz-kowalczyk.dev";
const mailerPassword = process.env.MAILER_PASS;
const mailerHost = process.env.MAILER_HOST;
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const smtpTransport = nodemailer.createTransport({
  host: mailerHost,
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
