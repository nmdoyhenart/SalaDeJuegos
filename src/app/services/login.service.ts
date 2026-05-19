import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private authService = inject(AuthService);

    async procesarLogin(datosFormulario: any): Promise<void> {
        const { correo, password } = datosFormulario;

        try {
        await this.authService.iniciarSesion(correo, password);
        
        } catch (error: any) {
        const mensaje = error?.message || ''; // Traducir todos los errores para que sean legibles

        if (mensaje.includes('Invalid login credentials') || mensaje.includes('Invalid')) {
            throw new Error('Correo o contraseña incorrectos.');
        } else {
            throw new Error('Ocurrió un error al intentar iniciar sesión en el Arcade.');
        }
        }
    }
}