# Demo Plan - PunaFlow

## 1. Titulli i projektit

**PunaFlow**

PunaFlow është një platformë për lidhjen e klientëve me punëtorë të pavarur dhe biznese që ofrojnë shërbime.

## 2. Problemi që zgjidh

Shumë klientë kanë vështirësi të gjejnë punëtorë të besueshëm për shërbime të ndryshme. Në anën tjetër, punëtorët e pavarur dhe bizneset nuk kanë gjithmonë një vend të thjeshtë ku mund të prezantojnë shërbimet, të menaxhojnë klientët dhe të ndajnë profilin e tyre publik.

PunaFlow e zgjidh këtë problem duke ofruar:

- kërkim të punëtorëve sipas profesionit, emrit ose lokacionit
- profil publik / mini-site për punëtorë
- mini-site publik për biznese
- menaxhim klientësh dhe datash të zëna për punëtorë
- panel biznesi për punëtorë, paga dhe konkurse

## 3. Përdoruesit kryesorë

Përdoruesit kryesorë janë:

- **Klientët**, që kërkojnë punëtorë ose biznese për shërbime.
- **Punëtorët e pavarur**, që krijojnë profil publik dhe menaxhojnë klientët.
- **Bizneset**, që menaxhojnë disa punëtorë, paga, konkurse dhe mini-site publik.

## 4. Flow-i që do të demonstrohet

Flow-i kryesor që do të demonstrohet është:

**Punëtor i pavarur -> login/signup -> krijim profili -> editim mini-site -> shtim klienti -> planner me data të zëna -> hapje e mini-site publik**

Ky flow është zgjedhur sepse tregon funksionet më të rëndësishme të aplikacionit:

- autentikim
- krijim profili
- ruajtje të të dhënave
- menaxhim klientësh
- kalendar/planner
- faqe publike që mund të ndahet me të tjerët

Nëse ka kohë, do të demonstrohet edhe flow-i i biznesit:

**Kam Biznes -> login/signup biznesi -> shtim punëtorësh -> payroll -> publikim mini-site biznesi -> publikim konkursi**

## 5. Një problem real që është zgjidhur

Një problem real ishte ndarja e llogarive mes punëtorit të pavarur dhe biznesit.

Fillimisht, një user i kyçur mund të hynte në të dy pjesët e aplikacionit. Kjo krijonte konfuzion, sepse një llogari punëtori nuk duhet të funksionojë si llogari biznesi.

Zgjidhja:

- gjatë signup ruhet roli i user-it si `independent` ose `business`
- login-i kontrollon rolin
- nëse user-i hyn në pjesën e gabuar, aplikacioni e kthen te login-i përkatës
- punëtorët e një biznesi janë të ndarë sipas `user_id`

Një problem tjetër ishte ruajtja e klientëve dhe datave pas refresh-it. Kjo u zgjidh duke i ruajtur të dhënat në `localStorage` dhe duke i lexuar ato direkt kur hapet dashboard-i.

## 6. Çka mbetet ende e dobët

Pjesa që ende mund të përmirësohet është ruajtja e disa të dhënave në `localStorage`. Për një version më profesional, klientët, planner-i, konkurset, payroll dhe mini-site i biznesit duhet të ruhen në Supabase me tabela të veçanta dhe politika sigurie.

Gjithashtu, dizajni mund të përmirësohet më shumë për mobile dhe mund të shtohen validime më të forta në forma.

## 7. Struktura e prezantimit 5-7 minuta

### Hyrja

Do të prezantoj shkurt problemin: klientët kanë nevojë të gjejnë punëtorë, ndërsa punëtorët dhe bizneset kanë nevojë të prezantojnë shërbimet e tyre.

### Demo live

Do të hap aplikacionin dhe do të demonstroj flow-in e punëtorit të pavarur:

1. Kyçja ose krijimi i llogarisë
2. Krijimi i profilit
3. Editimi i mini-site
4. Shtimi i klientit
5. Shfaqja e datave të zëna në planner
6. Hapja e linkut publik të mini-site

### Shpjegimi teknik

Do të shpjegoj shkurt:

- React Router për faqet
- Supabase për autentikim dhe tabelën e punëtorëve
- `localStorage` për dashboard, klientë, planner, payroll dhe mini-site lokal
- ndarja e roleve `independent` dhe `business`

### Problemi dhe zgjidhja

Do të tregoj problemin e ndarjes së roleve dhe ruajtjes së të dhënave pas refresh-it, pastaj do të shpjegoj si u zgjidhën.

### Mbyllja

Do të përmend çka funksionon live dhe çka mbetet për përmirësim, sidomos zhvendosja e të dhënave nga `localStorage` në Supabase.

## Demo readiness dhe plan B

Për demo live do të kem gati:

- aplikacionin të hapur në `localhost:5173`
- një llogari punëtori për testim
- një llogari biznesi për testim
- disa të dhëna shembull në forma
- README-in dhe këtë dokument si plan B

Nëse diçka nuk funksionon live, do të përdor:

- screenshot ose shpjegim të flow-it
- README-in
- këtë demo-plan
- build-in lokal të projektit

