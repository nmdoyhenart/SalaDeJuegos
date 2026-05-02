import { Component, inject } from '@angular/core';
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
  mensajeError: string = '';
  cargando: boolean = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Creación del form con validación
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required, Validators.min(18)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    // Si el form no es válido, no hace nada
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = 'Error al registrar el usuario. Por favor, inténtalo de nuevo.';

    try {
      // Llamamos al servicio Supabase
      await this.authService.registrarUsuario(this.registroForm.value);
      
      // Si no hubo error, navegamos directo al Home
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error al registrar:', error);
      // Validamos si el error es porque el correo ya existe
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        this.mensajeError = 'Este correo ya se encuentra registrado.';
      } else {
        this.mensajeError = 'Ocurrió un error al intentar registrarse.';
      }
    } finally {
      this.cargando = false;
    }
  }
}