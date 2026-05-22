import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AhorcadoService } from '../../services/ahorcado.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.css']
})
export class AhorcadoComponent implements OnInit {
  private _abecedario = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  private _mostrarAyuda = signal<boolean>(false);

  private ahorcadoService = inject(AhorcadoService);

  // 2. GETTERS PARA QUE EL HTML LEA LAS PROPIEDADES VISUALES
  get abecedario() { return this._abecedario; }
  get mostrarAyuda() { return this._mostrarAyuda; }

  // GETTERS PARA HTML CON SIGNALS DEL SERVICE
  get pistaActual() { return this.ahorcadoService.pistaActual; }
  get palabraOculta() { return this.ahorcadoService.palabraOculta; }
  get letrasUsadas() { return this.ahorcadoService.letrasUsadas; }
  get intentosRestantes() { return this.ahorcadoService.intentosRestantes; }
  get estadoJuego() { return this.ahorcadoService.estadoJuego; }
  get dibujoAscii() { return this.ahorcadoService.dibujoActual; }
  get palabraSecreta() { return this.ahorcadoService.palabraSecreta; }

  ngOnInit() {
    this.ahorcadoService.iniciarJuego();
  }

  presionarLetra(letra: string) {
    this.ahorcadoService.presionarLetra(letra);
  }
  
  reiniciarJuego() {
    this.ahorcadoService.iniciarJuego();
  }

  toggleAyuda() {
    this._mostrarAyuda.update(valor => !valor);
  }
}