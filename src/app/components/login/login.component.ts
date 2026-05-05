import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  
  // Variables en Signals para evitar pantalla freeze
  mensajeError = signal<string>('');
  cargando = signal<boolean>(false);
  mostrarPassword = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(30)]] // No está vacío
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    try {
      const correo = this.loginForm.value.correo;
      const contrasena = this.loginForm.value.password;

      await this.authService.iniciarSesion(correo, contrasena);
      
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      
      const mensaje = error?.message || '';

      // Atrapamos el error de 'contraseña incorrecta'
      if (mensaje.includes('Invalid login credentials') || mensaje.includes('Invalid')) {
        this.mensajeError.set('Correo o contraseña incorrectos.');
      } else {
        this.mensajeError.set('Ocurrió un error al intentar iniciar sesión.');
      }
    } finally {
      this.cargando.set(false);
    }
  }

  // Función para autocompletar el formulario rápidamente
  cargarUsuarioPrueba(opcion: number) {
    switch (opcion) {
      case 1:
        this.loginForm.patchValue({ correo: 'pablojuan@gmail.com', password: 'juanpablo' });
        break;
      case 2:
        this.loginForm.patchValue({ correo: 'santif@gmail.com', password: 'santino' });
        break;
      case 3:
        this.loginForm.patchValue({ correo: 'logomez@gmail.com', password: 'lorenzo' });
        break;
    }
  }

  togglePassword() {
    this.mostrarPassword.update(valor => !valor);
  }
}