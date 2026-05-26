import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MayorMenorService } from '../../services/mayor-menor.service';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.css']
})
export class MayorMenorComponent implements OnInit {
  private mayorMenorService = inject(MayorMenorService);

  private _mostrarAyuda = signal<boolean>(false); // Propiedade visual del componente

  // --- GETTERS PARA QUE EL HTML LEA LOS DATOS ---
  // Visuales:
  get mostrarAyuda() { return this._mostrarAyuda; }
  
  // Del Servicie:
  get cartaActual() { return this.mayorMenorService.cartaActual; }
  get aciertos() { return this.mayorMenorService.aciertos; }
  get estadoJuego() { return this.mayorMenorService.estadoJuego; }
  get rachaActual() { return this.mayorMenorService.rachaActual; }
  get intentos() { return this.mayorMenorService.intentos; }

  ngOnInit() {
    this.mayorMenorService.iniciarJuego();
  }

  adivinar(eleccion: 'mayor' | 'menor') {
    this.mayorMenorService.adivinar(eleccion);
  }

  iniciarJuego() {
    this.mayorMenorService.iniciarJuego();
  }

  toggleAyuda() {
    this._mostrarAyuda.update(valor => !valor);
  }
}