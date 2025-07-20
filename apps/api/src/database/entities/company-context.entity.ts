import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn } from 'typeorm';
import { CompanyContext as ICompanyContext, CompanySizeIndicator, TargetMarket } from '@internal-marketing-content-app/shared';
import { Company } from './company.entity';

@Entity('company_contexts')
export class CompanyContext implements ICompanyContext {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, unique: true })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  industryVertical: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: ['Startup', 'SMB', 'Enterprise', 'Corporation']
  })
  companySizeIndicator: CompanySizeIndicator;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: ['B2B', 'B2C', 'B2B2C']
  })
  targetMarket: TargetMarket;

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => value ? JSON.parse(value) : [],
    }
  })
  contentThemes: string[];

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => value ? JSON.parse(value) : [],
    }
  })
  keyDifferentiators: string[];

  @Column({ type: 'text' })
  competitivePosition: string;

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => value ? JSON.parse(value) : [],
    }
  })
  brandPersonality: string[];

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => value ? JSON.parse(value) : [],
    }
  })
  generatedInsights: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company?: Company;
}