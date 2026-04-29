import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [], 
  templateUrl: './quien-soy.html',
  styleUrls: ['./quien-soy.css']
})
export class QuienSoyComponent implements OnInit {
  perfilGithub: any = null; 
  huboError: boolean = false; 

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef // <-- Herramienta para forzar el dibujado en pantalla
  ) {}

  ngOnInit(): void {
    // 1. Verificamos que estamos en el navegador del usuario y no en el servidor de Vercel
    if (isPlatformBrowser(this.platformId)) {
      
      this.http.get('https://api.github.com/users/nmdoyhenart')
        .subscribe({
          next: (data) => {
            this.perfilGithub = data;
            this.huboError = false;
            // 2. Le decimos explícitamente a Angular: "Ya llegaron los datos, actualiza el HTML ahora"
            this.cdr.detectChanges(); 
          },
          error: (error) => {
            console.error('Error de la API:', error);
            this.huboError = true;
            this.cdr.detectChanges();
          }
        });
    }
  }
}