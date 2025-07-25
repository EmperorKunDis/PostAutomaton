import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { DashboardWidget } from './dashboard-widget.entity';

@Entity('engagement_dashboards')
@Index(['companyId', 'userId'])
@Index(['isPublic'])
export class EngagementDashboard {
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
  userId: string; // Dashboard owner

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Sharing and permissions
  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'json' })
  sharedWith: string[]; // User IDs

  @Column({ type: 'json' })
  permissions: {
    canView: string[];
    canEdit: string[];
  };

  // Auto-refresh settings
  @Column({ type: 'boolean', default: false })
  autoRefresh: boolean;

  @Column({ type: 'int', default: 15 })
  refreshInterval: number; // minutes

  // Filters applied to entire dashboard
  @Column({ type: 'json' })
  globalFilters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    platforms?: string[];
    authors?: string[];
    tags?: string[];
  };

  @Column({ type: 'datetime', nullable: true })
  lastAccessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => DashboardWidget, widget => widget.dashboard, { cascade: true })
  layout: DashboardWidget[];
}