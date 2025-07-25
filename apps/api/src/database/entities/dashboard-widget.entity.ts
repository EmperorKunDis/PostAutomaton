import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { EngagementDashboard } from './engagement-dashboard.entity';
import { AnalyticsQuery } from '@internal-marketing-content-app/shared';

@Entity('dashboard_widgets')
@Index(['dashboardId', 'position'])
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  dashboardId: string;

  @ManyToOne(() => EngagementDashboard, dashboard => dashboard.layout, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dashboardId' })
  dashboard: EngagementDashboard;

  @Column({ type: 'varchar', length: 50 })
  type: 'metric_card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table' | 'heatmap' | 'funnel' | 'gauge';

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Layout
  @Column({ type: 'json' })
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Data configuration
  @Column({ type: 'json' })
  dataQuery: AnalyticsQuery;

  // Visualization settings
  @Column({ type: 'json' })
  config: {
    showLegend?: boolean;
    showDataLabels?: boolean;
    colors?: string[];
    thresholds?: {
      good: number;
      warning: number;
      critical: number;
    };
    displayFormat?: 'number' | 'percentage' | 'currency' | 'duration';
    aggregationType?: 'sum' | 'avg' | 'max' | 'min';
  };

  // Refresh settings
  @Column({ type: 'boolean', default: true })
  autoRefresh: boolean;

  @Column({ type: 'int', default: 15 })
  refreshInterval: number; // minutes

  @Column({ type: 'datetime', nullable: true })
  lastRefreshedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}