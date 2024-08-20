import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RoomService} from "../service/room.service";
import {AnimationOptions, LottieComponent} from "ngx-lottie";
import {AnimationItem} from "lottie-web";
import {filter, map, ReplaySubject, Subject, takeUntil} from "rxjs";
import {v4 as uuidv4} from "uuid";
import {Router, RouterOutlet} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {BetComponent} from "../bet/bet.component";
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterOutlet, LottieComponent, CommonModule, FormsModule, BetComponent, MatProgressBarModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})


export class GameComponent implements OnInit, OnDestroy {

  styles = {
    // maxHeight: '800px',
    // height: '100%'
  }
  color: any = 'warn';
  mode: any = 'determinate';
  bufferValue = 75;

  nextGameLoadingValue: number = 100;
  nextGameLoadingTimer: any;
  numberOfDecrements: number = 100;
  intervalDuration: number = 0;

  public currentTabType: string = '1';
  public isClickedHistory: boolean = false;

  private roomService = inject(RoomService);
  private router = inject(Router);

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
    }
  ];
  public bgAudio = new Audio('/assets/sounds/bg_music.mp3');
  private flyAwayAudio = new Audio('/assets/sounds/flyaway.mp3');
  private flyReadyAudio = new Audio('/assets/sounds/fly_ready.mp3');

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

  public coefficientList: any[] = [];

  public showLoading: boolean = true;

  public isBet: boolean = false;
  public isFlewAway: boolean = false;
  public startCoefficient: number = 1;
  private endCoefficient: number = 2;

  public betId: number = 0;
  firstStatus: string = '';
  currentStatus: string = '';

  public myBetsList: any[] = [];

  public showLogin = false;
  private animationItem: AnimationItem | undefined;
  private animationBgItem: AnimationItem | undefined;
  private firstLoading: boolean = true;
  public balance: number = 0;

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
  public backendTimeDifference: number = JSON.parse(localStorage.getItem('backendTimeDifference') ?? '0');

  //
  public currentBtnType: string = 'bet';

  public gameStatus: string = 'waiting';
  private obs: Subject<boolean> = new Subject<boolean>();
  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    this.roomService.connect();
    this.bgAudio.load()
    this.flyReadyAudio.load()
    this.flyAwayAudio.load()
    this.roomService.getBalance()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
          this.balance = res.balance;
        }
      )
    this.bgAudio.addEventListener("canplaythrough", (event) => {
      /* аудио может быть воспроизведено; проиграть, если позволяют разрешения */
      // this.bgAudio.play();

    });
    var audio = document.getElementsByTagName('audio')[0];
    var audio_play_btn = document.getElementById('audio_play_btn');
    audio_play_btn?.click();
    audio.addEventListener("canplay", () => {
      setTimeout(() => {
        audio_play_btn?.click();
        audio.play();
      }, 3000)
    });

    document.addEventListener('click', () => {
      audio.play();
    })
    //
    // this.bgAudio.addEventListener("onended", (event) => {
    //   /* аудио может быть воспроизведено; проиграть, если позволяют разрешения */
    //   this.bgAudio.load();
    //   // this.bgAudio.play();
    //   console.log('BG AUDIO ENDED')
    // });

    this.getRooms();
    this.showLogin = !localStorage.getItem('token');
    if (!localStorage.getItem('token')) {
      this.login();
    }
    this.obs.asObservable().subscribe(res => {
      if (!this.firstLoading && res) {
        // console.log('FUCK OFF')
        this.restart();
      }
    });
    this.getBets();
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

  showCurrentGameOverAlert: boolean = true;
  nextGameTimeout: any;
  timeZoneDifference: number = 5 * 60 * 60 * 1000;

  private isGamePlaying(element: any, index: number, array: any) {
    return element.status === 'PLAYING';
  }

  private isGameCreated(element: any, index: number, array: any) {
    return element.status === 'CREATED';
  }

  private isGameFinished(element: any, index: number, array: any) {
    return element.status === 'FINISHED';
  }

  private getRooms(): void {

    this.roomService.getRoomsWS()
      .pipe(
        map(res => JSON.parse(res))
      )
      .subscribe(res => {
        let indexPlayingGame = res.findIndex(this.isGamePlaying)
        let indexCreatedGame = res.findIndex(this.isGameCreated)
        let indexFinishedGame = res.findIndex(this.isGameFinished)

        /// Set next game
        /// If nextGame not same
        if (indexCreatedGame != -1 && this.nextGame?.id != res[indexCreatedGame].id) {
          console.log('Set next game')
          this.nextGame = res[indexCreatedGame];
          this.coefficientList = [...res.slice(2)];

          if (this.nextGameTimeout == null) {
            const nextGameStartDateInMillisecond = new Date(this.nextGame.playing_from).getTime() + this.timeZoneDifference;

            const nextGameStartDateLocal = new Date(nextGameStartDateInMillisecond);
            const nextGameStartFromNow = nextGameStartDateLocal.getTime() - new Date().getTime() + this.backendTimeDifference;
            console.log("Next game start in " + nextGameStartFromNow / 1000 + " sec.");
            //
            // this.intervalDuration = nextGameStartFromNow / this.numberOfDecrements;
            // this.nextGameLoadingValue = this.numberOfDecrements;
            // this.nextGameLoadingTimer = setInterval(() => {
            //   if (this.nextGameLoadingValue > 0) {
            //     this.nextGameLoadingValue -= 1;
            //   } else {
            //     clearInterval(this.nextGameLoadingTimer);
            //   }
            // }, this.intervalDuration);

            this.nextGameTimeout = setTimeout(() => {
              this.play(this.nextGame);
              var nextGameStart = new Date(this.nextGame.playing_from).getTime();
              var nextGameActualStart = new Date(this.nextGame.playing_from).getTime() + this.backendTimeDifference;

              console.log('GAME START ' + new Date(nextGameStart));
              console.log('Difference ' + this.backendTimeDifference);
              console.log('GAME START ACTUAL ' + new Date(nextGameActualStart));
              this.showLoading = false;
              this.nextGameTimeout = null;
            }, nextGameStartFromNow);
          }
        }


        /// Set current game
        /// If currentGame not same
        if (indexPlayingGame != -1 && this.currentGame?.id != res[indexPlayingGame].id) {
          console.log('Set current game')
          if (this.currentGame != null && this.currentGame!.id != res[indexPlayingGame].id) {
            this.backendTimeDifference = new Date().getTime() - (new Date(res[indexPlayingGame].playing_from).getTime() + this.timeZoneDifference)
            localStorage.setItem('backendTimeDifference', JSON.stringify(this.backendTimeDifference));
            console.log('BACKEND time difference \'playing\'' + this.backendTimeDifference / 1000);
          }
          this.currentGame = res[indexPlayingGame];
          this.showCurrentGameOverAlert = false;
        }

        let isCurrentGameFinished = res[indexFinishedGame].id === this.currentGame?.id

        if (isCurrentGameFinished && this.nextGameLoadingTimer == null) {
          this.nextGameLoadingValue = 100;

          const nextGameStartDateInMillisecond = new Date(this.nextGame.playing_from).getTime() + this.timeZoneDifference;

          const nextGameStartDateLocal = new Date(nextGameStartDateInMillisecond);
          const nextGameStartFromNow = nextGameStartDateLocal.getTime() - new Date().getTime() + this.backendTimeDifference;

          this.intervalDuration = nextGameStartFromNow / this.numberOfDecrements;
          this.nextGameLoadingValue = this.numberOfDecrements;
          this.nextGameLoadingTimer = setInterval(() => {
            if (this.nextGameLoadingValue > 0) {
              this.nextGameLoadingValue -= 1;
            } else {
              clearInterval(this.nextGameLoadingTimer);
              this.nextGameLoadingTimer = null;
            }
          }, this.intervalDuration);
        }

        /// Action on current game finished
        /// set next game timer to start play

        // if (res.some((e: any) => e.status === 'PLAYING')) {
        //   this.coefficientList = [...res.slice(2), ...res];
        // } else {
        //   this.coefficientList = [...res.slice(1), ...res];
        // }

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

  gameRuntimeCalculator(endCoef: number) {
    // Initial parameters
    let initialCoef = 1.0;
    let currentCoef = initialCoef;

    let initialDuration = 1.0;
    let increment = 0.1; // coefficient increment
    let stepDecrement = 0.010; // duration decrement per 2s step
    let stepThreshold = 1.0; // threshold for applying step decrement

    let totalDuration = 0.0;
    let currentDuration = initialDuration;

    // Calculation loop
    while (currentCoef < endCoef) {
      totalDuration += currentDuration;
      currentCoef += increment;

      // Check if we have passed a 2s threshold and adjust duration
      if (totalDuration >= stepThreshold) {
        if (currentDuration - stepDecrement <= 0.1) {
          currentDuration = 0.1;
          stepThreshold += 1.0; // update the next threshold
          continue;
        } else {
          currentDuration -= stepDecrement;
          stepThreshold += 1.0; // update the next threshold
        }
      }
    }

    return totalDuration * 1000;
  }

  generateIntervals(totalDuration: number) {
    console.log(`Total Duration ${totalDuration}`)
    let initialDuration = 100.0;  // initial duration in milliseconds
    let stepDecrement = 1.0;  // duration decrement every 10 steps in milliseconds
    let steps = 10;  // steps to apply the decrement

    let intervals = [];
    let currentDuration = initialDuration;
    let stepCounter = 0;
    let remainingDuration = totalDuration;

    while (remainingDuration > 0) {
      intervals.push(currentDuration);
      remainingDuration -= currentDuration;
      stepCounter++;

      // Check if we need to decrement the duration
      if (stepCounter === steps) {
        stepCounter = 0;  // reset step counter
        if (currentDuration - stepDecrement <= 0.01) {
          currentDuration = 0.01;
        } else {
          currentDuration -= stepDecrement;
        }
      }

      // Ensure we don't add more duration than remaining
      if (remainingDuration < currentDuration) {
        intervals.push(remainingDuration);
        break;
      }
    }

    console.log(`Intervals: ${intervals.length}`);
    return intervals;
  }

  public async changeCoefficientAutomatically(playingGame: any): Promise<void> {
    const totalDuration = this.gameRuntimeCalculator(playingGame.coefficient);
    const intervals = this.generateIntervals(totalDuration);
    let startCoefficient = 1.0;
    const endCoefficient = playingGame.coefficient;
    const increment = 0.01;

    // Calculate the number of steps required to reach the end coefficient
    const steps = Math.ceil((endCoefficient - startCoefficient) / increment);

    let currentStep = 0;

    console.log(playingGame);
    while (this.startCoefficient < endCoefficient) {
      await this.delay(intervals[currentStep]);
      this.startCoefficient += increment;
      // console.log('Current Coefficient:', this.startCoefficient, currentStep, endCoefficient);
      currentStep++;
    }
    console.log('game ended ' + this.startCoefficient + ' ' + endCoefficient);

    this.currentGame = {
      ...this.currentGame,
      'status': 'FINISHED',
    };

    this.flyawayAnimation();

    if (!this.showCurrentGameOverAlert) {
      this.isFlewAway = true;
      this.showCurrentGameOverAlert = true;

      setTimeout(() => {
        this.isFlewAway = false;
        this.showLoading = true;
        this.clearAllIntervals()
        this.clearHighlightedRows();
        this.toggleHidePlane(false)
        // console.log('FUCCCSAKCSCKAS OFFO ASOF KASF')
      }, 3000);
    }
    this.isGameStarted = false;
    this.stop();
    this.stopBg();
    // console.log('Final Coefficient:', this.startCoefficient, this.currentGame.coefficient);
    this.startCoefficient = 1.0
  }

  private toggleHidePlane(hide: Boolean) {
    var lottieSvgClass1Elements = document.getElementsByClassName('lottie-svg-class1');

    if (lottieSvgClass1Elements.length <= 0) {
      return;
    }

    var lottieSvg = lottieSvgClass1Elements[0].getElementsByTagName('g')[0].getElementsByTagName('g')

    var plane: SVGGElement[] = [];

    for (var i = 0; i < lottieSvg.length; i++) {
      lottieSvg[i].style.display = hide ? 'none' : 'block'
      var paths = lottieSvg[i].getElementsByTagName('path')
      if (paths.length > 0) {
        paths[0].style.display = hide ? 'none' : 'block'
      }
    }
  }

  private flyawayAnimation() {
    var lottieSvg = document.getElementsByClassName('lottie-svg-class1')[0].getElementsByTagName('g')[0].getElementsByTagName('g')
    var ngLottie = document.getElementsByTagName('ng-lottie')[0] as HTMLElement
    var ngLottieSvg = document.getElementsByTagName('ng-lottie')[0].getElementsByTagName('svg')[0]
    var LottieNewContainer = document.getElementsByClassName('lottie-new-container')[0] as HTMLElement

    var plane: SVGGElement[] = [];

    for (var i = 0; i < lottieSvg.length; i++) {
      if (lottieSvg[i].classList.contains('ai')) {
        plane.push(lottieSvg[i])
      } else {
        lottieSvg[i].style.display = 'none'
      }
    }

    const svgMatrix1 = plane[0].transform.animVal[0].matrix
    const initialTransform1 = getComputedStyle(plane[0]).transform;
    const initialTransform2 = getComputedStyle(plane[1]).transform;
    const initialTransform3 = getComputedStyle(plane[2]).transform;


    const keyframes1 = [
      {transform: initialTransform1},
      {transform: 'translateX(350vw) translateY(20px)'}
    ];

    const keyframes2 = [
      {transform: initialTransform2},
      {transform: 'translateX(350vw) translateY(20px)'}];

    const keyframes3 = [
      {transform: initialTransform3},
      {transform: 'translateX(350vw) translateY(20px)'}];

    // Define the animation options
    const options = {
      duration: 1300, // Animation duration in milliseconds
      easing: 'linear' // Easing function
    };
    ngLottieSvg.classList.add('flyaway')
    this.flyAwayAudio.play()
    // Start the animation
    var planeAnimation = plane[0].animate(keyframes1, options);
    plane[1].animate(keyframes2, options);
    plane[2].animate(keyframes3, options);
    planeAnimation.onfinish = (event) => {
      this.toggleHidePlane(true)
      this.flyawayAnimationRevert();
    }
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

  public play(game: any): void {
    this.flyawayAnimationRevert()
    this.toggleHidePlane(false)
    // if (this.bgAudio.paused) {
    //   this.bgAudio.play()
    // }

    if (this.animationItem && !this.isGameStarted) {
      // console.log(123)
      // this.isFlewAway = false;
      this.animationItem.play();
      this.playBg();
      this.flyReadyAudio.play();
      this.flyawayAnimationRevert()
      this.changeCoefficientAutomatically(game);
      console.log('play');
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
    // console.log('FUCKKKKK OFFFF')
    if (this.animationItem) {
      this.isBet = false;
      this.stop();
      clearInterval(this.mainIntervalId);
      this.startCoefficient = 1;
      this.isGameStarting = false;
      this.clearAllIntervals();
      this.resetCoefficients();
      this.clearHighlightedRows();
    }
  }

  private resetCoefficients(): void {
    this.startCoefficient = 1.0;
  }

  public login(): void {
    const uuid = uuidv4();
    localStorage.setItem('token', uuid);
  }

  public admin(): void {
    this.router.navigate(['/admin']);
  }

  public onGetBalance(event: any): void {
    this.balance = event + parseFloat(`0.${parseInt(localStorage.getItem('lastBalanceDouble') ?? '0')}`);
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
    this.highlightRow(indices[0], 500); // Highlight first row after 3 seconds
    this.highlightRow(indices[1], 1000); // Highlight third row after 5 seconds
    this.highlightRow(indices[2], 1500); // Highlight third row after 5 seconds
    this.highlightRow(indices[3], 1500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[4], 1900); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[5], 2000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[6], 2100); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[7], 2500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[8], 2500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[9], 3050); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[10], 3100); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[11], 3100); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[12], 3500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[13], 3550); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[14], 3950); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[15], 4150); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[16], 4250); // Highlight fifth row after 7 seconds
  }

  generateRandomIndices(): number[] {
    const indices = [];
    const usedIndices = new Set<number>();

    while (indices.length < 17) {
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
    this.startCoefficient = 1;
    this.clearAllIntervals();
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
    this.roomService.close();
  }

  private flyawayAnimationRevert() {
    try {
      var lottieSvg = document.getElementsByClassName('lottie-svg-class1')[0].getElementsByTagName('g')[0].getElementsByTagName('g')
      var ngLottie = document.getElementsByTagName('ng-lottie')[0] as HTMLElement
      var ngLottieSvg = document.getElementsByTagName('ng-lottie')[0].getElementsByTagName('svg')[0]
      var LottieNewContainer = document.getElementsByClassName('lottie-new-container')[0] as HTMLElement

      var plane: SVGGElement[] = [];


      ngLottieSvg.classList.remove('flyaway')

      // LottieNewContainer.style.removeProperty('width')
      // ngLottie.style.removeProperty('max-width')
      // ngLottieSvg.style.removeProperty('max-width')
      for (var i = 0; i < lottieSvg.length; i++) {
        if (lottieSvg[i].classList.contains('ai')) {
          plane.push(lottieSvg[i])
        } else {
          lottieSvg[i].style.display = 'block'
        }
      }
    } catch (e) {

    }
  }
}
