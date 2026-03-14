import { Column } from 'typeorm';

export class BaseEntity {
  @Column()
  createdBy: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column()
  updatedBy: string;

  @Column({ nullable: true, type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
