import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { 
  ContentEntityType, 
  ChangeType, 
  ChangeSource 
} from '@internal-marketing-content-app/shared';

@Entity('content_versions')
@Index(['entityType', 'entityId', 'versionNumber'])
@Index(['entityType', 'entityId', 'changedAt'])
@Index(['changedBy', 'changedAt'])
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  entityType: ContentEntityType;

  @Column('uuid')
  entityId: string;

  @Column('int')
  versionNumber: number;

  @Column({
    type: 'varchar',
    length: 50
  })
  changeType: ChangeType;

  @Column({
    type: 'varchar',
    length: 50
  })
  changeSource: ChangeSource;

  // Change metadata
  @Column('uuid')
  changedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changedBy' })
  user: User;

  @CreateDateColumn()
  changedAt: Date;

  @Column({ type: 'text', nullable: true })
  changeDescription: string;

  // Content snapshot
  @Column({ type: 'json' })
  contentSnapshot: any;

  @Column({ type: 'json', nullable: true })
  contentDiff: any;

  // Relations
  @Column({ type: 'uuid', nullable: true })
  previousVersionId: string;

  @Column({ type: 'uuid', nullable: true })
  nextVersionId: string;

  // Additional metadata
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;
}