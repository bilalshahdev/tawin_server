import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_ENCRYPTION === 'ssl',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (process.env.EMAIL_SERVICE !== 'true') {
        console.log(`[Email Disabled] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM_ADDRESS,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error("Email Error:", error);
    }
};