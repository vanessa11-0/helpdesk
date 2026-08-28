import { Component, Input } from '@angular/core';
import { MetricCard } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard-metrics',
  templateUrl: './dashboard-metrics.component.html',
  styleUrls: ['./dashboard-metrics.component.scss']
})
export class DashboardMetricsComponent {
  @Input({ required: true }) metrics: MetricCard[] = [];
}