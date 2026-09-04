import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PriorityBadgePipe,
  PriorityLabelPipe,
  RoleBadgePipe,
  RoleLabelPipe,
  StatusBadgePipe,
  StatusLabelPipe
} from './pipes/ticket-label.pipe';

const PIPES = [
  StatusLabelPipe,
  PriorityLabelPipe,
  RoleLabelPipe,
  StatusBadgePipe,
  PriorityBadgePipe,
  RoleBadgePipe
];

/** Lo que todos los módulos de features necesitan repetir. */
@NgModule({
  declarations: [...PIPES],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  exports: [CommonModule, ReactiveFormsModule, RouterModule, ...PIPES]
})
export class SharedModule {}
