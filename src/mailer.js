const fs = require('fs');
const nodemailer = require('nodemailer');
const { minify } = require('html-minifier');
const moment = require('moment');
const chalk = require('chalk');
const md2html = require('./md2html');

module.exports = async function (date = moment().subtract(0, 'days').format('YYMMDD'), isWeekly) {
    const subject = `${process.env.NAME} - ${date} ${isWeekly ? '周' : '日'}报`;
    const to = isWeekly ? process.env.TO_WEEKLY : process.env.TO_DAILY;

    console.log(`send ${chalk.yellow(subject)} to ${chalk.cyan(to)}`);

    console.log(`read file: ./docs/${date}.md`);
    const md = fs.readFileSync(`./docs/${date}.md`).toString();

    console.log(`render to html`);
    const { html, styles } = await md2html.github(md);
    console.log(`render done`);

    // html template
    const mail = `<!DOCTYPE html>
    <html>
        <head>
            ${styles.map(style => `<style>${style}</style>`).join('')}
        </head>
        <body>
            <div class="markdown-body">
                ${html}
            </div>
        </body>
    </html>`;

    // 压缩 html
    console.log(`minify html`);
    const minified = minify(mail, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        // preserveLineBreaks: true,
        minifyCSS: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeEmptyElements: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
    });

    // Remove normalize body margin reset, because mail client has its own 
    // default margin.
    const finalHTML = minified.replace('body{margin:0}', '');

    console.log(`minify done`);

    // Write local file to preview and test.
    // return fs.writeFileSync('./out.html', finalHTML);

    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.PORT || 465,
        secure: process.env.SECURE !== 'false',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"${process.env.NAME}" <${process.env.MAIL_USER}>`,
        to: to,
        cc: process.env.CC,
        bcc: process.env.BCC,
        subject,
        html: finalHTML,
    };

    console.log('start sending email');
    transporter
        .sendMail(mailOptions)
        .then((res) => {
            console.log(chalk.green('Send success!'));
            console.log(res);
        })
        .catch((err) => {
            console.log(chalk.red('Send fail!'));
            console.log(err);
        });
};
