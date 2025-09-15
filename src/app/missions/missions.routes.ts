import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth-guard';

export const missionsRoutes: Routes = [
    { 
        path: '', 
        loadComponent: () => import('./list').then(m => m.List), 
        canActivate: [authGuard] 
    },
    { 
        path: ':page', 
        loadComponent: () => import('./list').then(m => m.List), 
        canActivate: [authGuard] 
    },
    {
        path: 'detail/:id',
        loadComponent: () => import('./pages/detail/detail').then(m => m.Detail),
        canActivate: [authGuard]
    }
];