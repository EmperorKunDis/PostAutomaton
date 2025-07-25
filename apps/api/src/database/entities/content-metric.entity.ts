import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { 
  MetricType, 
  ContentAnalyticsEntityType, 
  AnalyticsTimeframe, 
  AnalyticsSource 
} from '@internal-marketing-content-app/shared';

@Entity('content_metrics')
@Index(['entityType', 'entityId'])
@Index(['companyId', 'metricType', 'measuredAt'])
@Index(['platform', 'metricType', 'measuredAt'])
@Index(['periodStart', 'periodEnd'])
export class ContentMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  entityType: ContentAnalyticsEntityType;

  @Column('uuid')
  entityId: string;

  @Column({ type: 'varchar', length: 500 })
  entityTitle: string;

  // Platform information
  @Column({ type: 'varchar', length: 100, nullable: true })
  platform?: string; // 'linkedin', 'twitter', 'website', etc.

  @Column({ type: 'varchar', length: 50 })
  source: AnalyticsSource;

  // Metric details
  @Column({ type: 'varchar', length: 50 })
  metricType: MetricType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  previousValue?: number; // For comparison

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  changePercentage?: number;

  // Time information
  @Column({ type: 'datetime' })
  measuredAt: Date;

  @Column({ type: 'varchar', length: 20 })
  timeframe: AnalyticsTimeframe;

  @Column({ type: 'datetime' })
  periodStart: Date;

  @Column({ type: 'datetime' })
  periodEnd: Date;

  // Context
  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'uuid', nullable: true })
  userId?: string; // User who recorded/imported the metric

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata?: {
    demographicBreakdown?: Record<string, number>;
    geographicBreakdown?: Record<string, number>;
    deviceBreakdown?: Record<string, number>;
    trafficSource?: Record<string, number>;
    referrerData?: any;
    platformSpecificData?: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}