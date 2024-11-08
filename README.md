# Notes

Aby uruchomić ten projekt, musisz mieć zainstalowane Python i Node.js na swoim komputerze.

1. **Utwórz bazę danych**:
   - Użyj pliku `notes.sql` do utworzenia bazy danych.
   - Domyślne konto z emailem `admin@gmail.com` i hasłem `admin123` jest już utworzone.
   - Domyślne konto jest konieczne, ponieważ proces rejestracji odbywa się przez moją stronę, co nie będzie możliwe w przypadku lokalnej bazy danych.

2. **Utwórz pliki środowiskowe**:
   - W folderze głównym utwórz plik `.env` z następującymi polami:
     ```
     DB_HOST=localhost  # W przypadku lokalnej bazy danych
     DB_USER=uzytkownik_bazy
     DB_PORT=3306
     DB_NAME=nazwa_bazy_danych
     DB_PASSWORD=  # Pozostaw puste, jeśli brak hasła
     SECRET_KEY=twoj_sekret_klucz
     ```
   - W folderze `Notes` utwórz kolejny plik `.env` z następującym polem:
     ```
     VITE_API_URL="http://localhost:8000/api"
     ```

3. **Zainstaluj zależności**:
   - W terminalu uruchom:
     ```bash
     pip install -r requirements.txt
     ```
   - Po zainstalowaniu wymaganych modułów, przejdź do folderu `Notes`:
     ```bash
     cd Notes
     ```
   - W folderze `Notes` uruchom:
     ```bash
     npm install
     ```

4. **Uruchom projekt**:
   - W folderze `Notes` uruchom serwer deweloperski:
     ```bash
     npm run dev
     ```
   - W nowym oknie terminala, w folderze głównym, uruchom:
     ```bash
     python server.py
     ```

5. **Uzyskaj dostęp do aplikacji**:
   - Otwórz przeglądarkę i przejdź do [http://localhost:5173](http://localhost:5173).
   - Zaloguj się używając domyślnego konta administratora.