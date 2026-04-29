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
    private cdr: ChangeDetectorRef // Fuerza el dibujado en pantalla
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get('https://api.github.com/users/nmdoyhenart')
        .subscribe({
          next: (data) => {
            this.perfilGithub = data;
            this.huboError = false;
        
            this.cdr.detectChanges(); // Si pasa la validación fuerza a mostrar los datos
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