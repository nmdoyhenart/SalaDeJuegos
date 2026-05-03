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
  
  // Transformamos las variables en Signals para evitar que la pantalla se congele
  mensajeError = signal<string>('');
  cargando = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required, Validators.min(18)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    // Encendemos el signal de carga y limpiamos errores
    this.cargando.set(true);
    this.mensajeError.set('');

    try {
      await this.authService.registrarUsuario(this.registroForm.value);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error crudo devuelto:', error);
      
      const mensaje = error?.message || '';

      // Atrapamos tanto el error de Auth como el de Base de Datos (duplicate key)
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
}