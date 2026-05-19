import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, RouterModule],
  templateUrl: 'registro.html',
  styleUrls: ['registro.css']
})
export class RegistroComponent {
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