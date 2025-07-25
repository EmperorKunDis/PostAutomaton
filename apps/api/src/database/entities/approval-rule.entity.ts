import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { 
  ApprovalEntityType, 
  ApprovalRuleCondition, 
  ApprovalRuleStep 
} from '@internal-marketing-content-app/shared';

@Entity('approval_rules')
@Index(['companyId', 'isActive'])
@Index(['entityType', 'priority'])
export class ApprovalRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Rule conditions
  @Column({ type: 'varchar', length: 50 })
  entityType: ApprovalEntityType;

  @Column({ type: 'json' })
  conditions: ApprovalRuleCondition[];

  // Workflow configuration
  @Column({ type: 'json' })
  steps: ApprovalRuleStep[];

  // Settings
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  priority: number; // Higher number = higher priority when multiple rules match

  // Metadata
  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}