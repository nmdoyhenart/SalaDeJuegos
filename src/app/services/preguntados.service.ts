import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { Preguntados } from '../models/preguntados.model';

@Injectable({
    providedIn: 'root'
})
export class PreguntadosService {
    private authService = inject(AuthService);

    // SIGNALS PRIVADOS
    private _preguntas = signal<Preguntados[]>([]);
    private _indiceActual = signal<number>(0);
    private _aciertos = signal<number>(0);
    private _estadoJuego = signal<'cargando' | 'jugando' | 'terminado'>('cargando');

    // GETTERS PÚBLICOS
    get preguntas() { return this._preguntas; }
    get indiceActual() { return this._indiceActual; }
    get aciertos() { return this._aciertos; }
    get estadoJuego() { return this._estadoJuego; }

    // Getter dinámicos preguntas
    get preguntaActual() {
        return this._preguntas()[this._indiceActual()];
    }

    async iniciarJuego() {
        this._estadoJuego.set('cargando');
        this._aciertos.set(0);
        this._indiceActual.set(0);
        this._preguntas.set([]);

        try {
        const respuesta = await fetch('https://opentdb.com/api.php?amount=10&category=28&difficulty=easy');
        const datos = await respuesta.json();

        // Mapeamos los datos a nuestro model
        const preguntasProcesadas: Preguntados[] = datos.results.map((item: any) => {
            
            const todasLasOpciones = [...item.incorrect_answers, item.correct_answer];
            todasLasOpciones.sort(() => Math.random() - 0.5);

            return {
            texto: item.question,
            opciones: todasLasOpciones,
            respuestaCorrecta: item.correct_answer
            };
        });

        this._preguntas.set(preguntasProcesadas);
        this._estadoJuego.set('jugando');

        } catch (error) {
        console.error('Error al traer las preguntas de la API:', error);
        }
    }

    seleccionarRespuesta(opcionElegida: string) {
        if (this._estadoJuego() !== 'jugando') return;

        const correcta = this.preguntaActual.respuestaCorrecta;

        if (opcionElegida === correcta) {
            this._aciertos.update(v => v + 1); // Tomamos el valor actual en memoria y sumamos a la racha.
        }

        // Verificamos si todavia hay preguntas por mostrar (pos 9)
        if (this._indiceActual() < 9) {
            // Si el indice es menor actualizamos el signal para avanzar a la siguiente pregunta
            this._indiceActual.update(i => i + 1);
        } else {
            // Si el indice ya no es menor a 9, significa respondio la ultima pregunta.
            this._estadoJuego.set('terminado');
            
            this.guardarPartida();
        }
    }

    private async guardarPartida() {
        const usuario = this.authService.usuarioActivo.value;
        const perfil = this.authService.perfilActivo.value;

        if (usuario) {
        try {
            const { error } = await this.authService.client.from('puntajes_preguntados').insert({
            usuario_id: usuario.id,
            nombre_usuario: perfil?.nombre || 'Jugador',
            aciertos: this._aciertos(),
            total_preguntas: 10
            });

            if (error) throw error;
            console.log("¡Partida de Preguntados guardada con éxito!");
        } catch (err) {
            console.error("Error al guardar partida:", err);
        }
        }
    }
}