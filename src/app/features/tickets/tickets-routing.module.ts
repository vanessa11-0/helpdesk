import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './pages/ticket-list/ticket-list.component';
import { TicketCreateComponent } from './pages/ticket-create/ticket-create.component';
import { TicketDetailComponent } from './pages/ticket-detail/ticket-detail.component';
import { DashboardLayoutComponent } from '../../layout/components/dashboard-layout/dashboard-layout.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: TicketListComponent },
      { path: 'create', component: TicketCreateComponent }, // Debe ir ANTES de :id
      { path: ':id', component: TicketDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsRoutingModule { }