import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ConversionEvent } from './conversion-event.entity';
import { Company } from './company.entity';
import { User } from './user.entity';
import { 
  ContentAnalyticsEntityType,
  ConversionTouchpoint 
} from '@internal-marketing-content-app/shared';

@Entity('conversion_tracking')
@Index(['eventId', 'convertedAt'])
@Index(['companyId', 'convertedAt'])
@Index(['entityType', 'entityId'])
@Index(['visitorId'])
export class ConversionTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  eventId: string;

  @ManyToOne(() => ConversionEvent)
  @JoinColumn({ name: 'eventId' })
  event: ConversionEvent;

  @Column({ type: 'varchar', length: 50 })
  entityType: ContentAnalyticsEntityType;

  @Column('uuid')
  entityId: string;

  @Column({ type: 'varchar', length: 500 })
  entityTitle: string;

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Conversion details
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  conversionValue: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  // Attribution
  @Column({ type: 'json' })
  touchpoints: ConversionTouchpoint[];

  @Column({ type: 'json' })
  attributedTouchpoint: ConversionTouchpoint;

  // User information
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId?: string;

  @Column({ type: 'varchar', length: 255 })
  visitorId: string;

  // Device and context
  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer?: string;

  @Column({ type: 'json', nullable: true })
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  // Event properties
  @Column({ type: 'json' })
  eventProperties: Record<string, any>;

  @Column({ type: 'datetime' })
  convertedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}