import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RoomService} from "../service/room.service";
import {exhaustMap, ReplaySubject, take, takeUntil, tap} from "rxjs";
import {Router} from "@angular/router";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy{

  private roomService = inject(RoomService);
  private router = inject(Router);
  public coeffList: any[] = [];

  public coefficient: number = 1.01;

  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  public setCoefficient(): void {
    this.roomService.addCoefficient({coefficient: [this.coefficient]})
      .pipe(
        exhaustMap(res => this.roomService.getRoomsList()
          .pipe(
            tap(res => this.coeffList = [...res])
          )
        ),
        take(2),
        takeUntil(this.#destroyed$)
      )
      .subscribe()
  }

  public cancel(): void {
    this.router.navigate(['/']);
  }

  public getRooms(): void {
    this.roomService.getRoomsList()
      .pipe(
        takeUntil(this.#destroyed$)
      )
      .subscribe(res => {
        this.coeffList = res;
      })
  }

  ngOnInit(): void {
    this.getRooms();
  }

  ngOnDestroy(): void {
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }
}
