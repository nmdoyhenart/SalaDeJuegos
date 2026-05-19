import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  private _usuarioLogueado: any = null; // Encapsulamos la info del usuario logueado en una variable privada
  perfilJugador = signal<Usuario | null>(null); // Usamos un signal tipado con tu modelo Usuario para los datos de la BDD
  private authService = inject(AuthService);

  // Getter para que el HTML pueda leer si hay alguien conectado
  get usuarioLogueado() {
    return this._usuarioLogueado;
  }

  ngOnInit() {
    // Detecta si hay una sesión activa
    this.authService.usuarioActivo.subscribe(user => {
      this._usuarioLogueado = user;
    });

    // Trae los datos desde la tabla de tu base de datos
    this.authService.perfilActivo.subscribe((perfil: Usuario | null) => {
      this.perfilJugador.set(perfil);
    });
  }

  // Nueva función para desloguearse (para el botón rojo)
  async cerrarSesion() {
    try {
      await this.authService.cerrarSesion();
      // Al cerrar sesión, los observables automáticamente van a actualizar
      // las variables a null, y el HTML ocultará los juegos.
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
