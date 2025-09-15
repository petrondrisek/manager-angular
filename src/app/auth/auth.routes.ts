import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { noAuthGuard } from './guards/no-auth-guard';

export const authRoutes: Routes = [
    { 
        path: '', 
        loadComponent: () => import('./pages/login/login').then(m => m.Login),
        canActivate: [noAuthGuard]
    }, 
    { 
        path: 'logout', 
        loadComponent: () => import('./pages/logout/logout').then(m => m.Logout),
        canActivate: [authGuard]
    }, 
    { 
        path: 'set-password', 
        loadComponent: () => import('./pages/set-password/set-password').then(m => m.SetPassword),
        canActivate: [authGuard]
    }
];