import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { WriterProfile as IWriterProfile, WriterTone, WriterStyle } from '@internal-marketing-content-app/shared';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('writer_profiles')
export class WriterProfile implements IWriterProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 36 })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  position: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: ['Professional', 'Casual', 'Technical', 'Inspirational', 'Friendly']
  })
  tone: WriterTone;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: ['Informative', 'Persuasive', 'Educational', 'Entertaining', 'Analytical']
  })
  style: WriterStyle;

  @Column({ type: 'varchar', length: 255 })
  targetAudience: string;

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => value ? JSON.parse(value) : [],
    }
  })
  contentFocusAreas: string[];

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => value ? JSON.parse(value) : [],
    }
  })
  socialPlatforms: string[];

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => value ? JSON.parse(value) : [],
    }
  })
  companyFocusTips: string[];

  @Column({ type: 'boolean', default: false })
  isCustom: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;
}