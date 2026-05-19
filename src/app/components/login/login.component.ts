import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  
  mensajeError = signal<string>('');
  cargando = signal<boolean>(false);
  mostrarPassword = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(30)]]
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
      await this.loginService.procesarLogin(this.loginForm.value);
      
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.mensajeError.set(error.message); // Si el servicio lanza un error lo mostramos
    } finally {
      this.cargando.set(false);
    }
  }

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