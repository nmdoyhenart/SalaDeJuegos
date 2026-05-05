import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  
  // Variables en Signals para evitar pantalla freeze
  mensajeError = signal<string>('');
  cargando = signal<boolean>(false);
  mostrarPassword = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'), // Solo letras y espacios
        Validators.maxLength(50) // Límite de longitud
      ]],
      apellido: ['', [
        Validators.required, 
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'), // Solo letras y espacios
        Validators.maxLength(50)
      ]],
      edad: ['', [
        Validators.required, 
        Validators.min(18), // 18+
        Validators.max(99)
      ]],
      correo: ['', [
        Validators.required, 
        Validators.email // Formato correo@dominio.com
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6), // Seguridad mínima
        Validators.maxLength(30)
      ]]
    });
  }

  //  Este "getter" te permite acceder fácilmente a los controles en el HTML
  // Ejemplo de uso en HTML: f['nombre'].errors?.['required']
  get f() {
    return this.registroForm.controls;
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    // Llamamos el signal de carga y limpiamos errores
    this.cargando.set(true);
    this.mensajeError.set('');

    try {
      await this.authService.registrarUsuario(this.registroForm.value);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error crudo devuelto:', error);
      
      const mensaje = error?.message || '';

      // Atrapamos tanto el error de Auth como el de la BDD (duplicate key)
      if (mensaje.includes('already registered') || mensaje.includes('User already exists') || mensaje.includes('duplicate key')) {
        this.mensajeError.set('¡Este correo electrónico ya se encuentra registrado!');
      } else {
        this.mensajeError.set('Ocurrió un error al intentar registrarse. Inténtalo de nuevo.');
      }
    } finally {
      // Apagamos el signal de carga
      this.cargando.set(false);
    }
  }

  togglePassword() {
    this.mostrarPassword.update(valor => !valor);
  }
}