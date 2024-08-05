import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RoomService} from "../service/room.service";
import {exhaustMap, ReplaySubject, take, takeUntil, tap} from "rxjs";
import {Router} from "@angular/router";
import {CommonModule} from "@angular/common";
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from "@angular/material/chips";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {v4 as uuidv4} from "uuid";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatChipsModule, MatFormField, MatIcon],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy{

  private roomService = inject(RoomService);
  private router = inject(Router);
  public coeffList: any[] = [];
  public showLoading: boolean = false;
  public showLoadingBalance: boolean = false;

  public coefficient: number = 1.01;
  public balance: number = 10000;

  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  public setCoefficient(): void {
    this.showLoading = true;
    this.roomService.addCoefficient({coefficient: this.fruits})
      .pipe(
        exhaustMap(res => this.roomService.getCoeffAdmin()
          .pipe(
            tap(_ => this.showLoading = false),
            tap(res => this.coeffList = [...res]),
            tap(_ => this.fruits = [])
          )
        ),
        take(2),
        takeUntil(this.#destroyed$)
      )
      .subscribe()
  }

  public setBalance(): void {
    this.showLoadingBalance = true;

    localStorage.setItem('lastBalanceDouble', JSON.stringify(parseInt(this.balance.toFixed(2).substring(this.balance.toFixed(2).length - 2))))

    this.roomService.setBalance({amount: this.balance})
      .pipe(
        tap(_ => this.showLoadingBalance = false)
      )
      .subscribe()
  }

  public cancel(): void {
    this.router.navigate(['/']);
  }

  public getRooms(): void {
    this.roomService.getCoeffAdmin()
      .pipe(
        takeUntil(this.#destroyed$)
      )
      .subscribe(res => {
        this.coeffList = res;
      })
  }

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      const uuid = uuidv4();
      localStorage.setItem('token', uuid);
    }
    this.getRooms();
  }

  ngOnDestroy(): void {
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  fruits: any[] = [];

  announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(+value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(fruit: any): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);

      this.announcer.announce(`Removed ${fruit}`);
    }
  }

  edit(fruit: any, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(fruit);
      return;
    }

    // Edit existing fruit
    const index = this.fruits.indexOf(fruit);
    if (index >= 0) {
      this.fruits[index].name = value;
    }
  }
}
