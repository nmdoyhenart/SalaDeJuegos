import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AhorcadoService {
    private authService = inject(AuthService);

    // Diccionarios
    private palabrasPosibles = [
        { palabra: 'ELEFANTE', pista: 'El animal terrestre más grande del mundo' },
        { palabra: 'BIBLIOTECA', pista: 'Lugar donde se guardan y prestan libros' },
        { palabra: 'MONTAÑA', pista: 'Gran elevación natural del terreno' },
        { palabra: 'CHOCOLATE', pista: 'Dulce hecho a base de cacao' },
        { palabra: 'ASTRONAUTA', pista: 'Persona que viaja al espacio' },
        { palabra: 'TELESCOPIO', pista: 'Instrumento utilizado para observar estrellas y planetas' }
    ];

    private dibujosAhorcado: string[] = [
        `  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========`, // 0 vidas
        `  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========`, // 1 vida
        `  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========`, // 2 vidas
        `  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========`, // 3 vidas
        `  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========`, // 4 vidas
        `  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========`, // 5 vidas
        `  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========`  // 6 vidas
    ];

    // Variable de control
    private _palabraSecreta = '';

    // GETTER EXPONER PALABRA SECRETA
    get palabraSecreta() {
        return this._palabraSecreta;
    }

    // Signals reactivos para que el componente los lea
    pistaActual = signal<string>('');
    palabraOculta = signal<string[]>([]);
    letrasUsadas = signal<string[]>([]);
    intentosRestantes = signal<number>(6);
    estadoJuego = signal<'jugando' | 'ganado' | 'perdido'>('jugando');
    dibujoActual = signal<string>(this.dibujosAhorcado[6]);
    

    iniciarJuego() {
        this.estadoJuego.set('jugando');
        this.intentosRestantes.set(6);
        this.letrasUsadas.set([]);
        this.dibujoActual.set(this.dibujosAhorcado[6]);
        
        const indice = Math.floor(Math.random() * this.palabrasPosibles.length);
        const seleccion = this.palabrasPosibles[indice];
        
        this._palabraSecreta = seleccion.palabra; 
        this.pistaActual.set(seleccion.pista);
        this.palabraOculta.set(Array(this._palabraSecreta.length).fill('_')); 
    }

    presionarLetra(letra: string) {
        if (this.estadoJuego() !== 'jugando' || this.letrasUsadas().includes(letra)) return;

        // Agregamos la letra al signal (creando un nuevo array)
        this.letrasUsadas.update(letras => [...letras, letra]);
        
        if (this._palabraSecreta.includes(letra)) { 
        this.palabraOculta.update(oculta => {
            const nuevaOculta = [...oculta];
            for (let i = 0; i < this._palabraSecreta.length; i++) { 
            if (this._palabraSecreta[i] === letra) { 
                nuevaOculta[i] = letra;
            }
            }
            return nuevaOculta;
        });
        this.verificarVictoria();
        } else {
        this.intentosRestantes.update(v => v - 1);
        this.dibujoActual.set(this.dibujosAhorcado[this.intentosRestantes()]);
        this.verificarDerrota();
        }
    }

    private verificarVictoria() {
        if (!this.palabraOculta().includes('_')) {
        this.estadoJuego.set('ganado');
        this.guardarPartida('Victoria');
        }
    }

    private verificarDerrota() {
        if (this.intentosRestantes() === 0) {
        this.estadoJuego.set('perdido');
        this.guardarPartida('Derrota');
        }
    }

    private async guardarPartida(resultadoFinal: string) {
        const usuario = this.authService.usuarioActivo.value;
        const perfil = this.authService.perfilActivo.value;

        if (usuario) {
        try {
            const { error } = await this.authService.client.from('puntajes_ahorcado').insert({
            usuario_id: usuario.id,
            nombre_usuario: perfil?.nombre || 'Jugador',
            resultado: resultadoFinal,
            letras_seleccionadas: this.letrasUsadas().length
            });

            if (error) throw error;
            console.log("¡Partida guardada en la base de datos con éxito!");
        } catch (err) {
            console.error("Error al guardar partida:", err);
        }
        }
    }
}