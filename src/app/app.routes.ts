import { Routes } from '@angular/router';
import {AdminComponent} from "./admin/admin.component";
import {GameComponent} from "./game/game.component";

export const routes: Routes = [
  {
    path: '',
    component: GameComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  }
];
