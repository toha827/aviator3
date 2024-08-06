import {Component, inject, OnInit} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})

export class PasswordComponent implements OnInit {
  public password: string = '';
  private router = inject(Router);
  public showError: boolean = false;

  ngOnInit(): void {
  }

  public enter(): void {
    this.showError = false;
    if (this.password === '1234trtop') {
      this.router.navigate(['/game']);
    } else {
      this.showError = true;
    }
  }
}
