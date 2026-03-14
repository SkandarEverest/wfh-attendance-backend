import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';
import { AccessModule } from './module.entity';

@Entity({ name: 'roles_modules' })
export class RoleModule extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'int' })
  roleId: number;

  @Column({ type: 'int' })
  accessmoduleId: number;

  @Column({ type: 'boolean' })
  view: boolean;

  @Column({ type: 'boolean' })
  edit: boolean;

  @Column({ type: 'boolean' })
  delete: boolean;

  @ManyToOne(() => Role, (role) => role.roleToAccessModule)
  public role: Role;

  @ManyToOne(() => AccessModule, (accessmodule) => accessmodule.roleToAccessModule)
  public accessmodule: AccessModule;
}
