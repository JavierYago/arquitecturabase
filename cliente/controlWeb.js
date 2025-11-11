function ControlWeb(){
    this.mostrarAgregarUsuario = function(){
        $('#bnv').remove();
        $('#mAU').remove();
        let cadena='<div id="mAU" class="form-group">';
        cadena = cadena + '<div class="card"><div class="card-body">';
        cadena = cadena +'<div class="form-group">';
        cadena = cadena + '<label for="nick">Nick:</label>';
        cadena = cadena + '<p><input type="text" class="form-control" id="nick" placeholder="introduce un nick"></p>';
        cadena = cadena + '<button id="btnAU" type="submit" class="btn btn-primary">Submit</button>';
        cadena = cadena + '<div><a href="/auth/google"><img src="./cliente/img/web_light_rd_SI@1x.png" style="height:40px;"></a></div>';
        cadena = cadena + '</div>';
        cadena = cadena + '</div></div></div>';
        $("#au").append(cadena);
        $("#btnAU").on("click",function(){
            let nick=$("#nick").val();
            rest.agregarUsuario(nick);
            $("#mAU").remove();
        });
    }
<<<<<<< HEAD

    
=======
>>>>>>> da097587932111f026bf5dd88dd072a5c303fb94

    this.mostrarPanelOps = function(){
        const panel = `
        <div id="panelOps" class="card mt-4 w-100">
            <div class="card-header">Operaciones Usuarios</div>
            <div class="card-body">
                <div class="form-row">
                    <div class="col-md-3 mb-2">
                        <button id="btnListar" class="btn btn-outline-primary btn-block">Obtener Usuarios</button>
                    </div>
                    <div class="col-md-3 mb-2">
                        <button id="btnNum" class="btn btn-outline-secondary btn-block">Número Usuarios</button>
                    </div>
                    <div class="col-md-3 mb-2">
                        <input id="nickActivo" class="form-control" placeholder="nick activo" />
                    </div>
                    <div class="col-md-3 mb-2">
                        <button id="btnActivo" class="btn btn-outline-info btn-block">Usuario Activo?</button>
                    </div>
                </div>
                <div class="form-row mt-2">
                    <div class="col-md-3 mb-2">
                        <input id="nickEliminar" class="form-control" placeholder="nick eliminar" />
                    </div>
                    <div class="col-md-3 mb-2">
                        <button id="btnEliminar" class="btn btn-outline-danger btn-block">Eliminar Usuario</button>
                    </div>
                </div>
                <hr />
                <div>
                    <h6>Resultado:</h6>
                    <pre id="resultadoUsuarios" style="min-height:120px;background:#f8f9fa;padding:10px;border:1px solid #ddd;white-space:pre-wrap;"></pre>
                </div>
            </div>
        </div>`;

        if (!$("#panelOps").length) {
            $("#au").append(panel);
        }

        const mostrarResultado = (obj) => {
            $("#resultadoUsuarios").text(typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
        };

        $("#btnListar").off('click').on('click', function(){
            $.getJSON('/obtenerUsuarios')
            .done(function(data){
                if (!data || Object.keys(data).length === 0){
                    mostrarResultado('No hay usuarios registrados');
                    return;
                }
                const nombres = Object.keys(data);
                mostrarResultado(nombres.join('\n'));
            })
            .fail(function(jqxhr, textStatus, err){ mostrarResultado('Error listar: '+textStatus+' '+err); });
        });

        $("#btnNum").off('click').on('click', function(){
            $.getJSON('/numeroUsuarios')
            .done(function(data){
                let n = (data && data.num !== undefined) ? data.num : (typeof data === 'number' ? data : (data && data.num));
                if (n === undefined) n = 0;
                mostrarResultado('Número de usuarios: ' + n);
            })
            .fail(function(jqxhr, textStatus, err){ mostrarResultado('Error numero: '+textStatus+' '+err); });
        });

        $("#btnActivo").off('click').on('click', function(){
            const nick = $('#nickActivo').val().trim();
            if(!nick){ mostrarResultado('Introduce nick'); return; }
            $.getJSON('/usuarioActivo/'+encodeURIComponent(nick))
            .done(function(data){
                let activo = undefined;
                if (data && data.nick !== undefined) activo = data.nick;
                else if (typeof data === 'boolean') activo = data;
                else if (data && data.res !== undefined) activo = data.res;
                mostrarResultado(activo ? ('Usuario "' + nick + '" está activo') : ('Usuario "' + nick + '" no está activo'));
            })
            .fail(function(jqxhr, textStatus, err){ mostrarResultado('Error activo: '+textStatus+' '+err); });
        });

        $("#btnEliminar").off('click').on('click', function(){
            const nick = $('#nickEliminar').val().trim();
            if(!nick){ mostrarResultado('Introduce nick a eliminar'); return; }
            $.getJSON('/eliminarUsuario/'+encodeURIComponent(nick))
            .done(function(data){
                let eliminado = false;
                if (data && data.deleted !== undefined) eliminado = data.deleted;
                else if (data && data.nick && data.nick !== -1) eliminado = true;
                else if (data && data.removed !== undefined) eliminado = data.removed;
                mostrarResultado(eliminado ? ('Usuario "' + nick + '" eliminado') : ('No existe el usuario "' + nick + '"'));
            })
            .fail(function(jqxhr, textStatus, err){ mostrarResultado('Error eliminar: '+textStatus+' '+err); });
        });
    };
    // fin: panel y handlers compactos
<<<<<<< HEAD

    // Método utilitario para mostrar mensajes desde fuera del panel
        // Uso: cw.mostrarMensaje('texto', 'success'|'info'|'warning'|'danger')
        this.mostrarMensaje = function(msg, tipo){
            // Si existe el área de resultado del panel, úsala
            var $res = $('#resultadoUsuarios');
            if ($res.length){
                $res.text(msg);
                return;
            }
            // Fallback: mostrar un alert simple en #au
            var clase = 'alert-info';
            if (tipo === 'success') clase = 'alert-success';
            else if (tipo === 'warning') clase = 'alert-warning';
            else if (tipo === 'danger' || tipo === 'error') clase = 'alert-danger';
        
            var $au = $('#au');
            if (!$au.length){ return; } // no hay dónde pintar
            var $box = $('#cw-msg');
            if (!$box.length){
                $box = $('<div id="cw-msg" class="alert" role="alert"></div>');
                $au.prepend($box);
            }
            $box.removeClass('alert-info alert-success alert-warning alert-danger').addClass(clase).text(msg);
        };


    this.comprobarSesion=function(){
        let nick=$.cookie("nick");
        if (nick){
            cw.mostrarMensaje("Bienvenido al sistema, "+nick);
        }
        else{
            cw.mostrarRegistro();
        }
    };

    this.mostrarRegistro=function(){
        $("#fmRegistro").remove();
        $("#registro").load("./cliente/registro.html",function(){
            const $form = $("#formRegistro");
            const $fb = $('#registroFeedback');
            $("#btnRegistro").on("click",function(e){
                e.preventDefault();
                $fb.text('');
                let email=$("#email").val().trim();
                let pwd=$("#pwd").val();
                if(!email || !pwd){
                    $fb.text('Completa todos los campos obligatorios.');
                    return;
                }
                if(pwd.length<6){
                    $fb.text('La contraseña debe tener mínimo 6 caracteres.');
                    return;
                }
                // Validación básica de email
                const re=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
                if(!re.test(email)){
                    $fb.text('Formato de email inválido.');
                    return;
                }
                rest.registrarUsuario(email, pwd);
            });
        });
    };

    this.limpiar= function(){
        $("#txt").remove();
        $("#mAU").remove();
        $("#mH").remove();
        $("#fmRegistro").remove();
        $("#fmLogin").remove();
    };

    this.mostrarLogin=function(){
        if ($.cookie("nick")){
            return true;
        };
        $("#fmLogin").remove();
        $("#registro").load("./cliente/login.html",function(){
            const $fb = $('#loginFeedback');
            $("#btnLogin").on("click",function(e){
                e.preventDefault();
                $fb.text('');
                let email=$("#email").val().trim();
                let pwd=$("#pwd").val();
                if(!email || !pwd){
                    $fb.text('Introduce email y contraseña.');
                    return;
                }
                const re=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
                if(!re.test(email)){
                    $fb.text('Email inválido.');
                    return;
                }
                if(pwd.length<6){
                    $fb.text('Contraseña demasiado corta.');
                    return;
                }
                rest.loginUsuario(email, pwd);
            });
        });
    };

    this.salir=function(){
        $.removeCookie("nick");
        //cw.mostrarMensaje("Hasta luego!");
        //añade 20 segundos de espera antes de recargar la página
        location.reload();
        rest.cerrarSesion();
    };

}
=======
}
>>>>>>> da097587932111f026bf5dd88dd072a5c303fb94
