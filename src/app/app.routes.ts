import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { QuienSoyComponent } from './components/quien-soy/quien-soy.component';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
    { path: 'registro', component: RegistroComponent, canActivate: [publicGuard] },
    { path: 'quien-soy', component: QuienSoyComponent },
    // Ruta por defecto que redirige al Home
    { path: '', redirectTo: '/', pathMatch: 'full' },
    // Ruta comodín para manejar errores 404
    { path: '**', redirectTo: '/' }
];