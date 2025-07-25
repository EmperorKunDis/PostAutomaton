import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Company } from './company.entity';
import { MetricType } from '@internal-marketing-content-app/shared';

@Entity('platform_integrations')
@Index(['companyId', 'platform'])
@Index(['isConnected', 'syncEnabled'])
export class PlatformIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  platform: string; // 'google_analytics', 'linkedin', 'twitter', etc.

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Connection details
  @Column({ type: 'boolean', default: false })
  isConnected: boolean;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'pending' 
  })
  connectionStatus: 'active' | 'expired' | 'error' | 'pending';

  // API credentials (encrypted)
  @Column({ type: 'json', nullable: true })
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    clientId?: string;
    accountId?: string;
    profileId?: string;
  };

  // Sync configuration
  @Column({ type: 'boolean', default: true })
  syncEnabled: boolean;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'daily' 
  })
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';

  @Column({ type: 'datetime', nullable: true })
  lastSyncAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  nextSyncAt?: Date;

  // Data mapping
  @Column({ type: 'json' })
  metricMapping: {
    platformMetric: string;
    internalMetric: MetricType;
    transformFunction?: string;
  }[];

  // Error handling
  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  // Settings
  @Column({ type: 'json' })
  settings: {
    includeHistoricalData: boolean;
    historicalDataRange: number; // days
    enableRealTimeSync: boolean;
    notifyOnErrors: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}