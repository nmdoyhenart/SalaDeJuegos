import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: 'login.html', 
  styleUrls: ['login.css']
})
export class LoginComponent {
  private router = inject(Router);
  mostrarModal = signal<boolean>(false);

  abrirModal() {
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  navegarAlHome() {
    this.mostrarModal.set(false);
    this.router.navigate(['/home']);
  }
}