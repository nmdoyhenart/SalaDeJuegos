import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const publicGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Escuchamos si hay un usuario activo
    return authService.usuarioActivo.pipe(
        take(1), // Tomamos el valor actual y nos desuscribimos
        map(user => {
        if (user) {
            // Si ya está logueado, lo pateamos al Home
            router.navigate(['/home']);
            return false;
        }
        // Si no está logueado, lo dejamos pasar al Login/Registro
        return true;
        })
    );
};