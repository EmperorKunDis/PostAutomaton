import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TopicCategory, ContentGoal } from '@internal-marketing-content-app/shared';
import { User } from './user.entity';
import { Company } from './company.entity';
import { WriterProfile } from './writer-profile.entity';
import { ContentPlanEntity } from './content-plan.entity';

@Entity('content_topics')
export class ContentTopicEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  category: TopicCategory;

  @Column({ type: 'json' })
  keywords: string[];

  @Column({ type: 'int', name: 'planned_month' })
  plannedMonth: number;

  @Column({ type: 'int', name: 'planned_year' })
  plannedYear: number;

  @Column({ type: 'varchar', length: 10, default: 'medium' })
  priority: 'high' | 'medium' | 'low';

  @Column({ type: 'varchar', length: 20, default: 'planned' })
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';

  @Column({ type: 'uuid', name: 'writer_profile_id', nullable: true })
  writerProfileId?: string;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'json', name: 'content_goals' })
  contentGoals: ContentGoal[];

  @Column({ type: 'uuid', name: 'content_plan_id', nullable: true })
  contentPlanId?: string;

  @Column({ type: 'json', name: 'seasonal_events', nullable: true })
  seasonalEvents?: string[];

  @Column({ type: 'json', name: 'seasonal_relevance', nullable: true })
  seasonalRelevance?: string[];

  @Column({ type: 'int', name: 'estimated_read_time', nullable: true })
  estimatedReadTime?: number;

  @Column({ type: 'json', name: 'competitor_keywords', nullable: true })
  competitorKeywords?: string[];

  @Column({ type: 'varchar', length: 500, name: 'target_audience', nullable: true })
  targetAudience?: string;

  @Column({ type: 'json', name: 'seo_keywords', nullable: true })
  seoKeywords?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, { eager: false })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => WriterProfile, { eager: false, nullable: true })
  @JoinColumn({ name: 'writer_profile_id' })
  writerProfile?: WriterProfile;

  @ManyToOne(() => ContentPlanEntity, plan => plan.topics, { eager: false, nullable: true })
  @JoinColumn({ name: 'content_plan_id' })
  contentPlan?: ContentPlanEntity;
}

// Export for other modules to use
export { ContentTopicEntity as ContentTopic };