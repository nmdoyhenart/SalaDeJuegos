import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // 1. Cargar el historial de mensajes
  async obtenerMensajes() {
    const { data, error } = await this.supabase
      .from('mensajes')
      .select('*')
      .order('created_at', { ascending: true }); // Los más viejos arriba, nuevos abajo
    
    if (error) throw error;
    return data;
  }

  // 2. Enviar un nuevo mensaje a la tabla
  async enviarMensaje(emisor: string, texto: string) {
    const { error } = await this.supabase
      .from('mensajes')
      .insert([{ emisor, texto }]);
      
    if (error) throw error;
  }

  // 3. Suscribirse al canal en TIEMPO REAL
  suscribirseAlChat(callback: (nuevoMensaje: any) => void) {
    return this.supabase
      .channel('public:mensajes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, payload => {
        // Cuando alguien inserta un mensaje, Supabase avisa
        callback(payload.new);
      })
      .subscribe();
  }
}