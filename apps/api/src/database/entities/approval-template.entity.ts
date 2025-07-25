import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { 
  ApprovalEntityType, 
  ApprovalRuleStep 
} from '@internal-marketing-content-app/shared';

@Entity('approval_templates')
@Index(['companyId', 'entityType'])
@Index(['isDefault', 'entityType'])
export class ApprovalTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50 })
  entityType: ApprovalEntityType;

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Template steps
  @Column({ type: 'json' })
  steps: ApprovalRuleStep[];

  // Default settings
  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'medium' 
  })
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ type: 'int', nullable: true })
  defaultDueDate?: number; // Days from submission

  // Usage
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'int', default: 0 })
  timesUsed: number;

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