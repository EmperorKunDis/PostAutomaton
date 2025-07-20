import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User as IUser } from '@internal-marketing-content-app/shared';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'Guest' 
  })
  role: 'Admin' | 'Editor' | 'Reviewer' | 'Guest';

  @Column({ 
    type: 'text', 
    nullable: true,
    transformer: {
      to: (value: Record<string, boolean>) => value ? JSON.stringify(value) : null,
      from: (value: string) => value ? JSON.parse(value) : null,
    }
  })
  platformAccessRights?: Record<string, boolean>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}