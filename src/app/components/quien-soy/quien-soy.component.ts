import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GithubService } from '../../services/github.service';
import { GithubUser } from '../../models/github-user.model';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrls: ['./quien-soy.css']
})
export class QuienSoyComponent implements OnInit {
  // Variables estrictamente privadas (seguras).
  // La convención es ponerles un guión bajo (_) adelante.
  private _perfilGithub: GithubUser | null = null; 
  private _huboError: boolean = false; 

  private githubService = inject(GithubService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  // Getters de "solo lectura"
  get perfilGithub(): GithubUser | null {
    return this._perfilGithub;
  }

  get huboError(): boolean {
    return this._huboError;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.githubService.obtenerPerfil().subscribe({
        next: (data: GithubUser) => {
          this._perfilGithub = data; // Modificamos la variable privada
          this._huboError = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar perfil: ', error);
          this._huboError = true; // Modificamos la variable privada
          this.cdr.detectChanges();
        }
      });
    }
  }
}