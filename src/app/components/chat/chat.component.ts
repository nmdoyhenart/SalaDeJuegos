import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';   
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service'; 
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  mensajes = signal<any[]>([]);
  nuevoMensaje = signal<string>('');
  
  // null = sin strings falsos
  usuarioActual = signal<string | null>(null); 
  estaLogueado = signal<boolean>(false);
  
  private subscripcionChat: any;
  private subscripcionAuth!: Subscription; // Guardamos la suscripción del vigilante

  ngOnInit() {
    // 1. Nos suscribimos 'perfilActivo'
    this.subscripcionAuth = this.authService.perfilActivo.subscribe(async (perfil) => {
      
      // 2. Verificamos que el perfil ya se haya cargado y tenga un nombre
      if (perfil && perfil.nombre) {
        // === EL USUARIO ESTÁ LOGUEADO ===
        this.estaLogueado.set(true);
        
        // Guardamos su nombre real como identificador
        this.usuarioActual.set(perfil.nombre); 

        // Cargamos el historial real
        const historial = await this.chatService.obtenerMensajes();
        this.mensajes.set(historial);

        // Limpiamos cualquier suscripción vieja por las dudas
        if (this.subscripcionChat) {
          this.subscripcionChat.unsubscribe();
        }

        // Nos suscribimos al tiempo real (solo en el navegador)
        if (isPlatformBrowser(this.platformId)) {
          this.subscripcionChat = this.chatService.suscribirseAlChat((nuevoMsg) => {
            this.mensajes.update(msgs => [...msgs, nuevoMsg]);
            this.hacerScrollHaciaAbajo();
          });
          this.hacerScrollHaciaAbajo();
        }

      } else {
        // === EL USUARIO CERRÓ SESIÓN O ES INVITADO ===
        this.estaLogueado.set(false);
        this.usuarioActual.set(null); 
        
        if (this.subscripcionChat) {
          this.subscripcionChat.unsubscribe();
          this.subscripcionChat = null;
        }

        // Inyectamos los mensajes de relleno
        this.mensajes.set([
          { id: 1, emisor: 'Sistema', texto: 'Iniciando conexión cifrada...', created_at: new Date() },
          { id: 2, emisor: 'Anónimo', texto: '¿Alguien para jugar Mayor o Menor?', created_at: new Date() },
          { id: 3, emisor: 'Usuario 1', texto: 'Alguien podria superarme? no lo creo.', created_at: new Date() }
        ]);
      }
    });
  }

  ngOnDestroy() {
    // Al salir de la sala principal, matamos ambas suscripciones para evitar Memory Leaks
    if (this.subscripcionChat) this.subscripcionChat.unsubscribe();
    if (this.subscripcionAuth) this.subscripcionAuth.unsubscribe();
  }

  async enviar() {
    const texto = this.nuevoMensaje().trim();
    const emisor = this.usuarioActual();
    
    // Si no hay texto, o por algún error intenta enviar sin un emisor válido, bloqueamos el envío
    if (!texto || !emisor) return; 

    try {
      this.nuevoMensaje.set(''); 
      await this.chatService.enviarMensaje(emisor, texto);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }

  hacerScrollHaciaAbajo() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const chatBox = document.getElementById('chat-container');
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      }, 100);
    }
  }
}