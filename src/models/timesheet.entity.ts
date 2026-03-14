import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'timesheets' })
@Unique(['userId', 'workDate'])
export class Timesheet extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'date' })
  workDate: string;

  @Column({ type: 'timestamp' })
  checkInTime: Date;

  @Column({ type: 'varchar', length: 500 })
  photoPath: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => User, (user) => user.timesheets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
