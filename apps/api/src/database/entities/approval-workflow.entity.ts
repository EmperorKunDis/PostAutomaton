import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { ApprovalStep } from './approval-step.entity';
import { 
  ApprovalWorkflowStatus, 
  ApprovalEntityType 
} from '@internal-marketing-content-app/shared';

@Entity('approval_workflows')
@Index(['entityType', 'entityId'])
@Index(['companyId', 'status'])
@Index(['authorId', 'status'])
@Index(['status', 'dueDate'])
export class ApprovalWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  entityType: ApprovalEntityType;

  @Column('uuid')
  entityId: string;

  @Column({ type: 'varchar', length: 500 })
  entityTitle: string;

  // Current status
  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'draft' 
  })
  status: ApprovalWorkflowStatus;

  @Column({ type: 'int', default: 1 })
  currentStage: number;

  @Column({ type: 'int', default: 1 })
  totalStages: number;

  // Author information
  @Column('uuid')
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'varchar', length: 255 })
  authorName: string;

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Assignment
  @Column({ type: 'json' })
  assignedReviewers: string[]; // User IDs

  @Column({ type: 'uuid', nullable: true })
  currentReviewer?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'currentReviewer' })
  currentReviewerUser?: User;

  // Approval rules and requirements
  @Column({ type: 'boolean', default: false })
  requiresSequentialApproval: boolean;

  @Column({ type: 'int', default: 1 })
  minimumApprovals: number;

  @Column({ type: 'int', default: 0 })
  currentApprovals: number;

  // Timestamps
  @Column({ type: 'datetime', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Metadata
  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'medium' 
  })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @OneToMany(() => ApprovalStep, step => step.workflow, { cascade: true })
  steps: ApprovalStep[];
}