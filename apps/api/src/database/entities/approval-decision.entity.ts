import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApprovalWorkflow } from './approval-workflow.entity';
import { ApprovalStep } from './approval-step.entity';
import { User } from './user.entity';
import { ApprovalAction } from '@internal-marketing-content-app/shared';

@Entity('approval_decisions')
@Index(['workflowId', 'decidedAt'])
@Index(['reviewerId', 'decidedAt'])
@Index(['stepId', 'decision'])
export class ApprovalDecision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  workflowId: string;

  @ManyToOne(() => ApprovalWorkflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: ApprovalWorkflow;

  @Column('uuid')
  stepId: string;

  @ManyToOne(() => ApprovalStep, step => step.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stepId' })
  step: ApprovalStep;

  // Decision details
  @Column({ type: 'varchar', length: 50 })
  action: ApprovalAction;

  @Column({ type: 'varchar', length: 50 })
  decision: 'approved' | 'rejected' | 'changes_requested';

  // Reviewer information
  @Column('uuid')
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'varchar', length: 255 })
  reviewerName: string;

  @Column({ type: 'varchar', length: 50 })
  reviewerRole: string;

  // Feedback
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'json', nullable: true })
  changeRequests?: string[];

  @Column({ type: 'json', nullable: true })
  attachments?: string[];

  // Timing
  @Column({ type: 'datetime' })
  decidedAt: Date;

  @Column({ type: 'int', nullable: true })
  timeSpentMinutes?: number;

  // References
  @Column({ type: 'json', nullable: true })
  originalContent?: any; // Snapshot of content at time of review

  @Column({ type: 'json', nullable: true })
  suggestedChanges?: any; // Specific change suggestions

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}