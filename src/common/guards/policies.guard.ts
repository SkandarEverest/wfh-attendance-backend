import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppAbility, CaslAbilityFactory } from '@/config/casl/casl-ability.factory';
import { PolicyHandler } from '@/interfaces/policy-handler.interface';
import { CHECK_POLICIES_KEY } from '@/common/decorators/policies.decorator';
import { getDefaultValueByCondition } from '@/common/helpers/helper';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler());
    const policyHandlers = getDefaultValueByCondition(!!handlers, handlers, []) as PolicyHandler[];
    const publicApiRequest = this.reflector.get<boolean>('isPublic', context.getHandler());

    if (publicApiRequest) return true;

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
