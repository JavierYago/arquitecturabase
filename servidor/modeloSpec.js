const modelo = require("./modelo.js");


describe('El sistema', function() {
  let sistema;

 beforeEach(function() {
  sistema=new modelo.Sistema();
 });

  it('inicialmente no hay usuarios', function() {
    expect(sistema.numeroUsuarios()).toEqual(0);
  });

  it('agregarUsuario', function() {
    const usuario = sistema.agregarUsuario('pepito');
    expect(usuario).toEqual({nick: 'pepito'});
    expect(sistema.numeroUsuarios()).toEqual(1);
    expect(sistema.usuarioActivo('pepito').nick).toBeTrue();
  });

  it('obtenerUsuarios', function() {
    sistema.agregarUsuario('maria');
    const usuarios = sistema.obtenerUsuarios();
    expect(typeof usuarios).toBe('object');
    expect(usuarios.hasOwnProperty('maria')).toBeTrue();
    expect(usuarios['maria'].nick).toBe('maria');
  });

  it('eliminarUsuario', function() {
    sistema.agregarUsuario('juan');
    expect(sistema.numeroUsuarios()).toEqual(1);
    const resDel = sistema.eliminarUsuario('juan');
    expect(resDel).toEqual({deleted: true});
    expect(sistema.numeroUsuarios()).toEqual(0);
    expect(sistema.usuarioActivo('juan').nick).toBeFalse();
  });

    it('usuarioActivo', function() {
    sistema.agregarUsuario('ana');
      expect(sistema.usuarioActivo('ana').nick).toBeTrue();
      expect(sistema.usuarioActivo('carlos').nick).toBeFalse();
  });
})
