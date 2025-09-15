import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';

export const routes: Routes = [
    { 
        path: '', 
        loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes),
    },
    { 
        path: 'users',
        loadChildren: () => import('./users/users.routes').then(m => m.usersRoutes)
    },
    {
        path: 'mission',
        loadChildren: () => import('./missions/missions.routes').then(m => m.missionsRoutes)
    },
    { 
        path: 'dashboard', 
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard), 
        canActivate: [authGuard] 
    },
];
