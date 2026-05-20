export interface Usuario {
    uid?: string; // Opcional porque lo asigna Supabase automaticamente al crearlo
    nombre: string;
    apellido: string;
    edad: number;
    correo: string;
}