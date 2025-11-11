const datos=require("./cad.js");
const correo=require("./email.js");
const bcrypt = require("bcrypt");

function Sistema(){
    this.usuarios={};
    this.cad=new datos.CAD();

    this.agregarUsuario=function(nick){
        let res={"nick":-1};
        if(!this.usuarios[nick]){
            this.usuarios[nick]=new Usuario(nick);
            res.nick=nick;
        } else {
            console.warn("[Sistema] El nick " + nick + " ya está en uso");
        }
        return res;
    }

    this.obtenerUsuarios=function(){
        return this.usuarios;
    } 

    this.usuarioActivo=function(nick){
        let res={"nick":-1};
        if(this.usuarios[nick]){
            res.nick=true;
            return res;
        }
        res.nick=false;
        return res;
    }

    this.eliminarUsuario=function(nick){
        if(this.usuarios[nick]){
            delete this.usuarios[nick];
            return {deleted: true};
        }
        return {deleted: false};
    }

    this.numeroUsuarios=function(){
        return Object.keys(this.usuarios).length;
    }
    
    this.cad.conectar(function(db){
        console.log("Conectado a Mongo Atlas");
    });

    this.usuarioGoogle=function(usr,callback){
        this.cad.buscarOCrearUsuario(usr,function(obj){
            callback(obj);
        });
    }

    this.registrarUsuario=function(obj, callback){
        let modelo=this;
        if(!obj.nick){
            obj.nick=obj.email;
        }
        try{
            this.cad.buscarUsuario({"email":obj.email},async function(usr){
                try{
                    if (!usr){
                        let key=Date.now().toString();
                        obj.confirmada=false;
                        obj.key=key;
                        const hash = await bcrypt.hash(obj.password, 10);
                        obj.password=hash;
                        modelo.cad.insertarUsuario(obj, function(res){
                            callback(res);
                        });
                        // email asíncrono sin bloquear respuesta
                        correo.enviarEmail(obj.email, obj.key, "Confirma cuenta").catch(e=>console.error('[registrarUsuario] Error enviando correo', e));
                    }
                    else{
                        callback({"email":-1});
                    }
                } catch(inner){
                    console.error('[registrarUsuario] Error interno en callback buscarUsuario', inner);
                    callback({"email":-1});
                }
            });
        } catch(err){
            console.error('[registrarUsuario] Excepción', err);
            callback({"email":-1});
        }
    }

    this.loginUsuario=function(obj, callback){
        this.cad.buscarUsuario({"email":obj.email, "confirmada":true}, async function(usr){
            try{
                if (usr && await bcrypt.compare(obj.password, usr.password)){
                    callback(usr);
                }
                else{
                    // devolver null para que Passport interprete fallo
                    callback(null);
                }
            } catch(err){
                console.error('[loginUsuario] Error comparando contraseña', err);
                callback(null);
            }
        });
    }

    this.confirmarUsuario=function(obj, callback){
        let modelo=this;
        this.cad.buscarUsuario({"email":obj.email, "confirmada":false, "key":obj.key},function(usr){
            if (usr){
                usr.confirmada=true;
                modelo.cad.actualizarUsuario(usr, function(res){
                    callback({"email":res.email});
                });
            }
            else{
                callback({"email":-1});
            }
        });
    }

}


function Usuario(nick){
    this.nick=nick;
}

module.exports.Sistema=Sistema;

