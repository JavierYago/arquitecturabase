const nodemailer = require('nodemailer');
// Usa la URL de entorno si existe, si no fallback a localhost
const baseUrl=(process.env.url).replace(/\/$/, '');
const uri = process.env.uri;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email_user,
        pass: process.env.email_pass 
    }
});

//send();

module.exports.enviarEmail=async function(direccion, key, men) {
    const confirmUrl = `${baseUrl}confirmarUsuario/${encodeURIComponent(direccion)}/${encodeURIComponent(key)}`;
    const html = `
        <div style="font-family:Arial,Helvetica,sans-serif; line-height:1.6; color:#222;">
            <h2 style="margin-bottom:8px;">Bienvenido a Sistema</h2>
            <p>Gracias por registrarte. Por favor, confirma tu cuenta para empezar a usar la aplicación.</p>
            <p style="margin:24px 0;">
                <a href="${confirmUrl}"
                   style="background:#0d6efd;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;display:inline-block;">
                   Confirmar cuenta
                </a>
            </p>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break:break-all;"><a href="${confirmUrl}">${confirmUrl}</a></p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:12px;color:#666;">Este mensaje se envió a ${direccion}. Si no esperabas este correo, puedes ignorarlo.</p>
        </div>`;

    await transporter.sendMail({
        from: process.env.email_user,
        to: direccion,
        subject: men,
        text: 'Pulsa aquí para confirmar cuenta',
        html: '<p>Bienvenido a Sistema</p><p><a href="'+confirmUrl+'">Pulsa aquí para confirmar cuenta</a></p>'
    });
}