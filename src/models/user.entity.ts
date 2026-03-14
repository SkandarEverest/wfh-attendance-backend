import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Timesheet } from './timesheet.entity';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ nullable: true, type: 'int' })
  roleId: number;

  @Column({ nullable: true, type: 'varchar' })
  deletedBy: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => Role, (role) => role.user)
  role: Role;

  @OneToMany(() => Timesheet, (timesheet) => timesheet.user)
  timesheets: Timesheet[];
}
