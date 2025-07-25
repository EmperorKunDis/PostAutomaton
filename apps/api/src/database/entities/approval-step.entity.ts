import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { ApprovalWorkflow } from './approval-workflow.entity';
import { ApprovalDecision } from './approval-decision.entity';

@Entity('approval_steps')
@Index(['workflowId', 'stepNumber'])
@Index(['status', 'startedAt'])
export class ApprovalStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  workflowId: string;

  @ManyToOne(() => ApprovalWorkflow, workflow => workflow.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: ApprovalWorkflow;

  @Column({ type: 'int' })
  stepNumber: number;

  // Step details
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Reviewer assignment
  @Column({ type: 'json' })
  assignedReviewers: string[]; // User IDs for this step

  @Column({ type: 'json' })
  reviewerNames: string[]; // Cached names for display

  // Requirements
  @Column({ type: 'boolean', default: true })
  requiresAllReviewers: boolean; // If false, any one reviewer can approve

  @Column({ type: 'boolean', default: true })
  allowParallelReview: boolean; // Can multiple reviewers review simultaneously

  // Status
  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'pending' 
  })
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped';

  @Column({ type: 'datetime', nullable: true })
  startedAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  // Results
  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true 
  })
  finalDecision?: 'approved' | 'rejected';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ApprovalDecision, decision => decision.step, { cascade: true })
  approvals: ApprovalDecision[];
}