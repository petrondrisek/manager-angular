import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth-guard';

export const usersRoutes: Routes = [
    { 
        path: '', 
        loadComponent: () => import('./users').then(m => m.Users), 
        canActivate: [authGuard] 
    },
    { 
        path: ':page', 
        loadComponent: () => import('./users').then(m => m.Users), 
        canActivate: [authGuard] 
    },
];