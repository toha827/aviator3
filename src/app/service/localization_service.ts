import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  defaultLocale = 'en'; // Локализация по умолчанию
  currentLocale: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.currentLocale = this.getLocale();
  }

  // Получение локализации из URL или localStorage
  getLocale(): string {
    // Получаем параметр 'locale' из query string
    let locale = this.route.snapshot.queryParamMap.get('locale');

    // Если нет в URL, проверяем localStorage
    if (!locale) {
      locale = localStorage.getItem('locale') || this.defaultLocale;
    }

    // Сохраняем локализацию в localStorage для будущего использования
    localStorage.setItem('locale', locale);

    return locale;
  }

  // Устанавливаем новую локализацию (например, при смене языка)
  setLocale(locale: string): void {
    this.currentLocale = locale;
    localStorage.setItem('locale', locale);

    // Добавляем или обновляем параметр в URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { locale: locale },
      queryParamsHandling: 'merge', // Сохраняем другие параметры URL
    });
  }
}
