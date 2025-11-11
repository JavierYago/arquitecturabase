require('dotenv').config(); // carga variables de entorno desde .env
const fs=require("fs");
const express = require('express');
const app = express();

//Sprint2
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;

require('./servidor/passport-setup.js');
const bodyParser=require("body-parser");

const modelo = require("./servidor/modelo.js");
const cookieSession = require('cookie-session');

const PORT = process.env.PORT || 3000;


app.use(express.static(__dirname + "/"));
let sistema=new modelo.Sistema();

//Sprint2: usa express-session (requerido por passport >=0.6 para req.session.regenerate/save)
app.use(cookieSession({
    name: 'Sistema',
    keys:['key1', 'key2']
}));

// Compatibilidad Passport >=0.6 con cookie-session: añade regenerate/save si no existen
app.use(function(req, res, next){
    if (req.session && typeof req.session.regenerate !== 'function'){
        req.session.regenerate = function(cb){ if (typeof cb === 'function') cb(); };
    }
    if (req.session && typeof req.session.save !== 'function'){
        req.session.save = function(cb){ if (typeof cb === 'function') cb(); };
    }
    next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'},
    function(email, password, done) {
        try{
            sistema.loginUsuario({"email":email, "password":password}, function(user){
                if(!user){ return done(null, false, {message:'Credenciales inválidas'}); }
                return done(null, user);
            });
        } catch(err){
            console.error('[passport-local] Error en login', err);
            return done(err);
        }
    }
));

const haIniciado = function(request, response, next){
    if (request.user){
        next();
    } else {
        response.redirect('/fallo');
    }
};

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get("/", function(request,response){
    // Leer HTML y sustituir valores sensibles por los de entorno antes de servir
    let contenido=fs.readFileSync(__dirname+"/cliente/index.html", 'utf8');
    const clientId = process.env.ClienteID || '';
    const loginUri = `${process.env.url || ''}/oneTap/callback`;
    // Reemplazar atributos en el div de Google One Tap (soporta comillas o sin comillas)
    contenido = contenido
    .replace(/data-client_id\s*=\s*("[^"]*"|[^\s>]+)/i, `data-client_id="${clientId}"`)
    .replace(/data-login_uri\s*=\s*("[^"]*"|[^\s>]+)/i, `data-login_uri="${loginUri}"`);
    response.setHeader("Content-type","text/html; charset=utf-8");
    response.send(contenido);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/fallo' }),
    function(req, res) {
        res.redirect('/good');
});

app.post('/oneTap/callback',
    passport.authenticate('google-one-tap', { failureRedirect: '/fallo' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/good');
    }
);

app.get("/good", function(request,response){
    let email=request.user.emails[0].value;
    sistema.usuarioGoogle({"email":email},function(obj){
        response.cookie('nick',obj.email);
        response.redirect('/');
    });
});

app.get("/fallo",function(request,response){
    response.send({nick:"nook"})
});

app.post("/registrarUsuario", function(request, response){
    try{
        const {email, password} = request.body || {};
        if(!email || !password){
            return response.status(400).json({error:'Email y contraseña requeridos'});
        }
        // Evita 500 si la BD todavía no está conectada
        if(!sistema.cad || !sistema.cad.usuarios){
            console.warn('[POST /registrarUsuario] BD no conectada aún');
            return response.status(503).json({error:'Base de datos no conectada. Prueba de nuevo en unos segundos.'});
        }
        sistema.registrarUsuario({email, password}, function(res){
            if(res && res.email && res.email!=-1){
                return response.json({nick:res.email});
            }
            return response.status(409).json({error:'Usuario ya existe'});
        });
    } catch(err){
        console.error('[POST /registrarUsuario] Error', err);
        response.status(500).json({error:'Error interno'});
    }
});

app.get("/confirmarUsuario/:email/:key",function(request,response){
    let email=request.params.email;
    let key=request.params.key;
    try{
        sistema.confirmarUsuario({"email":email,"key":key},function(usr){
            if (usr.email!=-1){
                response.cookie('nick',usr.email);
            }
            response.redirect('/');
        });
    } catch(err){
        console.error('[GET /confirmarUsuario] Error', err);
        response.redirect('/');
    }
});

// Evitar redirects en API: responder JSON explícito
app.post("/loginUsuario", function(req,res,next){
    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
        if(!user){ return res.status(401).json({error: info?.message || 'Credenciales inválidas'}); }
        req.logIn(user, function(err){
            if(err){ return next(err); }
            return res.json({nick:user.email});
        });
    })(req,res,next);
});

app.get("/ok", function(request,response){
    response.send({nick:request.user.email});
});

app.get("/agregarUsuario/:nick",function(request,response){
    try{
        let nick=(request.params.nick||'').trim();
        if(!nick){ return response.status(400).json({error:'nick requerido'}); }
        let res=sistema.agregarUsuario(nick);
        response.send(res);
    } catch(err){
        console.error('[GET /agregarUsuario] Error', err);
        response.status(500).json({error:'Error interno'});
    }
});

app.get("/obtenerUsuarios", haIniciado, function(request,response){
    try{
        let lista=sistema.obtenerUsuarios();
        response.send(lista);
    } catch(err){
        console.error('[GET /obtenerUsuarios] Error', err);
        response.status(500).json({error:'Error interno'});
    }
});


app.get("/usuarioActivo/:nick", function(request, response){
    try{
        let nick=(request.params.nick||'').trim();
        if(!nick){ return response.status(400).json({error:'nick requerido'}); }
        let res=sistema.usuarioActivo(nick);
        response.send(res);
    } catch(err){
        console.error('[GET /usuarioActivo] Error', err);
        response.status(500).json({error:'Error interno'});
    }
});

app.get("/numeroUsuarios", function(request, response){
    try{
        let resObj={"num":sistema.numeroUsuarios()};
        response.send(resObj);
    } catch(err){
        console.error('[GET /numeroUsuarios] Error', err);
        response.status(500).json({error:'Error interno'});
    }
});

app.get("/eliminarUsuario/:nick", function(request, response){
    try{
        let nick=(request.params.nick||'').trim();
        if(!nick){ return response.status(400).json({error:'nick requerido'}); }
        let res=sistema.eliminarUsuario(nick);
        response.send(res);
    } catch(err){
        console.error('[GET /eliminarUsuario] Error', err);
        response.status(500).json({error:'Error interno'});
    }
});

app.get("/cerrarSesion", haIniciado, function(request, response){
    try{
        let nick=request.user && request.user.nick;
        request.logout(function(err){
            if(err){ console.error('[logout] Error', err); }
            if(nick){
                sistema.eliminarUsuario(nick);
            }
            response.redirect('/');
        });
    } catch(err){
        console.error('[GET /cerrarSesion] Error', err);
        response.redirect('/');
    }
});

// Config pública (solo valores NO sensibles)
app.get('/config/public', (req,res)=>{
    res.json({
        googleClientId: process.env.ClienteID,
        loginUri: process.env.url + '/oneTap/callback'
    });
});

app.listen(PORT, () => {
    console.info(`[Servidor] Escuchando en puerto ${PORT}`);
    console.info('Ctrl+C para salir');
});
