import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ABTest } from './ab-test.entity';
import { 
  ContentAnalyticsEntityType, 
  MetricType 
} from '@internal-marketing-content-app/shared';

@Entity('ab_test_variants')
@Index(['testId', 'isControl'])
export class ABTestVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  testId: string;

  @ManyToOne(() => ABTest, test => test.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testId' })
  test: ABTest;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  isControl: boolean;

  // Content configuration
  @Column({ type: 'json' })
  content: {
    entityType: ContentAnalyticsEntityType;
    entityId: string;
    variations?: {
      title?: string;
      content?: string;
      images?: string[];
      cta?: string;
      publishTime?: Date;
      platform?: string;
    };
  };

  // Metrics
  @Column({ type: 'json', default: '{}' })
  metrics: {
    participants: number;
    conversions: number;
    primaryMetricValue: number;
    secondaryMetrics: Record<MetricType, number>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}