import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AutomatedReport } from './automated-report.entity';
import { Company } from './company.entity';
import { ReportDeliveryMethod } from '@internal-marketing-content-app/shared';

@Entity('report_executions')
@Index(['reportId', 'startedAt'])
@Index(['companyId', 'status'])
export class ReportExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reportId: string;

  @ManyToOne(() => AutomatedReport, report => report.executions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportId' })
  report: AutomatedReport;

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Execution details
  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'running' 
  })
  status: 'running' | 'completed' | 'failed' | 'cancelled';

  @Column({ type: 'datetime' })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @Column({ type: 'int', nullable: true })
  duration?: number; // seconds

  // Report data
  @Column({ type: 'json', nullable: true })
  reportData?: any;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reportUrl?: string; // URL to download the report

  // Delivery status
  @Column({ type: 'json', default: '[]' })
  deliveryStatus: {
    method: ReportDeliveryMethod;
    status: 'pending' | 'sent' | 'failed';
    recipient?: string;
    error?: string;
    deliveredAt?: Date;
  }[];

  // Error information
  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'json', nullable: true })
  errorDetails?: any;

  // Metrics
  @Column({ type: 'int', nullable: true })
  recordsProcessed?: number;

  @Column({ type: 'int', nullable: true })
  dataPoints?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}