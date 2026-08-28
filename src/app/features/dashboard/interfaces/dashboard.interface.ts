export interface MetricCard {
  title: string;
  value: number | string;
  changePercent?: number;
  icon: string;
  variant: 'primary' | 'warning' | 'success' | 'danger' | 'info';
}

export interface ClientDashboardData {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTimeHours: number;
}

export interface AgentDashboardData {
  assignedTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  avgResolutionTimeHours: number;
}

export interface AdminDashboardData {
  totalSystemTickets: number;
  unassignedTickets: number;
  activeAgents: number;
  satisfactionRate: number;
}

export type DashboardMetrics = ClientDashboardData | AgentDashboardData | AdminDashboardData;