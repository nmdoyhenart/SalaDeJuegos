import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ResultadosService {
    private authService = inject(AuthService);

    // Traemos la data y ordenamos de mayor a menor puntaje/acierto
    async getResultadosSnake() {
        const { data } = await this.authService.client
        .from('puntajes_snake')
        .select('nombre_usuario, puntaje, created_at')
        .gt('puntaje', 0)
        .order('puntaje', { ascending: false });
        return data || [];
    }

    async getResultadosPreguntados() {
        const { data } = await this.authService.client
        .from('puntajes_preguntados')
        .select('nombre_usuario, aciertos, created_at')
        .gt('aciertos', 0)
        .order('aciertos', { ascending: false });
        return data || [];
    }

    async getResultadosMayorMenor() {
        const { data } = await this.authService.client
        .from('puntajes_mayor_menor')
        .select('nombre_usuario, aciertos, fecha') 
        .gt('aciertos', 0)
        .order('aciertos', { ascending: false });
        return data || [];
    }

    async getResultadosAhorcado() {
        const { data } = await this.authService.client
        .from('puntajes_ahorcado')
        .select('nombre_usuario, resultado, fecha')
        .eq('resultado', 'Victoria') 
        .order('fecha', { ascending: false }); 
        return data || [];
    }
}