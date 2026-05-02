import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;

  // Nuestro "vigilante" reactivo. Empieza en null (sin usuario)
  public usuarioActivo = new BehaviorSubject<User | null>(null);

  // Creamos un "vigilante" específico para los datos del perfil (nombre, apellido, etc.)
  public perfilActivo = new BehaviorSubject<any>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // 1. Ni bien carga la app, buscamos la sesión guardada en el caché
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.actualizarEstado(session);
    });

    // 2. Nos quedamos escuchando para futuros inicios o cierres de sesión
    this.supabase.auth.onAuthStateChange((event, session) => {
      // Ignoramos el evento inicial porque ya lo manejamos en el paso 1
      if (event !== 'INITIAL_SESSION') {
        this.actualizarEstado(session);
      }
    });
  }

  // Centralizamos la lógica de actualizar los vigilantes para no repetir código
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

  async registrarUsuario(datos: any) {
    try {
      // 1. Creamos el usuario en el sistema de Autenticación
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: datos.correo,
        password: datos.password,
      });

      // Si el correo ya existe, Supabase devuelve una sesión vacía o un error específico
      if (authError) throw authError;

      // 2. Si se creó bien, guardamos sus datos personales en la tabla 'usuarios'
      if (authData.user) {
        const { error: dbError } = await this.supabase.from('usuarios').insert({
          id: authData.user.id, // Vinculamos la tabla con el ID de autenticación
          correo: datos.correo,
          nombre: datos.nombre,
          apellido: datos.apellido,
          edad: datos.edad
        });

        if (dbError) throw dbError;
      }

      return authData;
    } catch (error: any) {
      // Lanzamos el error para que el componente (HTML) decida cómo mostrarlo
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
    // 1. Borramos la memoria caché del navegador a la fuerza PRIMERO
    localStorage.clear();
    sessionStorage.clear();
    
    // 2. Le avisamos a Supabase en segundo plano
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.warn("Supabase tardó en responder, pero el caché ya está limpio.");
    }
  }

  // Exponemos el cliente por si lo necesitamos luego
  get client(): SupabaseClient {
    return this.supabase;
  }
}