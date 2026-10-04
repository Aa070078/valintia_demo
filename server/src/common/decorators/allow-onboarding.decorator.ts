import { SetMetadata } from '@nestjs/common';
export const ALLOW_ONBOARDING_KEY = 'allowOnboarding';
/** Only minimal account endpoints accept restricted sessions. */
export const AllowOnboarding = () => SetMetadata(ALLOW_ONBOARDING_KEY, true);
