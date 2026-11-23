import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Rend une route accessible sans JWT. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);