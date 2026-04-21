# Project Audit — Punaflow

## 1. Përshkrimi i projektit

Punaflow është një aplikacion console i ndërtuar në C# që menaxhon përdorues përmes një arkitekture me shtresa (Models, Services, Data, UI). Të dhënat ruhen në një file CSV.

**Çka bën sistemi?**  
Sistemi lejon menaxhimin e përdoruesve përmes operacioneve bazike si shtim, listim, përditësim dhe fshirje.

**Kush janë përdoruesit kryesorë?**  
Përdoruesi kryesor është administratori që përdor aplikacionin nga console për të menaxhuar të dhënat.

**Cili është funksionaliteti kryesor?**  
Menaxhimi i përdoruesve përmes rrjedhës:
UI → Service → Repository → CSV file

## 2. Çka funksionon mirë?

- Arkitektura me shtresa është e qartë dhe e organizuar mirë
- CRUD operacionet janë implementuar dhe funksionojnë
- Repository Pattern është përdorur për ndarjen e logjikës së të dhënave
- Kodi është relativisht i thjeshtë dhe i lexueshëm

## 3. Dobësitë e projektit

- Validimi i input-it është i kufizuar
- Përdorimi i Parse() mund të shkaktojë crash
- Nuk ka kontroll për ID që nuk ekziston gjatë update/delete
- Dokumentimi nuk përputhet plotësisht me implementimin real
- Nuk ka teste automatike
- Modeli është shumë i thjeshtë krahasuar me idenë e plotë të projektit
- Error handling është minimal dhe jo i standardizuar

## 4. 3 përmirësime që do t’i implementoj

### Përmirësimi 1 — Strukturë dhe emërtim më i pastër
**Problemi:** Emërtimi nuk është konsistent (UserServices)  
**Zgjidhja:** Riemërtim në UserService dhe pastrim i strukturës  
**Pse ka rëndësi:** Kodi bëhet më profesional dhe më i lexueshëm

### Përmirësimi 2 — Validim dhe error handling më i mirë
**Problemi:** Input-i jo valid mund të rrëzojë sistemin  
**Zgjidhja:** Përdorimi i TryParse dhe validim i plotë i fushave  
**Pse ka rëndësi:** Sistemi bëhet më i qëndrueshëm dhe më i sigurt

### Përmirësimi 3 — Dokumentim më i qartë
**Problemi:** Dokumentimi nuk përputhet me sistemin real  
**Zgjidhja:** Përditësim i README dhe shtim i dokumenteve të reja  
**Pse ka rëndësi:** E bën projektin më të kuptueshëm dhe profesional

## 5. Një pjesë që ende nuk e kuptoj plotësisht

Një pjesë që dua ta kuptoj më mirë është si ta bëj repository-n plotësisht generik në mënyrë që të punojë me modele të ndryshme pa duplikuar kod.