import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';   
import { RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat.service'; 

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private platformId = inject(PLATFORM_ID);

  nuevoMensaje = signal<string>(''); // Variable de control para la vista

  // Getters conexion HTML
  get mensajes() { return this.chatService.mensajes; }
  get usuarioActual() { return this.chatService.usuarioActual; }
  get estaLogueado() { return this.chatService.estaLogueado; }

  constructor() {
    effect(() => { // Autoscroll cada vez que llegan mensajes nuevos
      const msgs = this.mensajes(); 
      if (msgs.length > 0) {
        this.hacerScrollHaciaAbajo();
      }
    });
  }

  ngOnInit() {
    // Le pasamos el control al service
    this.chatService.inicializarChat(isPlatformBrowser(this.platformId));
  }

  ngOnDestroy() {
    this.chatService.destruirChat();
  }

  async enviar() {
    const texto = this.nuevoMensaje().trim();
    if (!texto) return;

    try {
      this.nuevoMensaje.set(''); // Limpiar input en pantalla

      await this.chatService.enviarMensaje(texto);
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