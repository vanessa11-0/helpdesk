import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { TicketCreateComponent } from './pages/ticket-create/ticket-create.component';
import { TicketDetailComponent } from './pages/ticket-detail/ticket-detail.component';
import { TicketListComponent } from './pages/ticket-list/ticket-list.component';

const routes: Routes = [
  { path: '', component: TicketListComponent },
  {
    // Va antes de ':id' o 'create' se interpretaría como el id de un ticket.
    path: 'create',
    component: TicketCreateComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'client'] }
  },
  { path: ':id', component: TicketDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsRoutingModule {}
