import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { RoleModule } from './role-module.entity';
import { User } from './user.entity';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ nullable: true, type: 'varchar' })
  deletedBy: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  deletedAt: Date | null;

  @OneToMany(() => RoleModule, (roleModule) => roleModule.role)
  roleToAccessModule: RoleModule[];

  @OneToMany(() => User, (user) => user.role)
  user: User[];
}
