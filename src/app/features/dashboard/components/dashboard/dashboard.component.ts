import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardMetrics, MetricCard } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  currentUser = this.authService.currentUser;
  isLoading = signal<boolean>(true);
  metrics = signal<MetricCard[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    const role = this.currentUser()?.role;
    if (!role) return;

    this.isLoading.set(true);
    this.dashboardService.getMetricsByRole(role).subscribe({
      next: (data) => {
        this.metrics.set(this.transformMetricsToCards(role, data));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private transformMetricsToCards(role: string, data: any): MetricCard[] {
    if (role === 'Cliente') {
      return [
        { title: 'Solicitudes Totales', value: data.totalTickets || 0, icon: '📋', variant: 'primary' },
        { title: 'En Atención', value: data.openTickets || 0, icon: '⏳', variant: 'warning' },
        { title: 'Resueltos', value: data.resolvedTickets || 0, icon: '✅', variant: 'success' },
        { title: 'Tiempo Prom. Respuesta', value: `${data.avgResponseTimeHours || 0}h`, icon: '⏱️', variant: 'info' }
      ];
    } else if (role === 'Agente') {
      return [
        { title: 'Asignados a Mí', value: data.assignedTickets || 0, icon: '📌', variant: 'primary' },
        { title: 'En Proceso', value: data.inProgressTickets || 0, icon: '🔄', variant: 'warning' },
        { title: 'Resueltos Hoy', value: data.resolvedToday || 0, icon: '🎯', variant: 'success' },
        { title: 'Tiempo Prom. Resolución', value: `${data.avgResolutionTimeHours || 0}h`, icon: '⏱️', variant: 'info' }
      ];
    } else {
      return [
        { title: 'Total del Sistema', value: data.totalSystemTickets || 0, icon: '📊', variant: 'primary' },
        { title: 'Sin Asignar', value: data.unassignedTickets || 0, icon: '⚠️', variant: 'danger' },
        { title: 'Agentes Activos', value: data.activeAgents || 0, icon: '👥', variant: 'info' },
        { title: 'Satisfacción', value: `${data.satisfactionRate || 0}%`, icon: '⭐', variant: 'success' }
      ];
    }
  }
}