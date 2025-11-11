function ClienteRest(){
    this.agregarUsuario=function(nick){
        var cli=this;
        $.getJSON("/agregarUsuario/"+nick,function(data){
            let msg="El nick " +nick + " ha sido registrado";
            if (data.nick!=-1){
                console.info("Usuario "+nick+" registrado");
                msg = "Bienvenido al sistema, " + nick;
                $.cookie("nick", nick);
            }
            else{
                console.warn("El nick ya está ocupado");
                msg = "El nick ya está ocupado";
            }
            cw.mostrarMensaje(msg, data.nick!=-1? 'success':'warning');
        })
    }
    this.agregarUsuario2=function(nick){
        $.ajax({
            type:'GET',
            url:'/agregarUsuario/'+nick,
            success:function(data){
                if (data.nick!=-1){
                    console.log("Usuario "+nick+" ha sido registrado")
                }
                else{
                    console.log("El nick ya está ocupado");
                }
            },
            error:function(xhr, textStatus, errorThrown){
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType:'application/json'
        });
    }
    
    this.obtenerUsuarios=function(){
        $.getJSON("/obtenerUsuarios",function(data){
            console.log(data);
        })
    }
    this.numeroUsuarios=function(){
        $.getJSON("/numeroUsuarios",function(data){
            console.log(data);
        })
    }
    this.usuarioActivo=function(nick){
        $.getJSON("/usuarioActivo/"+nick,function(data){
            console.log(data);
        })
    }
    this.eliminarUsuario=function(nick){
        $.getJSON("/eliminarUsuario/"+nick,function(data){
            if (data.nick!=-1){
                console.log("Usuario "+nick+" ha sido eliminado")
            }
            else{
                console.log("El nick no existe");
            }
        }) 
    }

    this.registrarUsuario=function(email, password){
        $.ajax({
            type:'POST',
            url:'/registrarUsuario',
            data: JSON.stringify({"email": email, "password": password}),
            success:function(data){
                if(data && data.nick && data.nick!=-1){
                    console.info("Registro ok para "+data.nick);
                    $.cookie("nick", data.nick);
                    cw.limpiar();
                    cw.mostrarMensaje("Registro correcto. Revisa tu correo para confirmar la cuenta.", 'success');
                }
                else{
                    cw.mostrarMensaje("No se pudo registrar. ¿Email ya en uso?", 'warning');
                }
            },
            error:function(xhr, textStatus, errorThrown){
                console.error("Registro fallido:", textStatus, errorThrown);
                cw.mostrarMensaje("Error de registro: "+(xhr.responseJSON?.error || textStatus), 'danger');
            },
            contentType:'application/json'
        });
    }

    this.loginUsuario=function(email, password){
        $.ajax({
            type:'POST',
            url:'/loginUsuario',
            data: JSON.stringify({"email": email, "password": password}),
            success:function(data){
                if(data && data.nick && data.nick!=-1){
                    console.info("Login ok para "+data.nick);
                    $.cookie("nick", data.nick);
                    cw.limpiar();
                    cw.mostrarMensaje("Bienvenido al sistema, "+data.nick);
                }
                else{
                    console.warn("No se pudo iniciar sesión");
                    cw.mostrarMensaje("Credenciales inválidas o cuenta no confirmada", 'warning');
                    cw.mostrarLogin();
                }
            },
            error:function(xhr, textStatus, errorThrown){
                console.error("Login fallido:", textStatus, errorThrown);
                cw.mostrarMensaje("Error de inicio de sesión: "+(xhr.responseJSON?.error || textStatus), 'danger');
            },
            contentType:'application/json'
        });
    }

    this.cerrarSesion=function(){
        $.getJSON("/cerrarSesion",function(){
            console.info("Sesión cerrada");
            $.removeCookie("nick");
        });
    }
}
