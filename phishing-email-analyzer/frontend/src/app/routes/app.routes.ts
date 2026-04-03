import { type Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/home/home.component').then((c) => c.HomePageComponent),
  },
  {
    path: 'pl',
    loadComponent: () => import('@pages/home/home.component').then((c) => c.HomePageComponent),
  },
  {
    path: 'en',
    loadComponent: () => import('@pages/home/home.component').then((c) => c.HomePageComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@pages/not-found/not-found.component').then((c) => c.NotFoundPageComponent),
  },
];
