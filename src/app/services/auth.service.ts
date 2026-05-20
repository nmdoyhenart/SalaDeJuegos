import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  public usuarioActivo = new BehaviorSubject<User | null>(null); // "Vigilante" reactivo. Empieza en null (sin usuario)
  public perfilActivo = new BehaviorSubject<any>(null); // "Vigilante" para los datos del perfil

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Ni bien carga la app, buscamos la sesión guardada en cache
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.actualizarEstado(session);
    });

    // Escuchando para futuros inicios o cierres de sesión
    this.supabase.auth.onAuthStateChange((event, session) => {
      // Ignoramos el evento inicial
      if (event !== 'INITIAL_SESSION') {
        this.actualizarEstado(session);
      }
    });
  }

  // Actualizar de vigilantes
  private async actualizarEstado(session: any) {
    const user = session?.user || null;
    this.usuarioActivo.next(user);

    if (user) {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('nombre, apellido')
        .eq('id', user.id)
        .single();
        
      if (!error && data) {
        this.perfilActivo.next(data);
      } else {
        console.error("No se pudo cargar el perfil del F5", error);
        this.perfilActivo.next(null);
      }
    } else {
      this.perfilActivo.next(null);
    }
  }

  async registrarUsuario(usuario: Usuario, password: string) {
    try {
      // Creamos el usuario en el sistema de Autenticación
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: usuario.correo, 
        password: password,    
      });

      if (authError) throw authError;

      // Si se creó bien, guardamos sus datos personales en la tabla 'usuarios'
      if (authData.user) {
        const { error: dbError } = await this.supabase.from('usuarios').insert({
          id: authData.user.id, 
          correo: usuario.correo,     
          nombre: usuario.nombre,     
          apellido: usuario.apellido,
          edad: usuario.edad          
        });

        if (dbError) throw dbError;
      }

      return authData;
    } catch (error: any) {
      // Lanzamos el error y va a se atrapado por registro.service
      throw error;
    }
  }

  async iniciarSesion(correo: string, contrasena: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: correo,
        password: contrasena,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async cerrarSesion() {
    // Borrar la forzadamente la memoria cache del navegador
    localStorage.clear();
    sessionStorage.clear();
    
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.warn("Supabase tardó en responder, pero el caché ya está limpio.");
    }
  }

  // Exponemos el cliente por si lo volvemos a necesitar
  get client(): SupabaseClient {
    return this.supabase;
  }
}