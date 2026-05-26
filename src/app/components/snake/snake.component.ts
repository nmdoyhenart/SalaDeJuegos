import { Component, ElementRef, HostListener, OnInit, ViewChild, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SnakeService } from '../../services/snake.service';

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './snake.html',
  styleUrls: ['./snake.css']
})

export class SnakeComponent implements OnInit, OnDestroy {
  private snakeService = inject(SnakeService);

  // Buscamos en el HTML el elemento <canvas> que marcamos con tag '#gameCanvas'.
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private contexto!: CanvasRenderingContext2D; // Nuestra herramienta para dibujar graficos en el tablero
  
  // Variable para guardar el identificador numerico de la animacion
  // y poder detenerla cuando el usuario se vaya de la pagina
  private idAnimacion: number | null = null;
  private _mostrarAyuda = signal<boolean>(false);

  // --- GETTERS HTML ---
  get mostrarAyuda() { 
    return this._mostrarAyuda; 
  }

  get estadoJuego() { 
    return this.snakeService.estadoJuego; 
  }

  get puntaje() { 
    return this.snakeService.puntaje; 
  }

  toggleAyuda() {
    this._mostrarAyuda.update(v => !v);
  }

  iniciarEjecucion() {
    this.snakeService.iniciarJuego();
  }

  ngOnInit() {
    this.snakeService.resetearJuego();

    // Config del contexto, le decimos al canvas que vamos a dibujar en 2 dimensiones
    this.contexto = this.canvasRef.nativeElement.getContext('2d')!;
    
    this.iniciarBucleRenderizado(); // Disparar bucle
  }

  ngOnDestroy() {
    if (this.idAnimacion) {
      cancelAnimationFrame(this.idAnimacion);
    }
  }

  // Escuchamos los eventos del teclado del usuario
  @HostListener('window:keydown', ['$event'])
  capturarTeclado(event: KeyboardEvent) {
    this.snakeService.cambiarDireccion(event.key);
    
    // Si el usuario presiono cualquiera anulamos el comportamiento natural del navegador
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'W', 'w', 'S', 's', 'A', 'a', 'D', 'd', ' '].includes(event.key)) {
      event.preventDefault();
    }
  }

  private iniciarBucleRenderizado() {
    // Declaramos una función flecha que representa un fotograma
    const loopRender = () => {
      this.dibujarCanvas();
      
      this.idAnimacion = requestAnimationFrame(loopRender); // Le pedimos al navegador que vuelva a llamar
      // a la función para generar el proximo fotograma
    };

    this.idAnimacion = requestAnimationFrame(loopRender);
  }

  private dibujarCanvas() {
    // Traemos el tamaño y la cantidad de las celdas
    const tamanoGrilla = this.snakeService.tamanoGrilla;
    const cantidadCeldas = this.snakeService.cantidadCeldas;
    
    // Desempaquetamos los valores actuales de los signals
    const cuerpo = this.snakeService.cuerpoSnake();
    const comida = this.snakeService.comida();

    this.contexto.fillStyle = '#0d0d1a';

    // Dibujamos un rectángulo que tapa todo el canvas para "borrar" el fotograma viejo
    this.contexto.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    this.contexto.strokeStyle = 'rgba(0, 255, 136, 0.03)'; // Bordes de las celdas
    
    // Un bucle for que itera 20 veces para armar la rejilla del fondo
    for (let i = 0; i < cantidadCeldas; i++) {
      // Empezamos a dibujar el trazo de la linea vertical.
      this.contexto.beginPath();
      this.contexto.moveTo(i * tamanoGrilla, 0); // Nos posicionamos arriba
      this.contexto.lineTo(i * tamanoGrilla, this.canvasRef.nativeElement.height); // Trazamos hasta abajo
      this.contexto.stroke(); // Pintamos la linea
      
      // Mismo proceso para trazar la linea horizontal.
      this.contexto.beginPath();
      this.contexto.moveTo(0, i * tamanoGrilla); // Nos posicionamos a la izquierda
      this.contexto.lineTo(this.canvasRef.nativeElement.width, i * tamanoGrilla); // Trazamos hasta la der
      this.contexto.stroke(); // Pintamos la linea.
    }

    this.contexto.fillStyle = '#00ff88';
    this.contexto.shadowBlur = 12; // Desenfoque de 12px para generar efecto de aura neón.
    this.contexto.shadowColor = '#00ff88';
    
    // Pintamos un cuadrado en las coordenadas de la comida
    // y le restamos 4px para que no toque los bordes de la celda
    this.contexto.fillRect(comida.x * tamanoGrilla + 2, comida.y * tamanoGrilla + 2, tamanoGrilla - 4, tamanoGrilla - 4);

    // Cambiamos el aura neón de color para diferenciar a la serpiente de la comida
    this.contexto.shadowColor = '#00f0ff';
    // Bajamos el desenfoque a 8px para que la serpiente se vea mas que la comida
    this.contexto.shadowBlur = 8;
    
    // Iteramos por cada una de las coordenadas guardadas en el vector de la serpiente
    cuerpo.forEach((segmento, indice) => {
      // Condicional ternario: Si es el indice 0 (la cabeza), la pintamos de blanco 
      // si es el resto del cuerpo, de celeste
      this.contexto.fillStyle = indice === 0 ? '#ffffff' : '#00f0ff';
      // Dibujamos el cuadrado correspondiente a ese fragmento de cuerpo en la posición exacta
      this.contexto.fillRect(segmento.x * tamanoGrilla + 1, segmento.y * tamanoGrilla + 1, tamanoGrilla - 2, tamanoGrilla - 2);
    });

    // Apagamos las sombras para evitar problemas de rendimiento en el prox fotograma
    this.contexto.shadowBlur = 0;
  }
}