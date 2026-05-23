import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { QuienSoyComponent } from './components/quien-soy/quien-soy.component';
import { AhorcadoComponent } from './components/ahorcado/ahorcado.component';
import { MayorMenorComponent } from './components/mayor-menor/mayor-menor.component';
import { publicGuard } from './guards/public.guard';
// import { SnakeComponent } from './components/snake/snake.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
    { path: 'registro', component: RegistroComponent, canActivate: [publicGuard] },
    { path: 'quien-soy', component: QuienSoyComponent },
    { path: 'ahorcado', component: AhorcadoComponent },
    { path: 'mayor-menor', component: MayorMenorComponent },
    // { path: 'snake', component: SnakeComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home' } // Ruta comodín para manejar errores 404
];