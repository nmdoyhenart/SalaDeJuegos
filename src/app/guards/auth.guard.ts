import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.usuarioActivo.pipe(
        take(1),
        map(user => {
        if (!user) {
            // Si no está logueado, lo mandamos al Login
            router.navigate(['/login']);
            return false;
        }
        // Si está logueado, lo dejamos pasar al juego
        return true;
        })
    );
};