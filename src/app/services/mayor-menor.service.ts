import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { Carta } from '../models/carta.model';

@Injectable({
    providedIn: 'root'
})
export class MayorMenorService {
    private authService = inject(AuthService);

    private _mazo: Carta[] = []; // Variable de control
    private _cartaActual = signal<Carta | null>(null);
    private _aciertos = signal<number>(0);
    private _estadoJuego = signal<'jugando' | 'perdido'>('jugando');
    private _rachaActual = signal<number>(0);
    private _intentos = signal<number>(1);

    // GETTERS PÚBLICOS PARA LECTURA DEL COMPONENTE
    get cartaActual() { return this._cartaActual; }
    get aciertos() { return this._aciertos; }
    get estadoJuego() { return this._estadoJuego; }
    get rachaActual() { return this._rachaActual; }
    get intentos() { return this._intentos; }

    iniciarJuego() {
        this._aciertos.set(0);
        this._estadoJuego.set('jugando');
        this.crearMazo();
        this.mezclarMazo();
        this._cartaActual.set(this.sacarCarta());
    }

    private crearMazo() {
        this._mazo = [];
        const palos = [
        { simbolo: '♥', color: 'red' },
        { simbolo: '♦', color: 'red' },
        { simbolo: '♣', color: 'black' },
        { simbolo: '♠', color: 'black' }
        ];

        for (let p of palos) {
        for (let i = 1; i <= 13; i++) {
            let mostrar = i.toString();
            if (i === 1) mostrar = 'A';
            if (i === 11) mostrar = 'J';
            if (i === 12) mostrar = 'Q';
            if (i === 13) mostrar = 'K';

            this._mazo.push({ valor: i, mostrar, palo: p.simbolo, color: p.color });
        }
        }
    }

    private mezclarMazo() {
        for (let i = this._mazo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this._mazo[i], this._mazo[j]] = [this._mazo[j], this._mazo[i]];
        }
    }

    private sacarCarta(): Carta {
        if (this._mazo.length === 0) {
        this.crearMazo();
        this.mezclarMazo();
        }
        return this._mazo.pop()!;
    }

    adivinar(eleccion: 'mayor' | 'menor') {
        if (this._estadoJuego() !== 'jugando') return;

        const cartaAnterior = this._cartaActual();
        const nuevaCarta = this.sacarCarta();
        
        this._cartaActual.set(nuevaCarta);

        // Empate de valor
        if (cartaAnterior!.valor === nuevaCarta.valor) {
        return; 
        }

        const esMayor = nuevaCarta.valor > cartaAnterior!.valor;

        if ((eleccion === 'mayor' && esMayor) || (eleccion === 'menor' && !esMayor)) {
        this._aciertos.update(v => v + 1);
        } else {
        this._estadoJuego.set('perdido');
        this.guardarPartida();
        }
    }

    private async guardarPartida() {
        const usuario = this.authService.usuarioActivo.value;
        const perfil = this.authService.perfilActivo.value;

        if (usuario && this._aciertos() > 0) {
        try {
            const { error } = await this.authService.client.from('puntajes_mayor_menor').insert({
            usuario_id: usuario.id,
            nombre_usuario: perfil?.nombre || 'Jugador',
            aciertos: this._aciertos()
            });
            
            if (error) throw error;
            console.log("¡Partida de Mayor o Menor guardada con éxito!");
        } catch (err) {
            console.error("Error al guardar partida:", err);
        }
        }
    }
}