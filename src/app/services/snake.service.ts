import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { Punto } from '../models/punto.model';

@Injectable({
    providedIn: 'root'
})
export class SnakeService {
    private authService = inject(AuthService);

    // Limites del juego/matriz
    readonly tamanoGrilla = 20; // Tamaño en px
    readonly cantidadCeldas = 20; // Cantidad de celdas

    // --- ESTADOS REACTIVOS ---
    estadoJuego = signal<'inicio' | 'jugando' | 'perdido'>('inicio');
    puntaje = signal<number>(0);
    cuerpoSnake = signal<Punto[]>([]);
    comida = signal<Punto>({ x: 10, y: 5 }); // Las coordenadas donde comienza la comida

    // --- VARIABLES DE CONTROL ---
    // Vectores de dirección. (0, -1) = movimiento hacia arriba en el eje Y
    private velocidadX = 0;
    private velocidadY = -1;

    private bucleMatriz: any; // Variable que almacena el ID del intervalo principal del juego
    private ratioActualizacion = 110; // La velocidad del juego, movimientos de casilleros x seg

    private posicionarNodoAleatorio(): Punto {
        let nuevaPosicion: Punto;
        let conflictoEstructural = true; // Flag control de comida
        const cuerpoActual = this.cuerpoSnake();

        // Bucle que repite el calculo aleatorio MIENTRAS la comida caiga encima de la serpiente
        while (conflictoEstructural) {
            nuevaPosicion = {
                // Multiplica por 20 y redondea para abajo (ambos casos)
                x: Math.floor(Math.random() * this.cantidadCeldas), 
                y: Math.floor(Math.random() * this.cantidadCeldas)
            };
            // .some() verifica si ALGÚN segmento del cuerpo comparte las mismas coordenadas
            //  (X e Y) con la nueva comida
            conflictoEstructural = cuerpoActual.some(seg => seg.x === nuevaPosicion.x && seg.y === nuevaPosicion.y);
        }

        // Retornamos la coordenada segura asegurando que no es nula (!).
        return nuevaPosicion!;
    }

    private reconfigurarEntorno() {
        // Posiciona a la serpiente en el centro, midiendo tres bloques verticales
        this.cuerpoSnake.set([
        { x: 10, y: 10 }, // Cabeza
        { x: 10, y: 11 }, // Cuerpo medio
        { x: 10, y: 12 }  // Cola
        ]);
        // Reinicia la dirección hacia arriba.
        this.velocidadX = 0;
        this.velocidadY = -1;
        
        this.puntaje.set(0);
        this.comida.set(this.posicionarNodoAleatorio()); // Coloca la comida en una posicion aleatoria
    }

    iniciarJuego() {
        this.reconfigurarEntorno();
        this.estadoJuego.set('jugando');
        
        // Si hay un bucle corriendo lo detiene
        if (this.bucleMatriz) clearInterval(this.bucleMatriz);
        
        // Iniciar bucle 
        this.bucleMatriz = setInterval(() => this.actualizarCicloFisica(), this.ratioActualizacion);
    }

    cambiarDireccion(tecla: string) {
        // Si el jugador ya perdió o está en el menú, ignora las teclas.
        if (this.estadoJuego() !== 'jugando') return;

        // Evaluamos que tecla se acciono
        switch (tecla) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            // Si no está bajando (velocidadY !== 1) le permitimos subir
            if (this.velocidadY !== 1) { this.velocidadX = 0; this.velocidadY = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            // Si no está subiendo se le permite bajar
            if (this.velocidadY !== -1) { this.velocidadX = 0; this.velocidadY = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            // Si no está yendo a la derecha le permitimos ir a la izquierda
            if (this.velocidadX !== 1) { this.velocidadX = -1; this.velocidadY = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            // Si no está yendo a la izquierda le permitimos ir a la derecha
            if (this.velocidadX !== -1) { this.velocidadX = 1; this.velocidadY = 0; }
            break;
        }
    }

    // Calcula físicas, colisiones y movimientos
    private actualizarCicloFisica() {
        if (this.estadoJuego() !== 'jugando') return;

        // Extraemos el valor actual del cuerpo (el array de coordenadas).
        const cuerpoActual = this.cuerpoSnake();
        // Proyectamos donde va a estar la cabeza en el próximo movimiento sumando los vectores actuales.
        const nuevaCabeza = { 
        x: cuerpoActual[0].x + this.velocidadX, 
        y: cuerpoActual[0].y + this.velocidadY 
        };

        // Control de choque contra los bordes de la pantalla
        // Verificamos si la nueva coordenada X o Y se salio de la matriz (> 0 o < 19)
        if (nuevaCabeza.x < 0 || nuevaCabeza.x >= this.cantidadCeldas || nuevaCabeza.y < 0 || nuevaCabeza.y >= this.cantidadCeldas) {
            this.finalizarSistema(); // Game Over
            return; // Cortamos la ejecución de la función
        }

        // Control de choque contra el propio cuerpo
        // Recorremos cada segmento del cuerpo para ver si comparte coordenadas con la nueva cabeza
        for (const segmento of cuerpoActual) {
            if (segmento.x === nuevaCabeza.x && segmento.y === nuevaCabeza.y) {
                this.finalizarSistema();
                return;
            }
        }

        // Avance del vector posicional
        // Creamos un nuevo array poniendo la nueva cabeza en la primer pos
        // y copiamos el resto del cuerpo atras
        const nuevoCuerpo = [nuevaCabeza, ...cuerpoActual];
        
        const comidaaActual = this.comida(); // Consultamos donde está la comida

        // Absorción de comida
        // Chequeamos si la cabeza pisó exactamente la coordenada de la comida
        if (nuevaCabeza.x === comidaaActual.x && nuevaCabeza.y === comidaaActual.y) {
            this.puntaje.update(p => p + 10); // Sumamos el puntaje
            this.comida.set(this.posicionarNodoAleatorio()); // Creamos una nueva comida en otro lado
            
        } else {
            // Si NO comio, quitamos el ultimo elemento del array (la cola)
            // agregamos una cabeza adelante y borramos la cola atras
            nuevoCuerpo.pop(); 
        }

        this.cuerpoSnake.set(nuevoCuerpo);
    }

    private finalizarSistema() {
        if (this.bucleMatriz) clearInterval(this.bucleMatriz);
        this.estadoJuego.set('perdido');
        
        this.guardarPartida();
    }

    private async guardarPartida() {
        // Obtenemos los datos del usuario logueado
        const usuario = this.authService.usuarioActivo.value;
        const perfil = this.authService.perfilActivo.value;

        if (usuario) {
            try {
                // Hacemos el INSERT en la tabla de la BDD
                const { error } = await this.authService.client.from('puntajes_snake').insert({
                    usuario_id: usuario.id,
                    nombre_usuario: perfil?.nombre || 'Jugador',
                    puntaje: this.puntaje() // Extraemos el valor del llamando a la funcion
                });
                
                if (error) throw error;
                console.log("¡Partida de Snake guardada en Supabase!");
            } catch (err) {
                
                console.error("Error al persistir puntaje de Snake:", err);
            }
        }
    }

    resetearJuego() {
        this.estadoJuego.set('inicio');
        this.reconfigurarEntorno();
        
        if (this.bucleMatriz) {
            clearInterval(this.bucleMatriz);
        }
    }
}