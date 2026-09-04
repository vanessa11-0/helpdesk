import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [NavbarComponent, SidebarComponent, DashboardLayoutComponent],
  imports: [SharedModule],
  exports: [DashboardLayoutComponent]
})
export class LayoutModule {}
