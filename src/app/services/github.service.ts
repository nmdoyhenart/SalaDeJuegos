import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GithubUser } from '../models/github-user.model';

@Injectable({
    providedIn: 'root'
})
export class GithubService {
    private http = inject(HttpClient);
    private apiUrl = 'https://api.github.com/users/nmdoyhenart';

    // El servicio es el encargado de ir a buscar la info y devolver un "Observable" de acuerdo al modelo que definimos
    obtenerPerfil(): Observable<GithubUser> {
        return this.http.get<GithubUser>(this.apiUrl);
    }
}