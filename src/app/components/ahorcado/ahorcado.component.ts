import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.css']
})
export class AhorcadoComponent implements OnInit {
  // Letras para los botones
  abecedario = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  palabrasPosibles = [
    { palabra: 'ANGULAR', pista: 'Framework de Google para el frontend' },
    { palabra: 'SUPABASE', pista: 'Alternativa open-source a Firebase con PostgreSQL' },
    { palabra: 'TYPESCRIPT', pista: 'El lenguaje que le da superpoderes (tipado) a JavaScript' },
    { palabra: 'PROGRAMACION', pista: 'El arte de darle instrucciones a una computadora' },
    { palabra: 'ARCADE', pista: 'Máquina de videojuegos clásica de salón' },
    { palabra: 'JUEGOS', pista: 'Lo que estamos desarrollando en este TP' }
  ]; // + pistas
  
  palabraSecreta = '';
  pistaActual = '';
  palabraOculta: string[] = [];
  letrasUsadas: string[] = [];
  intentosRestantes = signal<number>(6);
  estadoJuego = signal<'jugando' | 'ganado' | 'perdido'>('jugando');
  mostrarAyuda = signal<boolean>(false);

  private authService = inject(AuthService);

  ngOnInit() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.estadoJuego.set('jugando');
    this.intentosRestantes.set(6);
    this.letrasUsadas = [];
    
    // Seleccionamos el objeto completo (palabra + pista) al azar
    const indice = Math.floor(Math.random() * this.palabrasPosibles.length);
    const seleccion = this.palabrasPosibles[indice];
    
    this.palabraSecreta = seleccion.palabra;
    this.pistaActual = seleccion.pista; // Asignamos la pista
    
    this.palabraOculta = Array(this.palabraSecreta.length).fill('_');
  }

  presionarLetra(letra: string) {
    if (this.estadoJuego() !== 'jugando' || this.letrasUsadas.includes(letra)) return;

    this.letrasUsadas.push(letra);

    if (this.palabraSecreta.includes(letra)) {
      // Descubrimos la letra en la palabra oculta
      for (let i = 0; i < this.palabraSecreta.length; i++) {
        if (this.palabraSecreta[i] === letra) {
          this.palabraOculta[i] = letra;
        }
      }
      this.verificarVictoria();
    } else {
      // Restamos intento si se equivoca
      this.intentosRestantes.update(v => v - 1);
      this.verificarDerrota();
    }
  }

  dibujosAhorcado: string[] = [
    // 0 vidas
    `  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========`,
    // 1 vida
    `  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========`,
    // 2 vidas
    `  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========`,
    // 3 vidas
    `  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========`,
    // 4 vidas
    `  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========`,
    // 5 vidas
    `  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========`,
    // 6 vidas
    `  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========`
  ];

  obtenerDibujoAscii(): string {
    return this.dibujosAhorcado[this.intentosRestantes()];
  }

  verificarVictoria() {
    if (!this.palabraOculta.includes('_')) {
      this.estadoJuego.set('ganado');
      this.guardarPartida('Victoria');
    }
  }

  verificarDerrota() {
    if (this.intentosRestantes() === 0) {
      this.estadoJuego.set('perdido');
      this.guardarPartida('Derrota');
    }
  }

  async guardarPartida(resultadoFinal: string) {
    // Obtener el usuario que está jugando
    const usuario = this.authService.usuarioActivo.value;
    const perfil = this.authService.perfilActivo.value;

    if (usuario) {
      try {
        const { error } = await this.authService.client.from('puntajes_ahorcado').insert({
          usuario_id: usuario.id,
          nombre_usuario: perfil?.nombre || 'Jugador',
          resultado: resultadoFinal,
          letras_seleccionadas: this.letrasUsadas.length
        });

        if (error) throw error;
        console.log("¡Partida guardada en la base de datos con éxito!");
      } catch (err) {
        console.error("Error al guardar partida:", err);
      }
    }
  }

  toggleAyuda() {
    this.mostrarAyuda.update(valor => !valor);
  }
}