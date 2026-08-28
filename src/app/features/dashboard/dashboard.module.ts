import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardMetricsComponent } from './components/dashboard-metrics/dashboard-metrics.component';
import { DashboardRecentTicketsComponent } from './components/dashboard-recent-tickets/dashboard-recent-tickets.component';
import { LayoutModule } from '../../layout/layout.module';

@NgModule({
  declarations: [
    DashboardHomeComponent,
    DashboardComponent,
    DashboardMetricsComponent,
    DashboardRecentTicketsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    DashboardRoutingModule,
    LayoutModule
  ]
})
export class DashboardModule { }