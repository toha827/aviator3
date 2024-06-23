import {Component, inject, NgZone, OnDestroy, OnInit} from '@angular/core';
import {RoomService} from "../service/room.service";
import {AnimationOptions, LottieComponent} from "ngx-lottie";
import {AnimationItem} from "lottie-web";
import {ReplaySubject, Subject, takeUntil} from "rxjs";
import {v4 as uuidv4} from "uuid";
import {Router, RouterOutlet} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {BetComponent} from "../bet/bet.component";

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterOutlet, LottieComponent, CommonModule, FormsModule, BetComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})


export class GameComponent implements OnInit, OnDestroy {

  public currentTabType: string = '1';
  public isClickedHistory: boolean = false;

  private roomService = inject(RoomService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  public userList = [
    {
      date: '22:30',
      amount: 12,
      user: 'td**3',
      coeff: 1.01
    },
    {
      date: '15:45',
      amount: 25,
      user: 'ab**1',
      coeff: 1.01
    },
    {
      date: '09:00',
      amount: 8,
      user: 'xy**7',
      coeff: 1.01
    },
    {
      date: '11:15',
      amount: 15,
      user: 'mn**5',
      coeff: 1.01
    },
    {
      date: '19:50',
      amount: 20,
      user: 'jk**2',
      coeff: 1.01
    },
    {
      date: '08:30',
      amount: 10,
      user: 'mn**6',
      coeff: 1.01
    },
    {
      date: '13:30',
      amount: 23,
      user: 'po**6',
      coeff: 1.01
    },
    {
      date: '09:30',
      amount: 33,
      user: 'me**6',
      coeff: 1.01
    },
    {
      date: '04:30',
      amount: 1,
      user: 'pe**6',
      coeff: 1.01
    },
    {
      date: '18:30',
      amount: 99,
      user: 'pa**6',
      coeff: 1.01
    },
    {
      date: '13:30',
      amount: 23,
      user: 'po**6',
      coeff: 1.01
    },
    {
      date: '09:30',
      amount: 33,
      user: 'me**6',
      coeff: 1.01
    },
    {
      date: '04:30',
      amount: 1,
      user: 'pe**6',
      coeff: 1.01
    },
    {
      date: '18:30',
      amount: 99,
      user: 'pa**6',
      coeff: 1.01
    },
    {
      date: '13:30',
      amount: 23,
      user: 'po**6',
      coeff: 1.01
    },
    {
      date: '09:30',
      amount: 33,
      user: 'me**6',
      coeff: 1.01
    },
    {
      date: '04:30',
      amount: 1,
      user: 'pe**6',
      coeff: 1.01
    },
    {
      date: '18:30',
      amount: 99,
      user: 'pa**6',
      coeff: 1.01
    },
    {
      date: '18:30',
      amount: 99,
      user: 'pa**6',
      coeff: 1.01
    },
  ];

  startCoefficients: number[] = this.userList.map(() => 1.01);

  public options: AnimationOptions = {
    path: '/assets/images/plane.json',
    loop: true,
    autoplay: false,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      className: "lottie-svg-class1",
    }
  };
  public optionBg: AnimationOptions = {
    path: '/assets/images/bg.json',
    loop: true,
    autoplay: false,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      className: "lottie-svg-class",
    }
  }

  public isGameStarting: boolean = false;

  public coefficientList: any[] = []
  public coeffRow: any[] = [];

  public showLoading: boolean = true;

  public isBet: boolean = false;
  public isBet2: boolean = false;
  public isFlewAway: boolean = false;
  public startCoefficient: number = 1;
  private endCoefficient: number = 2;
  private steps: number = 100;
  private intervalTime: number = 60000; // Time interval in milliseconds
  private currentIndex: number = 0;
  public betId: number = 0;
  firstStatus: string = '';
  currentStatus: string = '';

  public myBetsList: any[] = [];

  public showLogin = false;
  private animationItem: AnimationItem | undefined;
  private animationBgItem: AnimationItem | undefined;
  private animationLoadingItem: AnimationItem | undefined;
  private firstLoading: boolean = true;
  public balance: number = 0;

  public isChecked: boolean = false;
  public inputCoeff: number = 0;

  public windCoeff: number = 0;
  public winSum: number = 0;

  intervalId: any;

  isGameStarted: boolean = false;
  highlightedRows: number[] = [];
  intervalIds: any[] = [];
  mainIntervalId: any;

  public isShowAlert: boolean = false;
  public isAutoReached: boolean = false;

  // new Code
  public currentGame: any;
  public nextGame: any;
  //
  public currentBtnType: string = 'bet';

  isBetExit: boolean = false;

  public hasAlertBeenShown: boolean = true;
  interRoom: any;
  public gameStatus: string = 'waiting';
  private obs: Subject<boolean> = new Subject<boolean>();
  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    // let interval = 1000; // initial interval in milliseconds
    // let count = 0;
    //
    // const intervalId = setInterval(() => {
    //   count++;
    //   console.log("Count:", count);
    //
    //   // Decrease interval every second
    //   if (count % 1 === 0) { // Decrease interval every 1 second
    //     interval -= 100; // Decrease interval by 100 milliseconds
    //     interval = Math.max(interval, 50); // Ensure interval does not go below 50 milliseconds
    //     console.log("Interval:", interval);
    //   }
    //
    //   // Stop the interval after 10 seconds
    //   if (count >= 10) {
    //     clearInterval(intervalId);
    //     console.log("Interval stopped.");
    //   }
    // }, interval);
    this.roomService.getBalance()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
          this.balance = res.balance;
        }
      )
    this.interRoom = setInterval(() => {
      this.getRooms();
    }, 500);
    this.showLogin = !localStorage.getItem('token');
    if (!localStorage.getItem('token')) {
      this.login();
    }
    this.obs.asObservable().subscribe(res => {
      if (!this.firstLoading && res) {
        this.restart();
      }
    });
    this.getBets();

    // setTimeout(() => {
    //   const svgElement = document.getElementsByTagName('svg')[0];
    //
    //   svgElement.children[1].children[2].id='12';
    //   const s = document.getElementById('12');
    //   if (s) {
    //     s.style.opacity = String(0);
    //   }
    //   // console.log(svgElement.children[1].children[2]);
    //   (svgElement.children[1].children[3] as any).style.opacity = 0;
    // }, 1000);

    // setTimeout(() => {
    //   const svgElement = document.getElementsByTagName('svg')[0];
    //   // console.log(svgElement.children[1].children[0]);
    //   // console.log(svgElement.children[1].children[1]);
    //   // console.log(svgElement.children[1].children[4]);
    //
    //   svgElement.children[1].children[0].id='chi-0';
    //   svgElement.children[1].children[1].id='chi-1';
    //   svgElement.children[1].children[4].id='chi-4';
    //
    //   const cc1 = document.getElementById('chi-0')
    //   const cc2 = document.getElementById('chi-1')
    //   const cc3 = document.getElementById('chi-4')
    //   console.log(cc1);
    //
    //   if (cc1 && cc2 && cc3) {
    //     let i = 0;
    //     setInterval(() => {
    //       i++;
    //       console.log(i);
    //       cc1.style.transform = `translate(${i}%, 30%)`;
    //       cc2.style.transform = `translate(${i}%, 30%)`;
    //       cc3.style.transform = `translate(${i}%, 30%)`;
    //     }, 60);
    //   }
    // }, 3000);
  }

  private getBets(): void {
    this.roomService.getBetsList()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        this.myBetsList = res.map((item: any) => ({
          ...item,
          user: item.user.substring(0, 4)
        }));
      })
  }

  showAlert: boolean = true;
  nextGameTimeout: any;

  private getRooms(): void {

    this.roomService.getRoomsList()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        /// NEW CODE
        this.endCoefficient = res[1].coefficient;

        if (res[1].status === 'PLAYING') {
          this.nextGame = res[0];
          this.currentGame = res[1];
          this.showLoading = false;
          this.isGameStarted = true;
          this.hasAlertBeenShown = false;
          this.showAlert = false;
        } else if (res[1].status === "FINISHED") {
          if (!this.showAlert) {
            this.isFlewAway = true;
            setTimeout(() => {
              this.isFlewAway = false;
              this.showLoading = true;
              this.clearAllIntervals()
              this.clearHighlightedRows()
            }, 5000);
          }
          this.showAlert = true;
          this.nextGame = res[0];
          this.currentGame = res[1];
          this.isGameStarted = false;
          this.stop();
          this.stopBg();
          if (this.nextGameTimeout == null) {
            const initialDate = new Date(this.nextGame.playing_from);
            const initialTime = initialDate.getTime();
            const addedTime = 5 * 60 * 60 * 1000;
            const newTime = initialTime + addedTime;

            const newDate = new Date(newTime);
            const diff = newDate.getTime() - new Date().getTime();
            console.log("Current diff " + diff);
            this.nextGameTimeout = setTimeout(() => {
              this.play();
              this.nextGameTimeout = null;
            }, diff);
          }
        }

        // console.log(newDate.getTime());
        // console.log(new Date().getTime());
        // if (newDate.getTime() === new Date().getTime()) {
        //   this.play();
        // }
        /// OLD CODE
        this.coefficientList = [...res.slice(1), ...res];
        this.betId = res[0].id;
        this.currentStatus = res[1].status;
        this.firstStatus = res[0].status;
        this.isBet = false;
        if (res[1].status === 'PLAYING') {
          this.gameStatus = 'playing';
          this.isGameStarting = true;
          this.isBet = this.currentBtnType === 'cancel';
        } else if (res[1].status === 'FINISHED') {
          this.gameStatus = 'waiting';
          this.isBet = this.currentBtnType === 'cancel';// Retry every second
        }
      })
  }

  getTimeForCoefficient(coefficient: any) {
    if (coefficient >= 1.01 && coefficient < 1.2) {
      return 1;
    } else if (coefficient >= 1.2 && coefficient < 1.4) {
      return 1.5;
    } else if (coefficient >= 1.4 && coefficient < 3) {
      return 2;
    } else if (coefficient >= 3 && coefficient < 5) {
      return 3;
    } else if (coefficient >= 5 && coefficient < 10) {
      return 7;
    } else if (coefficient >= 10 && coefficient < 15) {
      return 9;
    } else {
      return 13;
    }
  }

  calculateTotalSteps() {
    let currentCoefficient = 1.0;
    let interval = 1000;
    let totalSteps = 0;
    let stepThreshold = 2;

    while (currentCoefficient < this.currentGame.coefficient) {
      totalSteps++;
      currentCoefficient += (this.currentGame.coefficient - 1.0) / ((this.currentGame.coefficient -  1.0) / (interval / 1000));

      if (totalSteps >= stepThreshold) {
        interval -= 50;
        stepThreshold += 2;
        if (interval <= 0) {
          interval = 50; // Set a minimum interval threshold (50 milliseconds)
        }
      }
    }

    return totalSteps;
  }

  generateIntervals(totalDuration: number, initialInterval: number, decrement: number): number[] {
    const intervals: number[] = [];
    let currentInterval = initialInterval;
    let totalSum = 0;

    while (totalSum < totalDuration) {
      intervals.push(currentInterval);
      totalSum += currentInterval;

      // Decrement every second step
      if (intervals.length % 2 === 0) {
        currentInterval -= decrement;
        // Ensure the interval doesn't go below a reasonable minimum value (e.g., 50 milliseconds)
        if (currentInterval < 50) {
          currentInterval = 50;
        }
      }
    }

    // Adjust the last interval if the total sum exceeds the totalDuration
    if (totalSum > totalDuration) {
      const lastInterval = intervals.pop()!;
      intervals.push(lastInterval - (totalSum - totalDuration));
    }

    return intervals;
  }

  public async changeCoefficientAutomatically(): Promise<void> {
    const startDate = new Date();
    const addedTime = 5 * 60 * 60 * 1000;
    const endDate = new Date(this.currentGame.playing_until);
    const totalDuration = startDate.getTime() - (endDate.getTime() + addedTime);
    const intervals = this.generateIntervals(totalDuration, 100, 5);
    let startCoefficient = 1.0;
    const endCoefficient = this.currentGame.coefficient;
    const increment = 0.01;

    // Calculate the number of steps required to reach the end coefficient
    const steps = Math.ceil((endCoefficient - startCoefficient) / increment);

    // Calculate the interval for each step
    const interval = totalDuration / steps;

    console.log('Total Duration:', totalDuration);
    console.log('Steps:', steps);
    console.log('Interval per step:', interval);

    let currentStep = 0;

    console.log(intervals);
    while (this.startCoefficient < endCoefficient) {
      await this.delay(intervals[currentStep]);
      this.startCoefficient += increment;
      console.log('Current Coefficient:', this.startCoefficient);
      currentStep++;
    }

    stop();
    this.startCoefficient = 1.0
    console.log('Final Coefficient:', this.startCoefficient);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public animationCreated(animationItem: AnimationItem): void {
    this.animationItem = animationItem;
    setTimeout(() => {
      // this.changeCoefficientAutomatically();
    }, 100);
  }

  public animationBgCreated(animationItem: AnimationItem): void {
    this.animationBgItem = animationItem;
    // this.playBg();
  }

  public playBg(): void {
    if (this.animationBgItem) {
      this.animationBgItem.play();
    }
  }

  public stopBg(): void {
    if (this.animationBgItem) {
      this.animationBgItem.stop();
    }
  }

  public play(): void {
    if (this.animationItem && !this.isGameStarted) {
      // this.isFlewAway = false;
      this.animationItem.play();
      this.playBg();
      this.changeCoefficientAutomatically();
      this.startHighlightingSequence();
    }
  }

  public pause(): void {
    if (this.animationItem) {
      this.animationItem.pause();
    }
  }

  public stop(): void {
    clearInterval(this.intervalId)
    if (this.animationItem) {
      this.animationItem.stop();
    }
  }

  public restart(): void {
    this.isFlewAway = true;
    if (this.animationItem) {
      this.isBet = false;
      this.stop();
      clearInterval(this.mainIntervalId);
      this.startCoefficient = 1;
      this.isGameStarting = false;
      this.clearAllIntervals();
      this.resetCoefficients();
      this.coeffRow = [];
      this.clearHighlightedRows();
      this.getRooms();
    }
  }

  private resetCoefficients(): void {
    this.startCoefficient = 1.0;
    this.currentIndex = 0;
  }

  public login(): void {
    const uuid = uuidv4();
    localStorage.setItem('token', uuid);
  }

  public admin(): void {
    this.router.navigate(['/admin']);
  }

  public onGetBalance(event: any): void {
    this.balance = event;
  }

  startHighlightingSequence() {
    this.startHighlighting();
    // this.mainIntervalId = setInterval(() => {
    //   // this.clearAllIntervals(); // Clear any existing intervals
    //   this.highlightedRows = []; // Reset highlighted rows
    //   this.startHighlighting();
    // }, 15500); // Repeat every 10 seconds
  }

  startHighlighting() {
    const indices = this.generateRandomIndices();
    this.highlightRow(indices[0], 1000); // Highlight first row after 3 seconds
    this.highlightRow(indices[1], 2000); // Highlight third row after 5 seconds
    this.highlightRow(indices[2], 3000); // Highlight third row after 5 seconds
    this.highlightRow(indices[3], 4000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[4], 4500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[5], 5000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[6], 5000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[7], 7000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[8], 9000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[9], 9000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[10], 10000); // Highlight fifth row after 7 seconds
  }

  generateRandomIndices(): number[] {
    const indices = [];
    const usedIndices = new Set<number>();

    while (indices.length < 10) {
      const randomIndex = Math.floor(Math.random() * this.userList.length);
      if (!usedIndices.has(randomIndex)) {
        indices.push(randomIndex);
        usedIndices.add(randomIndex);
      }
    }
    return indices;
  }

  highlightRow(rowIndex: number, timeout: number) {
    const intervalId = setTimeout(() => {
      if (this.highlightedRows.includes(rowIndex)) {
        this.highlightedRows = this.highlightedRows.filter(row => row !== rowIndex);
        this.startCoefficients[rowIndex] = 1.01;
      } else {
        this.highlightedRows.push(rowIndex);
        this.startCoefficients[rowIndex] = this.startCoefficient;
      }
    }, timeout);
    this.intervalIds.push(intervalId);
  }

  clearAllIntervals() {
    this.intervalIds.forEach(id => clearTimeout(id));
    this.intervalIds = [];
  }

  private clearHighlightedRows(): void {
    this.highlightedRows = [];
  }

  public onIsBetExist(event: boolean): void {
    this.currentBtnType = 'cancel';
  }

  public handleClickHistory(): void {
    this.isClickedHistory = !this.isClickedHistory;
  }

  public handleTab(event: any): void {
    // event.isActive = !event.isActive;
    this.currentTabType = event;
  }

  ngOnDestroy(): void {
    clearInterval(this.interRoom);
    this.startCoefficient = 1;
    this.clearAllIntervals();
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }
}
