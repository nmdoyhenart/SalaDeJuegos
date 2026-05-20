import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service'; // Verifica que la ruta coincida con tu carpeta

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('sala-juegos-TP1');
  
  // Usamos un signal para manejar el estado del usuario reactivamente
  usuarioLogueado = signal<any>(null);

  // Signal para guardar el perfil
  perfilJugador = signal<any>(null);

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Escuchamos a nuestro servicio y actualizamos el signal cuando alguien entra o sale
    this.authService.usuarioActivo.subscribe(user => {
      this.usuarioLogueado.set(user);
    });

    this.authService.perfilActivo.subscribe(perfil => {
        this.perfilJugador.set(perfil);
      });
  }

  cerrarSesion() {
    // 1. Limpiamos los signals de la pantalla inmediatamente
    this.usuarioLogueado.set(null);
    this.perfilJugador.set(null);
    
    // 2. Disparamos la limpieza total en tu servicio
    this.authService.cerrarSesion();
    
    // 3. Te mandamos de un flechazo al Login sin esperar a Supabase
    this.router.navigate(['/login']);
  }
}