
Aplikacja webowa do przeglądania filmów i seriali, umożliwiająca wyszukiwanie, ocenianie oraz zarządzanie listą ulubionych tytułów.  
Projekt wykorzystuje **integrację z API The Movie Database (TMDB)** w celu pobierania aktualnych danych o filmach i serialach.

Aplikacja oferuje również spersonalizowane rekomendacje oraz funkcje oparte na sztucznej inteligencji.

---
##  Funkcjonalności

###  Filmy i seriale
- przeglądanie filmów i seriali
- wyszukiwanie po tytule
- podgląd szczegółów:
  - opis
  - ocena
  - obsada
  - zwiastun

###  Interakcje użytkownika
- dodawanie filmów i seriali do:
  - **ulubionych**
  - **do obejrzenia**
- ocenianie filmów
- dodawanie komentarzy

###  Rekomendacje
- polecane filmy na stronie głównej na podstawie polubionych tytułów
- **cotygodniowy e-mail** z rekomendacją filmową dopasowaną do użytkownika

###  Quiz filmowy (AI)
- interaktywny quiz
- użytkownik odpowiada na pytania dotyczące preferencji
- model **Gemini AI** rekomenduje film na podstawie odpowiedzi

---

##  Strona główna
Na stronie głównej wyświetlane są:
- polecane filmy dopasowane do gustu użytkownika
- aktualne rekomendacje
- szybki dostęp do wyszukiwarki

---
![Podgląd strony](https://i.imgur.com/N2HFWsq.png)

![Podgląd strony](https://i.imgur.com/0DAGHCn.png)

![Podgląd strony](https://i.imgur.com/xfX0ip5.png)
![Podgląd strony](https://i.imgur.com/MFN9ndz.png)

##  Powiadomienia e-mail
Użytkownicy otrzymują **raz w tygodniu** e-mail z propozycją filmu, dobraną na podstawie:
- polubionych tytułów
- wcześniejszych ocen

---
![Podgląd strony](https://i.imgur.com/C5lcmtd.png)

##  Technologie
- Frontend: React
- Backend: Express.js
- API: **The Movie Database (TMDB)**
- AI: Google Gemini
- Baza danych: MongoDB
