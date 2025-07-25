import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { 
  NotificationType, 
  NotificationStatus,
  CommentEntityType 
} from '@internal-marketing-content-app/shared';

@Entity('notifications')
@Index(['userId', 'status', 'createdAt'])
@Index(['type', 'createdAt'])
@Index(['entityType', 'entityId'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  type: NotificationType;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'unread'
  })
  status: NotificationStatus;

  // Target user
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Source information
  @Column('uuid')
  triggeredBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'triggeredBy' })
  triggerUser: User;

  @Column({ type: 'varchar', length: 255 })
  triggeredByName: string;

  // Content reference
  @Column({
    type: 'varchar',
    length: 50
  })
  entityType: CommentEntityType;

  @Column('uuid')
  entityId: string;

  @Column({ type: 'varchar', length: 500 })
  entityTitle: string;

  // Notification content
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  // Related comment (for comment/mention notifications)
  @Column({ type: 'uuid', nullable: true })
  commentId?: string;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'commentId' })
  comment?: Comment;

  @Column({ type: 'text', nullable: true })
  commentContent?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  readAt?: Date;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}