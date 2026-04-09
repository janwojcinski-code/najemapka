# Media pod kontrolą

Starter aplikacji Next.js + Supabase do rozliczania mediów w mieszkaniach na wynajem.

## Co zawiera
- logowanie, rejestracja najemcy, reset hasła
- role: `admin` i `tenant`
- pulpity dla admina i najemcy
- lista mieszkań i widok szczegółów
- dodawanie odczytów: zimna woda, ciepła woda, prąd, gaz
- historia taryf z `valid_from` i `valid_to`
- lista rozliczeń i szczegóły rozliczenia
- upload zdjęć liczników do Supabase Storage
- przykładowy schemat bazy i RLS

## Start
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase
1. Utwórz projekt w Supabase.
2. Wklej SQL z pliku `supabase/schema.sql`.
3. Dodaj bucket storage o nazwie `meter-photos`.
4. W Authentication włącz logowanie emailem i reset hasła.
5. Uzupełnij `.env.local`.

## Struktura
- `app/` — routing App Router
- `components/` — komponenty wielokrotnego użytku
- `lib/supabase/` — klienci Supabase
- `supabase/schema.sql` — tabele, polityki RLS, przykładowe dane

## Uwagi
- UI bazuje na przesłanych ekranach: jasne tło, mocny niebieski CTA, duże karty, dolna nawigacja mobilna.
- To jest porządny starter MVP. Logika miesięcznego rozliczania jest pokazana na przykładach i może być rozszerzona o generowanie PDF, przypomnienia i płatności online.
