import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class RoomService {
  private readonly baseUrl = 'https://api.1pscpy.com';
  private http = inject(HttpClient);
  private socket: any;

  public receiveRooms$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public checkIsAuto$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public checkShowOver: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public getCoeffAdmin(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/admin`);
  }

  public getRoomsWS(): Observable<any> {
    return this.receiveRooms$.asObservable();
  }

  public setRoomsWS(value: any): void {
    this.receiveRooms$.next(value);
  }

  close(): void {
    if (this.socket) {
      this.socket.complete();
    }
  }

  connect(): void {
    this.socket = new WebSocket('wss://api.1pscpy.com/v1/rooms/websocket');

    this.socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    this.socket.onmessage = (event: any) => {
      // console.log('Received message:', event.data);
      this.setRoomsWS(event.data);
    };

    this.socket.onclose = (event: any) => {
      console.log('WebSocket connection closed:', event);
    };

    this.socket.onerror = (error: any) => {
      console.error('WebSocket error:', error);
    };
  }

  public getBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/bets/balance`);
  }

  public setBalance(body: { amount: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/bets/set-balance`, body);
  }

  public getIsCheckedAuto() {
    return this.checkIsAuto$.asObservable();
  }

  public setIsCheckedAuto(value: any): void {
    this.checkIsAuto$.next(value);
  }

  public setCoeff(value: any) {
    this.checkShowOver.next(value);
  }

  public getCoeff() {
    return this.checkShowOver.asObservable();
  }

  public getRoomsList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/rooms`);
  }

  public getRoomById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/rooms/${id}`);
  }

  public makeBet(body: { amount: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/bets`, body);
  }

  public getBetsList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/bets`);
  }

  public withdraw(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/bets/withdraw`);
  }

  public cancelBet(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/v1/bets/cancels/${id}`, {})
  }

  public addCoefficient(body: { coefficient: number[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/bets/add-coefficients`, body);
  }

}
