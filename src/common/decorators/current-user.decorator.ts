import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** @CurrentUser() => req.user  |  @CurrentUser('id') => req.user.id */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    return data ? user?.[data] : user;
  },
);