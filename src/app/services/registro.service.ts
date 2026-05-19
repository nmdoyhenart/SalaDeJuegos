import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Usuario } from '../models/usuario.model';

@Injectable({
    providedIn: 'root'
})
export class RegistroService {
    private authService = inject(AuthService);

    async procesarRegistro(datosFormulario: any): Promise<void> {
        const nuevoUsuario: Usuario = {
        nombre: datosFormulario.nombre,
        apellido: datosFormulario.apellido,
        edad: datosFormulario.edad,
        correo: datosFormulario.correo
        };

        try {
        await this.authService.registrarUsuario(nuevoUsuario, datosFormulario.password);
        
        } catch (error: any) {
        const mensaje = error?.message || ''; // Traducir todos los errores para que sean legibles

        if (mensaje.includes('already registered') || mensaje.includes('User already exists') || mensaje.includes('duplicate key')) {
            throw new Error('¡Este correo electrónico ya se encuentra registrado!');
        } else {
            throw new Error('Ocurrió un error al intentar registrarse en el Arcade.');
        }
        }
    }
}