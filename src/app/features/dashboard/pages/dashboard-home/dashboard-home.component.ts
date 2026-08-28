import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';

interface MetricCard {
  title: string;
  count: number;
  type: 'open' | 'inProgress' | 'resolved' | 'urgent';
  description: string;
}

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  
})
export class DashboardHomeComponent implements OnInit {
  readonly authService = inject(AuthService);

  readonly isLoading = signal<boolean>(true);
  readonly metrics = signal<MetricCard[]>([]);

  ngOnInit(): void {
    this.loadMetrics();
  }

  private loadMetrics(): void {
    // Simulación de carga de métricas (sustituir por llamada al servicio de Tickets)
    setTimeout(() => {
      this.metrics.set([
        { title: 'Tickets Abiertos', count: 12, type: 'open', description: 'Pendientes de asignación o revisión' },
        { title: 'En Progreso', count: 5, type: 'inProgress', description: 'En gestión activa por un agente' },
        { title: 'Resueltos', count: 28, type: 'resolved', description: 'Solucionados exitosamente' },
        { title: 'Urgentes', count: 2, type: 'urgent', description: 'Requieren atención prioritaria' }
      ]);
      this.isLoading.set(false);
    }, 800);
  }

  getCardBorderClass(type: string): string {
    switch (type) {
      case 'open': return 'border-l-4 border-l-blue-500';
      case 'inProgress': return 'border-l-4 border-l-amber-500';
      case 'resolved': return 'border-l-4 border-l-green-500';
      case 'urgent': return 'border-l-4 border-l-red-500';
      default: return 'border-l-4 border-l-gray-300';
    }
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'open': return 'bg-blue-50 text-blue-700';
      case 'inProgress': return 'bg-amber-50 text-amber-700';
      case 'resolved': return 'bg-green-50 text-green-700';
      case 'urgent': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  }
}