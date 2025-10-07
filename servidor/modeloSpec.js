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
    sistema.agregarUsuario('pepito');
    expect(sistema.numeroUsuarios()).toEqual(1);
    expect(sistema.usuarioActivo('pepito')).toBeTrue();
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
    sistema.eliminarUsuario('juan');
    expect(sistema.numeroUsuarios()).toEqual(0);
    expect(sistema.usuarioActivo('juan')).toBeFalse();
  });

    it('usuarioActivo', function() {
    sistema.agregarUsuario('ana');
    expect(sistema.usuarioActivo('ana')).toBeTrue();
    expect(sistema.usuarioActivo('carlos')).toBeFalse();
  });
})
