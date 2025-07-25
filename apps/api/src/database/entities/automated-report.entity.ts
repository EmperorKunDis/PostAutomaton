import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { ReportExecution } from './report-execution.entity';
import { 
  ReportFrequency, 
  ReportFormat, 
  ReportDeliveryMethod,
  MetricType 
} from '@internal-marketing-content-app/shared';

@Entity('automated_reports')
@Index(['companyId', 'isActive'])
@Index(['nextRunAt', 'isActive'])
export class AutomatedReport {
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

  @Column('uuid')
  userId: string; // Report creator

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Report configuration
  @Column({ type: 'varchar', length: 50 })
  reportType: 'performance' | 'engagement' | 'roi' | 'ab_test' | 'conversion' | 'custom';

  // Content scope
  @Column({ type: 'json' })
  scope: {
    entityTypes?: string[];
    entityIds?: string[];
    platforms?: string[];
    authors?: string[];
    tags?: string[];
    dateRange: 'last_7_days' | 'last_30_days' | 'last_quarter' | 'custom';
    customDateRange?: {
      start: Date;
      end: Date;
    };
  };

  // Metrics to include
  @Column({ type: 'json' })
  metrics: MetricType[];

  @Column({ type: 'boolean', default: false })
  includeComparisons: boolean;

  @Column({ type: 'boolean', default: false })
  includeBenchmarks: boolean;

  @Column({ type: 'boolean', default: true })
  includeInsights: boolean;

  // Schedule settings
  @Column({ type: 'varchar', length: 20 })
  frequency: ReportFrequency;

  @Column({ type: 'datetime' })
  nextRunAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  // Delivery settings
  @Column({ type: 'json' })
  deliveryMethod: ReportDeliveryMethod[];

  @Column({ type: 'json' })
  recipients: string[]; // Email addresses or user IDs

  // Format settings
  @Column({ type: 'varchar', length: 20 })
  format: ReportFormat;

  @Column({ type: 'varchar', length: 255, nullable: true })
  template?: string;

  @Column({ type: 'json', nullable: true })
  customizations?: {
    logo?: string;
    branding?: any;
    customSections?: any[];
  };

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastRunAt?: Date;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true 
  })
  lastRunStatus?: 'success' | 'error' | 'running';

  @Column({ type: 'text', nullable: true })
  lastRunError?: string;

  @Column({ type: 'int', default: 0 })
  runCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ReportExecution, execution => execution.report)
  executions: ReportExecution[];
}