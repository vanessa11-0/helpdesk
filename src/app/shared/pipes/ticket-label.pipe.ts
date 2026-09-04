import { Pipe, PipeTransform } from '@angular/core';
import {
  PRIORITY_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  TicketPriority,
  TicketStatus,
  UserRole
} from '@core/models';

/**
 * La API trabaja con valores en inglés y minúscula (`in_progress`, `urgent`,
 * `admin`). Estos pipes los traducen sólo en la vista, para no desalinear los
 * modelos respecto del contrato.
 */

const NEUTRAL_BADGE = 'bg-gray-100 text-gray-600 border-gray-200';

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: TicketStatus | null | undefined): string {
    return status ? STATUS_LABELS[status] : '—';
  }
}

@Pipe({ name: 'priorityLabel' })
export class PriorityLabelPipe implements PipeTransform {
  transform(priority: TicketPriority | null | undefined): string {
    return priority ? PRIORITY_LABELS[priority] : '—';
  }
}

@Pipe({ name: 'roleLabel' })
export class RoleLabelPipe implements PipeTransform {
  transform(role: UserRole | null | undefined): string {
    return role ? ROLE_LABELS[role] : '—';
  }
}

@Pipe({ name: 'statusBadge' })
export class StatusBadgePipe implements PipeTransform {
  private readonly styles: Record<TicketStatus, string> = {
    open: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
    closed: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  transform(status: TicketStatus | null | undefined): string {
    return status ? this.styles[status] : NEUTRAL_BADGE;
  }
}

@Pipe({ name: 'priorityBadge' })
export class PriorityBadgePipe implements PipeTransform {
  private readonly styles: Record<TicketPriority, string> = {
    low: 'bg-gray-100 text-gray-600 border-gray-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    urgent: 'bg-red-50 text-red-700 border-red-200 font-semibold'
  };

  transform(priority: TicketPriority | null | undefined): string {
    return priority ? this.styles[priority] : NEUTRAL_BADGE;
  }
}

@Pipe({ name: 'roleBadge' })
export class RoleBadgePipe implements PipeTransform {
  private readonly styles: Record<UserRole, string> = {
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    agent: 'bg-amber-50 text-amber-700 border-amber-200',
    client: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  transform(role: UserRole | null | undefined): string {
    return role ? this.styles[role] : NEUTRAL_BADGE;
  }
}
