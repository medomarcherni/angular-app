// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'profiles',
    loadComponent: () => import('./features/profiles/profile-list/profile-list.component').then(m => m.ProfileListComponent)
  },
  { 
    path: 'settings',
    children: [
      { 
        path: 'scopes',
        loadComponent: () => import('./features/scopes/scope-list/scope-list.component').then(m => m.ScopeListComponent)
      },
      { 
        path: 'partners',
        loadComponent: () => import('./features/partners/partner-list/partner-list.component').then(m => m.PartnerListComponent)
      },
      { path: '', redirectTo: 'scopes', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'profiles', pathMatch: 'full' },
  { path: '**', redirectTo: 'profiles' }
];