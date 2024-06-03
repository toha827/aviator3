import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideCacheableAnimationLoader, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {provideEnvironmentNgxMask} from "ngx-mask";
import {authInterceptor} from "./guard/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideEnvironmentNgxMask(),
    provideCacheableAnimationLoader(),
    provideLottieOptions({ player: () => player }),
  ]
};
