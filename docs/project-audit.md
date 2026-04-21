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

---

## 2. Çka funksionon mirë?

- Arkitektura me shtresa është e qartë dhe e organizuar mirë  
- CRUD operacionet janë implementuar dhe funksionojnë si duhet  
- Repository Pattern është përdorur për ndarjen e logjikës së të dhënave  
- Kodi është i thjeshtë, i lexueshëm dhe i lehtë për mirëmbajtje  

---

## 3. Dobësitë e projektit

- Validimi i input-it është i kufizuar dhe nuk mbulon të gjitha rastet  
- Përdorimi i `Parse()` mund të shkaktojë crash në rast input-i të gabuar  
- Nuk ka kontroll të plotë për ID që nuk ekziston gjatë update/delete  
- Dokumentimi nuk përputhet plotësisht me implementimin real të sistemit  
- Nuk ka teste automatike për verifikimin e funksionalitetit  
- Modeli është shumë i thjeshtuar krahasuar me idenë e plotë të projektit  
- Error handling është minimal dhe jo i standardizuar  

---

## 4. 3 përmirësime që do t’i implementoj

### Përmirësimi 1 — Strukturë dhe emërtim më i pastër
**Problemi:** Emërtimi nuk është konsistent (UserServices)  
**Zgjidhja:** Riemërtim në UserService dhe pastrim i strukturës së klasave  
**Pse ka rëndësi:** Kodi bëhet më profesional, më i lexueshëm dhe më i lehtë për mirëmbajtje  

---

### Përmirësimi 2 — Validim dhe error handling më i mirë
**Problemi:** Input-i jo valid mund të rrëzojë sistemin dhe nuk trajtohet si duhet  
**Zgjidhja:** Përdorimi i TryParse në UI dhe shtimi i validimit për fusha të ndryshme  
**Pse ka rëndësi:** Sistemi bëhet më i qëndrueshëm dhe më i sigurt ndaj gabimeve të përdoruesit  

---

### Përmirësimi 3 — Dokumentim më i qartë
**Problemi:** Dokumentimi nuk përputhet me sistemin real  
**Zgjidhja:** Përditësim i README dhe shtim i dokumenteve të analizës  
**Pse ka rëndësi:** E bën projektin më të kuptueshëm dhe më profesional për vlerësim  

---

## 5. Një pjesë që ende nuk e kuptoj plotësisht

Një pjesë që dua ta kuptoj më mirë është si ta bëj repository-n plotësisht generik, në mënyrë që të punojë me modele të ndryshme pa duplikuar logjikën e ruajtjes së të dhënave.