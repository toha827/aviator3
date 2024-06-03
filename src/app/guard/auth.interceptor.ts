import {HttpInterceptorFn} from "@angular/common/http";

const token = localStorage.getItem('token');
export const authInterceptor: HttpInterceptorFn = (request, next) => {

  request = request.clone({
    setHeaders: {
      'X-Session-Id': `${token}`,
      'ngrok-skip-browser-warning':  '69420'
    }
  })

  return next(request)
}
