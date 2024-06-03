import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RoomService} from "../service/room.service";
import {ReplaySubject, takeUntil} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy{

  private roomService = inject(RoomService);
  private router = inject(Router);

  public coefficient: number = 1.01;

  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  public setCoefficient(): void {
    this.roomService.addCoefficient({coefficient: [this.coefficient]})
      .pipe(
        takeUntil(this.#destroyed$)
      )
      .subscribe()
  }

  public cancel(): void {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }
}
