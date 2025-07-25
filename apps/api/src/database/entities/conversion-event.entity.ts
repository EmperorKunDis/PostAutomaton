import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Company } from './company.entity';
import { ConversionEventType } from '@internal-marketing-content-app/shared';

@Entity('conversion_events')
@Index(['companyId', 'isActive', 'type'])
export class ConversionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: ConversionEventType;

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Event configuration
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number; // monetary value

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  // Tracking configuration
  @Column({ type: 'varchar', length: 50 })
  trackingMethod: 'pixel' | 'api' | 'manual' | 'utm' | 'webhook';

  @Column({ type: 'text', nullable: true })
  trackingCode?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  webhookUrl?: string;

  // Attribution settings
  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'last_touch' 
  })
  attributionModel: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';

  @Column({ type: 'int', default: 30 })
  attributionWindow: number; // days

  // Event properties
  @Column({ type: 'json' })
  properties: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
  }[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}