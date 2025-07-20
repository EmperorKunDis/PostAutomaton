import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Company as ICompany } from '@internal-marketing-content-app/shared';

@Entity('companies')
export class Company implements Omit<ICompany, 'confidence'> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string;

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: ICompany['location']) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
    }
  })
  location: {
    city: string;
    country: string;
  };

  @Column({ type: 'varchar', length: 100 })
  @Index()
  industry: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Additional fields for enhanced search
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  normalizedName?: string; // Lowercase, no special chars for better search

  @Column({ type: 'boolean', default: false })
  isManualEntry: boolean; // Track if company was manually added

  @Column({ type: 'varchar', length: 36, nullable: true })
  createdByUserId?: string; // Track who added manual entries
}