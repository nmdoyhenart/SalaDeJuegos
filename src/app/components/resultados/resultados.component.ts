import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ResultadosService } from '../../services/resultados.service';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, DatePipe], 
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.css']
})
export class ResultadosComponent implements OnInit {
  private resultadosService = inject(ResultadosService);

  pestaniaActiva = signal<'snake' | 'preguntados' | 'mayormenor' | 'ahorcado'>('snake');

  rankingSnake = signal<any[]>([]);
  rankingPreguntados = signal<any[]>([]);
  rankingMayorMenor = signal<any[]>([]);
  rankingAhorcado = signal<any[]>([]);

  cargando = signal<boolean>(true);

  async ngOnInit() {
    this.cargando.set(true);
    
    const [snake, preguntados, mayorMenor, ahorcado] = await Promise.all([
      this.resultadosService.getResultadosSnake(),
      this.resultadosService.getResultadosPreguntados(),
      this.resultadosService.getResultadosMayorMenor(),
      this.resultadosService.getResultadosAhorcado()
    ]);

    this.rankingSnake.set(snake);
    this.rankingPreguntados.set(preguntados);
    this.rankingMayorMenor.set(mayorMenor);
    this.rankingAhorcado.set(ahorcado);
    
    this.cargando.set(false);
  }

  cambiarPestania(juego: 'snake' | 'preguntados' | 'mayormenor' | 'ahorcado') {
    this.pestaniaActiva.set(juego);
  }
}