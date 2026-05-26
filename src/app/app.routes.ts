import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { QuienSoyComponent } from './components/quien-soy/quien-soy.component';
import { AhorcadoComponent } from './components/ahorcado/ahorcado.component';
import { MayorMenorComponent } from './components/mayor-menor/mayor-menor.component';
import { PreguntadosComponent } from './components/preguntados/preguntados.component';
import { SnakeComponent } from './components/snake/snake.component';
import { ResultadosComponent } from './components/resultados/resultados.component';
import { publicGuard } from './guards/public.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    // Accesos públicos
    { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
    { path: 'registro', component: RegistroComponent, canActivate: [publicGuard] },
    { path: 'quien-soy', component: QuienSoyComponent },
    { path: 'resultados', component: ResultadosComponent, canActivate: [authGuard] },
    // Juegos protegidos
    { path: 'ahorcado', component: AhorcadoComponent, canActivate: [authGuard] },
    { path: 'mayor-menor', component: MayorMenorComponent, canActivate: [authGuard] },
    { path: 'preguntados', component: PreguntadosComponent, canActivate: [authGuard] },
    { path: 'snake', component: SnakeComponent, canActivate: [authGuard] },
    // Redirecciones por defecto
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home' } // Manejo erorres 404
];