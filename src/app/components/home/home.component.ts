import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  usuarioLogueado: any = null;
  perfilJugador = signal<any>(null);

  private authService = inject(AuthService);

  ngOnInit() {
    // Suscripción 1: Escucha al usuario base
    this.authService.usuarioActivo.subscribe(user => {
      this.usuarioLogueado = user;
    });

    // Suscripción 2: Escucha al perfil de la base de datos (independiente)
    this.authService.perfilActivo.subscribe(perfil => {
      this.perfilJugador.set(perfil);
    });
  }
}