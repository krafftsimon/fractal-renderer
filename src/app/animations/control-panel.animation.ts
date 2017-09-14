import { trigger, state, animate, transition, style } from '@angular/animations';

export const controlPanelAnimation =
  trigger('controlPanelAnimation', [
    transition(':enter', [
      style({ height: 0, width: 0 }),
      animate('0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ height: '*', width: '*' })),
    ]),
    transition(':leave', [
      style({ height: '*', width: '*'}),
      animate(200, style({ height: 0, width: 0 })),
    ]),
  ])
