import { Routes } from '@angular/router';
import {AdminComponent} from "./admin/admin.component";
import {GameComponent} from "./game/game.component";
import {PasswordComponent} from "./password/password.component";

export const routes: Routes = [
  {
    path: '',
    component: PasswordComponent
  },
  {
    path: 'game',
    component: GameComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  }
];
