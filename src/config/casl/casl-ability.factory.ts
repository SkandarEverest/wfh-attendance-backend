import { PureAbility, AbilityClass, AbilityBuilder } from '@casl/ability';
import { Injectable } from '@nestjs/common';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete'
}

type Subjects = 'users' | 'timesheets';

export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserInfo) {
    const { can, build } = new AbilityBuilder<PureAbility<[Action, Subjects]>>(PureAbility as AbilityClass<AppAbility>);

    for (const modul of user.modules) {
      const abilities = modul.ability;
      const modulName = modul.moduleName as Subjects;
      if (abilities.view) {
        can(Action.Read, modulName);
      }
      if (abilities.edit) {
        can(Action.Create, modulName);
        can(Action.Update, modulName);
      }
      if (abilities.delete) {
        can(Action.Delete, modulName);
      }
    }

    return build();
  }
}
