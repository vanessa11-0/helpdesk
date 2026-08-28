import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TicketListComponent } from './pages/ticket-list/ticket-list.component';
import { TicketDetailComponent } from './pages/ticket-detail/ticket-detail.component';
import { TicketCreateComponent } from './pages/ticket-create/ticket-create.component';
import { TicketsRoutingModule } from './tickets-routing.module';
import { LayoutModule } from '../../layout/layout.module';

@NgModule({
  declarations: [
    TicketListComponent,
    TicketDetailComponent,
    TicketCreateComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TicketsRoutingModule,
    LayoutModule
  ]
})
export class TicketsModule { }