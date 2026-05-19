import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegistroService } from '../../services/registro.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  
  mensajeError = signal<string>('');
  cargando = signal<boolean>(false);
  mostrarPassword = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private registroService = inject(RegistroService);
  private router = inject(Router);

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'), Validators.maxLength(50)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]]
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    try {
      await this.registroService.procesarRegistro(this.registroForm.value);
      
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.mensajeError.set(error.message); // El servicio ya devolvió el error y solo lo mostramos
    } finally {
      this.cargando.set(false);
    }
  }

  togglePassword() {
    this.mostrarPassword.update(valor => !valor);
  }
}