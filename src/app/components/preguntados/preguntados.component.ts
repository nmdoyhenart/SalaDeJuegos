import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PreguntadosService } from '../../services/preguntados.service';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.css']
})
export class PreguntadosComponent implements OnInit {
  private preguntadosService = inject(PreguntadosService);

  private _mostrarAyuda = signal<boolean>(false);

  // --- GETTERS ---
  get mostrarAyuda() { return this._mostrarAyuda; }
  get estadoJuego() { return this.preguntadosService.estadoJuego; }
  get aciertos() { return this.preguntadosService.aciertos; }
  get indiceActual() { return this.preguntadosService.indiceActual; }
  get preguntaActual() { return this.preguntadosService.preguntaActual; }

  ngOnInit() {
    this.preguntadosService.iniciarJuego();
  }

  seleccionarRespuesta(opcion: string) {
    this.preguntadosService.seleccionarRespuesta(opcion);
  }

  toggleAyuda() {
    this._mostrarAyuda.update(valor => !valor);
  }

  jugarDeNuevo() {
    this.preguntadosService.iniciarJuego();
  }
}