import { Component, inject } from '@angular/core';
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
  mensajeError: string = '';
  cargando: boolean = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Reemplaza estos correos y claves por usuarios que hayas registrado de verdad
  usuariosPrueba = [
    { correo: 'adm@gmail.com', clave: '123456', etiqueta: 'Admin' }, 
    { correo: 'ale@hotmail.com', clave: 'alejandra', etiqueta: 'Jugador 1' },
  ];

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    try {
      const { correo, password } = this.loginForm.value;
      await this.authService.iniciarSesion(correo, password);
      
      // Si las credenciales son correctas, navegamos al Home
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      this.mensajeError = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
    } finally {
      this.cargando = false;
    }
  }

  // Método para el llenado rápido
  accesoRapido(usuario: any) {
    this.loginForm.patchValue({
      correo: usuario.correo,
      password: usuario.clave
    });
  }
}