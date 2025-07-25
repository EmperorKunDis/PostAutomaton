import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ContentGoal } from '@internal-marketing-content-app/shared';
import { User } from './user.entity';
import { Company } from './company.entity';
import { ContentTopicEntity } from './content-topic.entity';

@Entity('content_plans')
export class ContentPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'json' })
  goals: ContentGoal[];

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'active' | 'completed' | 'archived';

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

  @OneToMany(() => ContentTopicEntity, topic => topic.contentPlan, { eager: false })
  topics: ContentTopicEntity[];
}

// Export for other modules to use
export { ContentPlanEntity as ContentPlan };