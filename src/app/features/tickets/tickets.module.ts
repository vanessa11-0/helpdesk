import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TicketsRoutingModule } from './tickets-routing.module';
import { TicketCreateComponent } from './pages/ticket-create/ticket-create.component';
import { TicketDetailComponent } from './pages/ticket-detail/ticket-detail.component';
import { TicketListComponent } from './pages/ticket-list/ticket-list.component';

@NgModule({
  declarations: [TicketListComponent, TicketDetailComponent, TicketCreateComponent],
  imports: [SharedModule, TicketsRoutingModule]
})
export class TicketsModule {}
