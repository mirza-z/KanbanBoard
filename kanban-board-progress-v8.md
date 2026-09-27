# Kanban Board Portfolio Project — Progress Summary (v8)

## Cilj projekta
Portfolio projekat za internship/job aplikacije. Real-time kolaborativna kanban tabla, koristi se kao dokaz znanja iz:
- CQRS pattern (MediatR)
- EF Core + PostgreSQL
- SignalR (real-time sync + presence)
- Angular frontend
- JWT + Google OAuth

## Status: funkcionalno GOTOVO, ostaje deploy
Sve funkcije i pred-deploy poliranje su završeni (v8). Preostaje kratka provjera sitnica (sekcija C) i deploy (sekcija D).

## Tech stack (odlučeno)
- **Backend:** ASP.NET Core Web API, .NET 10 LTS, MediatR (CQRS), EF Core, FluentValidation
- **Baza:** PostgreSQL (odabrano umjesto SQL Server zbog lakšeg besplatnog hostinga: Render/Railway/Supabase/Neon)
- **API dokumentacija:** Scalar (`AddOpenApi()` + `MapScalarApiReference()`, samo u Development)
- **Frontend:** Angular (TypeScript, SCSS), zoneless (bez zone.js), bez SSR
- **Real-time:** SignalR — Hub sa grupama po `boardId`, eventi + presence tracking
- **Auth:** JWT izdat od backend-a nakon Google OAuth prijave (vlasnici), anonimni gosti
- **Jezik UI-ja i API poruka:** engleski (prevedeno u v8)

## Struktura repozitorija
```
KanbanBoard/                      <- git repo root (github.com/mirza-z/KanbanBoard)
  .gitignore
  KanbanBoardApi/
    KanbanBoardApi.slnx
    Program.cs
    appsettings.json               <- BEZ stvarnih tajni (Demo:ResetIntervalMinutes opcionalno)
    Controllers/
      AuthController.cs            <- POST /api/auth/google-login (Google idToken -> naš JWT)
      BoardsController.cs
      ColumnsController.cs
      CardsController.cs
    Domain/Entities/
      Board.cs, Column.cs, Card.cs
    Data/
      KanbanDbContext.cs
      DemoSeeder.cs                <- SeedAsync + ResetAsync (fiksni Id, OwnerId = "demo")
      DemoResetService.cs          <- BackgroundService, PeriodicTimer, reset + BoardChanged broadcast
    Features/
      Common/
        BasePagedQuery.cs, PageRequest.cs, PageResult.cs
        CardDto.cs
        Exceptions.cs              <- NotFoundException, ConflictException, ForbiddenException
        GlobalExceptionHandler.cs  <- IExceptionHandler, ProblemDetails (403/404/409/500)
        ValidationBehavior.cs
        ClaimsExtensions.cs        <- User.GetOwnerId() (čita "sub" claim)
      Boards/    Commands/ Create | Update | Delete    Queries/ GetById | List
      Columns/   Commands/ Create | Update (rename) | Delete | Reorder    Queries/ GetById | List
      Cards/     Commands/ Create | Update | Delete | Move    Queries/ GetById
    Hubs/
      BoardHub.cs                  <- grupe po boardId, JoinBoard(boardId, guestName)
      PresenceTracker.cs           <- IPresenceTracker + InMemoryPresenceTracker
    (JwtSettings, IJwtTokenService/JwtTokenService — izdavanje JWT-a)
    Migrations/
  kanban-board-client/              <- Angular, zoneless, SCSS, bez SSR
    public/favicon.svg             <- vlastita ikona (amber + papir kolone), Angular favicon.ico obrisan
    src/
      index.html                   <- title "Kanban Board", lang="en", GSI skripta, Google fontovi
      environments/
        environment.ts             <- apiUrl, googleClientId, demoBoardId
        environment.production.ts
      app/
        core/auth/                 <- auth.service, auth.model, auth.interceptor, auth.guard, google-singin
        api-services/              <- boards/ columns/ cards/ shared/ + shared/board-hub.service.ts
        pages/
          landing/                 <- landing.ts/.html/.scss (dispatch/ticket dizajn)
          board-list/              <- header (brand + avatar + Sign out), kartice s datumom kreiranja
            board-form/
          board-view/              <- kolone/kartice, drag & drop, live sync, presence, share link dugme, guest name dijalog
            column-form/ card-form/
        shared/ modal/ confirm-dialog/ guest-name-dialog/
        app.routes.ts
```
Svaki command ima svoj `...Validator` u istom folderu.

**Secrets:** User Secrets lokalno (`Jwt:Secret`, `Google:ClientId`, `ConnectionStrings:DefaultConnection`), NE u `appsettings.json`.

## Domain model
```
Board:  Id, Title, OwnerId (string = Google "sub" claim; "demo" za demo board), CreatedAt, Columns
Column: Id, Title, Order, BoardId (FK), Cards
Card:   Id, Title, Description (string?), Order, Version (int, počinje od 1), ColumnId (FK)
```
Cascade delete: Board→Columns, Column→Cards.

## Šta je GOTOVO

### Backend (CRUD, realtime, infrastruktura)
Board/Column/Card CRUD, `MoveCardCommand` i `ReorderColumnsCommand` (optimistic concurrency preko `Version`), `BoardHub` + `PresenceTracker`, custom exceptioni + `GlobalExceptionHandler`, FluentValidation kroz MediatR pipeline behavior, `HasMaxLength` ograničenja, CORS `AngularDev` sa `AllowCredentials()`.

### Auth (backend)
- `POST /api/auth/google-login`: Google `idToken` → validacija (`GoogleJsonWebSignature`, audience = `Google:ClientId`) → vlastiti JWT `{ token, ownerId, email, name }`.
- JWT: HS256, `Jwt:Secret` (min. 32 znaka), Issuer `KanbanBoardApi`, Audience `KanbanBoardClient`, **7 dana, bez refresh tokena**.
- `Program.cs`: `AddJwtBearer` + `OnMessageReceived` čita `access_token` iz query stringa za `/hubs/board`. Redoslijed: `UseCors` → `UseAuthentication` → `UseAuthorization`.
- Ownership pravila:
  | Endpoint | Pristup |
  |---|---|
  | Board Create | `[Authorize]`, `OwnerId` iz tokena (kontroler prepisuje body) |
  | Board List | `[Authorize]`, filter `OwnerId == token` prije pretrage i paginacije |
  | Board Update / Delete | `[Authorize]` + `RequesterId`; handler: `null` → 404, pa `OwnerId != RequesterId` → 403 |
  | Board GetById | otvoreno (share link) |
  | ReorderColumns, sve Column/Card akcije | otvoreno (gosti mogu editovati) |
- **Ownership testovi prošli** (403 za tuđi board, 404 za nepostojeći ID, 401 bez tokena, 403 za demo board, izolacija listi).

### Auth (frontend)
`GoogleSignin`, `AuthService` (signali + localStorage `kanban_auth_token` / `kanban_auth_user`), `authInterceptor` (token samo za `apiUrl`, 401 → logout + redirect na `/`), `authGuard`. Rute: `/` Landing, `/boards` (guard), `/board/:id` (otvoreno), `**` → `/`.

### SignalR auth + gosti
Hub bez `[Authorize]`; `accessTokenFactory` šalje token ako postoji. `JoinBoard(boardId, guestName)`: prijavljen → ime iz JWT-a; gost → uneseno ime (trim, max 30); inače `Guest ###`. `GuestNameDialog` pri ulasku gosta (ime u `kanban_guest_name`), "Skip" → nasumično ime.

### Demo board
`DemoSeeder` (fiksni `DemoBoardId = a1b2c3d4-0000-4000-8000-000000000001`, `OwnerId = "demo"`, 3 kolone sa uputama na engleskom). Niko ne može preimenovati/obrisati ga (403), ne pojavljuje se u listama. **`DemoResetService`** (`BackgroundService` + `PeriodicTimer`, interval `Demo:ResetIntervalMinutes`, default 60) briše demo board i seeduje ga ponovo, pa šalje `BoardChanged` u grupu demo boarda da otvoreni klijenti refetch-uju.

### UI/dizajn poliranje (v8)
- **Share link dugme** na board-view (`navigator.clipboard`, "Copy link" → "Copied ✓").
- **Landing redizajn** u dispatch/ticket stilu: naslov, papirnata "sign-in" kartica s Google dugmetom i linkom na demo, statički hero board s nagnutim karticama i dva primjera kursora. Mockup: https://claude.ai/artifact/6n38CJ691nRfz9MsGCAEoA
- **Board list:** header s logom, avatarom (inicijal), imenom i "Sign out" dugmetom; kartice prikazuju datum kreiranja umjesto `ownerId`.
- **Prevod na engleski:** sve forme, dijalozi, board-view, board-list, guest dialog, backend poruke i sadržaj demo boarda.
- **Favicon i title:** vlastita `favicon.svg`, `<title>Kanban Board</title>`.

### Dizajn sistem (za referencu)
Boje `#14181D` / `#1D242B` / `#E8E1D2` / `#D98E04` / `#3E7C79` / `#A63D2F`; Archivo Narrow, IBM Plex Sans, IBM Plex Mono; oštri uglovi, tvrde sjenke, perforirane kartice.

---

## PRIJE DEPLOYA — brza provjera (C)
- [ ] `Jwt:Issuer` i `Jwt:Audience` postoje u konfiguraciji (bez njih svaki token biva odbijen)
- [ ] Nula rezultata za `throw new Exception` (Ctrl+Shift+F); tipfeler `"Forbiden"` → `"Forbidden"`; višak `using static ...DbLoggerCategory;` uklonjen iz `ListBoardsQueryHandler`
- [ ] Sve migracije commitovane (`Migrations/` uključujući `KanbanDbContextModelSnapshot.cs`)
- [ ] `Program.cs`: nema duplog `AddMediatR`; `UseCors` iza `UseHttpsRedirection`, ispred `UseAuthentication`
- [ ] `CreateColumnCommandHandler` duplicate provjera case-insensitive (`ToLower()`)
- [ ] `UpdateBoardCommand` ima validator; `CreateBoardCommand.OwnerId` nema `required`/validator konflikt
- [ ] `git status` čist, nema tajni u repozitoriju

---

## DEPLOY — koraci (D)

**Redoslijed je bitan** zbog međusobnih zavisnosti: API treba URL frontenda (CORS), frontend treba URL API-ja, Google treba URL frontenda. Zato: API → frontend → povezivanje.

### D1. Kod backenda za produkciju (prije prvog deploya)
1. **CORS iz konfiguracije** umjesto hardkodiranog `localhost:4200`:
   ```csharp
   var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                 ?? new[] { "http://localhost:4200" };
   policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
   ```
   Na serveru: `Cors__AllowedOrigins__0=https://tvoj-frontend.pages.dev` (bez `/` na kraju).
2. **Migracije pri startu**, prije seeda:
   ```csharp
   using (var scope = app.Services.CreateScope())
   {
       var ctx = scope.ServiceProvider.GetRequiredService<KanbanDbContext>();
       await ctx.Database.MigrateAsync();
       await DemoSeeder.SeedAsync(ctx);
   }
   ```
3. **HTTPS iza proxyja:** hosting terminira TLS ispred aplikacije, pa `UseHttpsRedirection` može praviti probleme (redirect petlje ili upozorenja). Ili dodaj `UseForwardedHeaders` (`XForwardedFor | XForwardedProto`) ili preskoči `UseHttpsRedirection` u Production.
4. **Port:** host obično daje port kroz `PORT` env varijablu; aplikacija mora slušati na njemu (npr. `ASPNETCORE_URLS=http://0.0.0.0:$PORT`, ovisno o platformi).
5. **Dockerfile** (potreban za Render i Fly, Railway može i bez):
   ```dockerfile
   FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
   WORKDIR /src
   COPY KanbanBoardApi/ KanbanBoardApi/
   RUN dotnet publish KanbanBoardApi/KanbanBoardApi.csproj -c Release -o /app

   FROM mcr.microsoft.com/dotnet/aspnet:10.0
   WORKDIR /app
   COPY --from=build /app .
   ENTRYPOINT ["dotnet", "KanbanBoardApi.dll"]
   ```
   (prilagodi putanje i naziv `.csproj` fajla; provjeri da li tvoj repo ima `.slnx` u `KanbanBoardApi/`).
6. **Postgres connection string:** hosting često daje URL oblika `postgres://user:pass@host:port/db`, a Npgsql traži `Host=...;Port=...;Database=...;Username=...;Password=...`. Neki provideri (npr. Neon) traže i `SSL Mode=Require`. Provjeri format u dokumentaciji izabranog providera.

### D2. Baza + API
1. Izaberi hosting (Render / Railway / Fly.io; baza može i na Neon/Supabase). **Provjeri aktuelni besplatni plan** prije odluke, uslovi se mijenjaju.
2. Napravi PostgreSQL instancu, uzmi connection string.
3. Napravi web servis iz GitHub repoa (grana `main`), Docker build.
4. Postavi env varijable:
   | Varijabla | Vrijednost |
   |---|---|
   | `ConnectionStrings__DefaultConnection` | connection string u Npgsql formatu |
   | `Jwt__Secret` | **novi**, min. 32 znaka (npr. 64 nasumična bajta u base64), ne isti kao lokalni |
   | `Jwt__Issuer` | `KanbanBoardApi` |
   | `Jwt__Audience` | `KanbanBoardClient` |
   | `Google__ClientId` | isti Client ID kao lokalno |
   | `Cors__AllowedOrigins__0` | URL frontenda (popuni u D4) |
   | `Demo__ResetIntervalMinutes` | `60` (opcionalno) |
   | `ASPNETCORE_ENVIRONMENT` | `Production` |
5. Deploy, u logovima potvrdi da su se migracije primijenile i da je demo board seedovan.
6. Zapiši javni URL API-ja (npr. `https://kanban-api.onrender.com`).
7. Provjera: otvori `https://<api>/api/boards/a1b2c3d4-0000-4000-8000-000000000001`, treba vratiti demo board (JSON).

### D3. Frontend
1. `environment.production.ts`: pravi `apiUrl` (`https://<api>/api`), `googleClientId`, `demoBoardId`. Provjeri da `angular.json` za production konfiguraciju ima `fileReplacements` na taj fajl (ako si okruženja pravio ručno).
2. Lokalni test build: `ng build`, izlaz je u `dist/kanban-board-client/browser`.
3. Cloudflare Pages ili Netlify: poveži repo, root direktorij `kanban-board-client`, build komanda `ng build`, output `dist/kanban-board-client/browser`.
4. **SPA fallback** (bez toga direktan link `/board/{id}` daje 404): dodaj `public/_redirects` sa
   ```
   /* /index.html 200
   ```
   (radi na Netlify i Cloudflare Pages).
5. Zapiši javni URL frontenda.

### D4. Povezivanje
1. **API:** postavi `Cors__AllowedOrigins__0` na URL frontenda (tačan origin, bez `/`), restartuj servis.
2. **Google Cloud Console** → Credentials → tvoj OAuth Client → *Authorized JavaScript origins*: dodaj URL frontenda. Lokalni `http://localhost:4200` ostavi. Promjena može trajati nekoliko minuta.
3. Provjeri da frontend šalje pozive na produkcijski API (Network tab).

### D5. Smoke test na produkciji
- [ ] Landing se učitava, favicon i naslov ispravni
- [ ] "Try a demo board" otvara demo board; guest name dijalog radi
- [ ] Google prijava radi, redirect na `/boards`
- [ ] Kreiranje boarda, kolone, kartice; drag & drop
- [ ] "Copy link" → link otvoren u Incognito prozoru, ulazak kao gost
- [ ] Dva prozora: kursori uživo i live sync (WebSocket radi, u Network → WS vidi se konekcija)
- [ ] `PUT`/`DELETE` demo boarda → 403
- [ ] Direktan URL `/board/{id}` (osvježavanje stranice) radi, SPA fallback aktivan
- [ ] Nakon reset intervala demo board se vraća na početno stanje

### D6. Sigurnost i čišćenje
- [ ] Nova lozinka lokalnog Postgresa ako se koristi igdje drugo (ranije zalijepljena u chat)
- [ ] Produkcijski `Jwt__Secret` nije nigdje u repozitoriju ni u chatu
- [ ] Scalar/OpenAPI se mapira samo u Development (već tako u `Program.cs`)

### D7. README i portfolio
- [ ] Screenshot/GIF (dva kursora uživo je najbolji kadar)
- [ ] Link na live demo + napomena o **cold startu** (besplatni plan uspavljuje server, prvi zahtjev može trajati oko minutu)
- [ ] Kratak opis arhitekture i odluka (većina je u ovom dokumentu), tech stack, poznata ograničenja
- [ ] Link na repo dodati u CV/LinkedIn/aplikacije

---

## Plan dalje
1–8. ~~Sve funkcionalnosti (CRUD, styling, drag & drop, reorder, SignalR, presence, auth)~~ ✅
8.5. ~~Pred-deploy poliranje (share link, reset demo, landing, board list, engleski, favicon, ownership testovi)~~ ✅
9. Provjera sitnica (C) → **Deploy (D1–D7)** ← sljedeći korak

## Arhitekturne odluke i zašto (za intervju/case-study)

(Odluke iz v6/v7 i dalje važe: CQRS opravdanje, jedan projekat sa folderima, PostgreSQL, DTO-ovi, server računa `Order`, reorder kao zasebna komanda, uniqueness samo gdje domen traži, optimistic concurrency kao glavna "war story", globalni exception handler, validacija kao pipeline behavior, zoneless Angular, feature-based `api-services/`, jedna forma za create/edit, CDK Dialog umjesto routinga.)

Auth i realtime (v7):
- **Model C (hibrid auth):** čuva "real-time collaboration demo" karakter (bilo ko otvori share link i odmah edituje), a vlasnik ima "moj dashboard".
- **`OwnerId` iz JWT-a, nikad iz klijenta:** kontroler prepisuje body, `ListBoardsQuery` se filtrira po tokenu.
- **Autorizacija u handleru, ne samo `[Authorize]`:** `[Authorize]` kaže *ko je*, provjera `OwnerId != RequesterId` kaže *šta smije*. Redoslijed `null` → 403 sprječava curenje informacije i 500.
- **`ForbiddenException` → 403 na jednom mjestu** (`GlobalExceptionHandler`).
- **Selektivna zaštita endpointa:** samo board-level akcije traže vlasnika; Column/Card akcije i GetById su otvoreni zbog share-link modela.
- **JWT bez refresh tokena, 7 dana:** pojednostavljeno za portfolio scope; interceptor na 401 radi logout i redirect.
- **SignalR auth preko `access_token` query stringa:** browser WebSocket API ne dozvoljava custom headere na handshake-u.
- **Hub bez `[Authorize]`, identitet iz `Context.User`:** ime prijavljenog iz JWT-a (ne može se lažirati), ime gosta je nepouzdan tekst (trim + max 30 znakova); Angular escapuje interpolaciju.
- **Gosti bez guest JWT-a:** identitet postoji samo unutar SignalR konekcije.
- **Demo board kao fiksni seed sa `OwnerId = "demo"`:** ownership provjera ga automatski štiti bez posebnog koda.
- **Interceptor šalje token samo na `apiUrl`:** token ne curi prema trećim stranama.

Novo u v8:
- **Periodični reset demo boarda kroz `BackgroundService`:** javno editabilan demo se sam vraća na početno stanje. `IServiceScopeFactory` jer je `DbContext` scoped, a servis singleton; `try/catch` unutar petlje da jedna greška ne ruši servis; `BoardChanged` broadcast da otvoreni klijenti odmah vide reset.
- **`ExecuteDeleteAsync` za reset:** jedan SQL upit, cascade briše kolone i kartice bez učitavanja u memoriju.
- **Dekorativni hero na landingu kao podaci u nizovima:** tekst kartica i kursora mijenja se na jednom mjestu, a šablon koristi `@for`.
- **Board list ne prikazuje `ownerId`:** korisnik vidi samo svoje boardove, pa je Google `sub` bio šum; datum kreiranja je korisnija informacija.

**Poznata ograničenja (prihvatljiva za portfolio scope):**
- Race condition na `Order` pri Create-u (rješenje: unique index ili transakcija).
- Dva istovremena pomjeranja različitih kartica u istoj koloni mogu dati dupli `Order`; broadcast + refetch to ispravlja.
- Delete ostavlja rupe u `Order`-u; sortiranje ih ignoriše, a Move ih popravlja.
- Case-insensitive duplicate provjera zavisi o `ToLower()` u svakom handleru (jedinstveni indeks bi bio čvršći).
- JWT bez refresh tokena: nakon 7 dana potrebna ponovna prijava.
- Column/Card endpointi su otvoreni svakom ko zna GUID (namjerno, share-link model); nema per-board kontrole pristupa.
- `InMemoryPresenceTracker` ne radi s više instanci servera (potreban Redis backplane).
- Demo reset: ko u trenutku reseta ima otvoren dijalog za edit kartice, dobit će grešku pri spremanju. Timer ne radi dok besplatni server spava.

## Problemi na koje smo naišli (kandidati za "war stories")
- **User secrets:** pogrešno kucane komande završile su kao ključevi; `dotnet user-secrets clear`, pa ponovo. Ključ i vrijednost kao dva odvojena argumenta, bez `=`.
- **`IDX10720` (HS256 ključ prekratak):** 27 znakova = 216 bita, traži se ≥ 256 bita (32 znaka).
- **Google `The given origin is not allowed for the given client ID`:** frontend origin (`http://localhost:4200`, ne backend `7059`) mora biti u *Authorized JavaScript origins*. `Cross-Origin-Opener-Policy` i `ERR_BLOCKED_BY_CLIENT` (ad-blocker) su šum.
- **Dupli `provideHttpClient()`** u `app.config.ts`.
- **`NullReferenceException` umjesto 404:** provjera vlasnika prije `null` provjere.
- **Pokvarena duplicate provjera:** `Title == titleLower` umjesto `Title.ToLower() == titleLower`.
- **Reload stranice pri submitu dijaloga:** `(ngSubmit)` ne radi bez `FormsModule`/`[formGroup]`, pa browser radi običan HTML submit; riješeno `(submit)` + `preventDefault()`.

## Git
Repo: `github.com/mirza-z/KanbanBoard`, grana `main`. Klijent: Fork. Commit po slice-u (subject: engleski, imperativ; opcionalni description s bullet listom). Commiti iz v8 (provjeriti da su svi napravljeni): `Add copy share link button to board view`, `Add periodic demo board reset`, `Redesign landing page in dispatch/ticket style`, `Restyle board list header with account area and sign-out button`, `Translate UI text and API messages to English`, `Replace default Angular favicon and page title`.

---

## Prompt za nastavak u novom chatu
Zalijepi cijeli dokument i reci:

> "Nastavljam rad na Kanban Board portfolio projektu. U prilogu je progress summary (v8). Aplikacija je funkcionalno gotova: backend (.NET 10, MediatR CQRS, EF Core, PostgreSQL, SignalR + presence), frontend (Angular zoneless, CDK drag & drop, real-time sync), auth (Google OAuth → JWT 7 dana, ownership provjere, anonimni gosti, demo board sa periodičnim resetom), landing i board list redizajnirani, UI i API poruke na engleskom. Ownership testovi prošli. Sljedeće je brza provjera sitnica (sekcija C) i deploy po koracima D1–D7 (backend kod za produkciju: CORS iz konfiguracije, MigrateAsync, forwarded headers, Dockerfile; API + Postgres hosting; Angular na Cloudflare Pages/Netlify sa SPA fallbackom; Google origin za produkciju; smoke test; README). Backend folder struktura je Features/{Entity}/Commands|Queries/{Action}/, frontend je api-services/{entity}/ + pages/{page}/ + shared/ + core/auth/."
