import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { DashboardLayoutComponent } from './layout/components/dashboard-layout/dashboard-layout.component';
import { UnauthorizedComponent } from '@shared/pages/unauthorized/unauthorized.component';

/**
 * Todas las secciones privadas cuelgan de un mismo shell con el layout, para
 * que la barra lateral no se vuelva a montar al cambiar de módulo. Cada área
 * se carga de forma diferida (lazy loading) y sólo se descarga su bundle
 * cuando el guard deja pasar.
 */
const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule)
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('./features/tickets/tickets.module').then((m) => m.TicketsModule)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadChildren: () => import('./features/users/users.module').then((m) => m.UsersModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
