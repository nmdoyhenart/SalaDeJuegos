import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { ChatService } from '../../services/chat'; 
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService); // Para sacar el correo del usuario logueado

  mensajes = signal<any[]>([]);
  nuevoMensaje = signal<string>('');
  usuarioActual = signal<string>('');
  
  private subscripcionChat: any;

  async ngOnInit() {
    // 1. Obtener quién soy yo (para diferenciar mis mensajes de los del resto)
    const emailLogueado = await this.authService.obtenerUsuarioActual(); 
    this.usuarioActual.set(emailLogueado);

    // 2. Cargar historial
    const historial = await this.chatService.obtenerMensajes();
    this.mensajes.set(historial);

    // 3. Suscribirse a los mensajes en tiempo real
    this.subscripcionChat = this.chatService.suscribirseAlChat((nuevoMsg) => {
      // Actualizamos el signal sumando el mensaje nuevo al final del array
      this.mensajes.update(msgs => [...msgs, nuevoMsg]);
      this.hacerScrollHaciaAbajo();
    });
    
    this.hacerScrollHaciaAbajo();
  }

  ngOnDestroy() {
    // Desuscribirse al salir de la sala para no dejar conexiones abiertas ("Memory Leaks")
    if (this.subscripcionChat) {
      this.subscripcionChat.unsubscribe();
    }
  }

  async enviar() {
    const texto = this.nuevoMensaje().trim();
    if (!texto) return;

    try {
      // Borramos el input inmediatamente
      this.nuevoMensaje.set(''); 
      await this.chatService.enviarMensaje(this.usuarioActual(), texto);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }

  hacerScrollHaciaAbajo() {
    setTimeout(() => {
      const chatBox = document.getElementById('chat-container');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);
  }
}