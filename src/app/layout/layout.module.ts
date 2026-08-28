import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    DashboardLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    DashboardLayoutComponent
  ]
})
export class LayoutModule { }