import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { RoleModule } from './role-module.entity';

@Entity({ name: 'modules' })
export class AccessModule extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => RoleModule, (roleModule) => roleModule.accessmodule)
  roleToAccessModule: RoleModule[];
}
