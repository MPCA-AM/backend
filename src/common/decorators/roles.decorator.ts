import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
/** Restreint une route à certains rôles. Ex: @Roles(Role.ADMIN, Role.EDITEUR) */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);