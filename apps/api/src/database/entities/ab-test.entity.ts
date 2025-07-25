import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { ABTestVariant } from './ab-test-variant.entity';
import { 
  ABTestStatus, 
  ABTestType, 
  MetricType,
  ABTestResults 
} from '@internal-marketing-content-app/shared';

@Entity('ab_tests')
@Index(['companyId', 'status'])
@Index(['startDate', 'endDate'])
export class ABTest {
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
  userId: string; // Test creator

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Test configuration
  @Column({ type: 'varchar', length: 50 })
  type: ABTestType;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'draft' 
  })
  status: ABTestStatus;

  // Traffic allocation
  @Column({ type: 'json' })
  trafficAllocation: {
    variantId: string;
    percentage: number;
  }[];

  // Success metrics
  @Column({ type: 'varchar', length: 50 })
  primaryMetric: MetricType;

  @Column({ type: 'json' })
  secondaryMetrics: MetricType[];

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  minimumDetectableEffect: number; // percentage

  @Column({ type: 'int', default: 95 })
  confidenceLevel: number; // 95, 99, etc.

  // Test duration
  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'datetime', nullable: true })
  actualStartDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  actualEndDate?: Date;

  // Audience targeting
  @Column({ type: 'json', nullable: true })
  targetAudience?: {
    platforms?: string[];
    demographics?: Record<string, any>;
    behaviors?: Record<string, any>;
    customSegments?: string[];
  };

  // Results
  @Column({ type: 'json', nullable: true })
  results?: ABTestResults;

  // Settings
  @Column({ type: 'json' })
  settings: {
    autoStop: boolean;
    autoStopThreshold: number; // confidence threshold
    excludeWeekends: boolean;
    excludeHolidays: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ABTestVariant, variant => variant.test, { cascade: true })
  variants: ABTestVariant[];
}