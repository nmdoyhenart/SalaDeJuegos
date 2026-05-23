import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private supabase: SupabaseClient;
  private authService = inject(AuthService);

  // SIGNALS (ESTADO)
  private _mensajes = signal<any[]>([]);
  private _usuarioActual = signal<string | null>(null);
  private _estaLogueado = signal<boolean>(false);

  // Guardamos las suscripciones para poder limpiarlas
  private subscripcionAuth?: Subscription;
  private canalSuscripcion?: any; // Canal Supabase

  // GETTERS PÚBLICOS
  get mensajes() { return this._mensajes; }
  get usuarioActual() { return this._usuarioActual; }
  get estaLogueado() { return this._estaLogueado; }

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  inicializarChat(isBrowser: boolean) {
    // El servicio escucha al AuthService
    this.subscripcionAuth = this.authService.perfilActivo.subscribe(async (perfil) => {
      
      if (perfil && perfil.nombre) {
        // MODO LOGUEADO
        this._estaLogueado.set(true);
        this._usuarioActual.set(perfil.nombre);
        await this.cargarHistorial();

        if (isBrowser) {
          this.suscribirseAlChat();
        }
      } else {
        // MODO DESCONECTADO (Invitados)
        this.setModoDesconectado();
      }
    });
  }

  private async cargarHistorial() {
    const { data, error } = await this.supabase
      .from('mensajes')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error cargando historial:', error);
      return;
    }
    this._mensajes.set(data || []);
  }

  private suscribirseAlChat() {
    // Limpiamos canales previos
    if (this.canalSuscripcion) this.supabase.removeChannel(this.canalSuscripcion);

    this.canalSuscripcion = this.supabase
      .channel('public:mensajes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, payload => {
        // Actualizamos la lista de mensajes
        this._mensajes.update(msgs => [...msgs, payload.new]);
      })
      .subscribe();
  }

  private setModoDesconectado() {
    this._estaLogueado.set(false);
    this._usuarioActual.set(null);
    
    if (this.canalSuscripcion) {
      this.supabase.removeChannel(this.canalSuscripcion);
      this.canalSuscripcion = null;
    }

    // Mensajes falsos para pantalla sin loguear
    this._mensajes.set([
      { id: 1, emisor: 'Sistema', texto: 'Iniciando conexión cifrada..', created_at: new Date() },
      { id: 2, emisor: 'Anónimo', texto: '¿Quieren jugar al Mayor o Menor contra el mejor?', created_at: new Date() },
      { id: 3, emisor: 'Usuario 1', texto: 'Alguien podria superarme? no lo creo.', created_at: new Date() }
    ]);
  }

  async enviarMensaje(texto: string) {
    const emisor = this._usuarioActual();
    
    // Validar desde el servicio
    if (!texto || !emisor || !this._estaLogueado()) return;

    const { error } = await this.supabase
      .from('mensajes')
      .insert([{ emisor, texto }]);
      
    if (error) throw error;
  }

  destruirChat() {
    // Limpieza total para evitar Memory Leaks
    if (this.subscripcionAuth) this.subscripcionAuth.unsubscribe();
    if (this.canalSuscripcion) this.supabase.removeChannel(this.canalSuscripcion);
  }
}