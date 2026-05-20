import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface Carta {
  valor: number;    // Para comparar (1 a 13)
  mostrar: string;  // Para imprimir (A, 2, 3... J, Q, K)
  palo: string;     // ♥, ♦, ♣, ♠
  color: string;    // 'red' o 'black'
}

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.css']
})
export class MayorMenorComponent implements OnInit {
  mazo: Carta[] = [];
  
  // Signals para controlar el estado y forzar la actualización visual
  cartaActual = signal<Carta | null>(null);
  aciertos = signal<number>(0);
  estadoJuego = signal<'jugando' | 'perdido'>('jugando');
  mostrarAyuda = signal<boolean>(false);
  rachaActual = signal<number>(0);
  intentos = signal<number>(1);

  private authService = inject(AuthService);

  ngOnInit() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.aciertos.set(0);
    this.estadoJuego.set('jugando');
    this.crearMazo();
    this.mezclarMazo();
    this.cartaActual.set(this.sacarCarta());
  }

  crearMazo() {
    this.mazo = [];
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

        this.mazo.push({ valor: i, mostrar, palo: p.simbolo, color: p.color });
      }
    }
  }

  mezclarMazo() {
    for (let i = this.mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.mazo[i], this.mazo[j]] = [this.mazo[j], this.mazo[i]];
    }
  }

  sacarCarta(): Carta {
    // Si nos quedamos sin cartas, creamos un mazo nuevo automáticamente
    if (this.mazo.length === 0) {
      this.crearMazo();
      this.mezclarMazo();
    }
    return this.mazo.pop()!;
  }

  adivinar(eleccion: 'mayor' | 'menor') {
    if (this.estadoJuego() !== 'jugando') return;

    const cartaAnterior = this.cartaActual();
    const nuevaCarta = this.sacarCarta();
    
    // Mostramos la nueva carta en pantalla
    this.cartaActual.set(nuevaCarta);

    // Si el valor es idéntico (ej: sale un 8 y luego otro 8), lo consideramos "empate" y el jugador no pierde, pero tampoco suma.
    if (cartaAnterior!.valor === nuevaCarta.valor) {
      return; 
    }

    const esMayor = nuevaCarta.valor > cartaAnterior!.valor;

    if ((eleccion === 'mayor' && esMayor) || (eleccion === 'menor' && !esMayor)) {
      // ¡Acertó!
      this.aciertos.update(v => v + 1);
    } else {
      // ¡Perdió!
      this.estadoJuego.set('perdido');
      this.guardarPartida();
    }
  }

  async guardarPartida() {
    const usuario = this.authService.usuarioActivo.value;
    const perfil = this.authService.perfilActivo.value;

    if (usuario && this.aciertos() > 0) {
      try {
        await this.authService.client.from('puntajes_mayor_menor').insert({
          usuario_id: usuario.id,
          nombre_usuario: perfil?.nombre || 'Jugador',
          aciertos: this.aciertos()
        });
      } catch (err) {
        console.error("Error al guardar partida:", err);
      }
    }
  }

  toggleAyuda() {
    this.mostrarAyuda.update(valor => !valor);
  }
}