# Improvement Report — Punaflow

## Përmbledhje

Në këtë fazë u fokusova në përmirësimin e cilësisë së projektit ekzistues duke bërë ndryshime në strukturë, validim dhe dokumentim. Qëllimi nuk ishte shtimi i feature-ve të reja, por përmirësimi i stabilitetit dhe qartësisë së sistemit.

---

## Përmirësimi 1 — Strukturë dhe emërtim

**Problemi:**  
Në projekt përdorej emri `UserServices`, që nuk ishte konsistent dhe nuk ndiqte praktikat standarde të emërtimit në C#.

**Çfarë ndryshova:**  
- Riemërtova `UserServices` në `UserService`  
- Përditësova të gjitha referencat në `Program.cs` dhe `Menu.cs`  

**Pse është më mirë:**  
Kodi është më i pastër dhe më i lexueshëm. Emërtimi është më profesional dhe përputhet me standardet e zakonshme të zhvillimit.

---

## Përmirësimi 2 — Validim dhe reliability

**Problemi:**  
- Përdorimi i `Parse()` mund të shkaktonte crash nëse përdoruesi jepte input jo valid  
- Nuk kishte validim të plotë për fusha si email dhe role  
- Nuk kontrollohej nëse një ID ekzistonte gjatë operacioneve update dhe delete  

**Çfarë ndryshova:**  
- Në UI (`Menu.cs`) zëvendësova `Parse()` me `TryParse()` për input numerik  
- Shtova `try-catch` për të kapur gabimet gjatë ekzekutimit  
- Shtova validim për fusha si emri, email dhe role në `UserService`  
- Shtova kontroll për ekzistencën e përdoruesit para update dhe delete  

**Pse është më mirë:**  
Sistemi tani është më i qëndrueshëm dhe nuk rrëzohet nga input-e të gabuara. Përdoruesi merr feedback të qartë dhe aplikacioni sillet në mënyrë më të parashikueshme.

---

## Përmirësimi 3 — Dokumentim

**Problemi:**  
Dokumentimi nuk përputhej plotësisht me implementimin real dhe mungonin analizat e projektit.

**Çfarë ndryshova:**  
- Përditësova `README.md` për të reflektuar sistemin aktual  
- Shtova `project-audit.md` me analizën e projektit  
- Shtova `improvement-report.md` për të dokumentuar përmirësimet  

**Pse është më mirë:**  
Projekti është më i kuptueshëm për dikë që e lexon për herë të parë. Dokumentimi ndihmon në mirëmbajtje dhe e bën projektin më profesional.

---

## Çka mbetet ende e dobët në projekt

- Nuk ka teste automatike  
- Repository nuk është plotësisht generik  
- Domain-i i projektit është ende i thjeshtuar  
- UI është vetëm console-based  
- Ka hapësirë për validim më të avancuar  

---

## Reflektim

Ky proces më ndihmoi të kuptoj që ndërtimi i software-it nuk është vetëm të shkruash kod që funksionon, por të krijosh një sistem të organizuar, të qëndrueshëm dhe të mirë dokumentuar. Gjithashtu më ndihmoi të mendoj më shumë si një inxhinier softueri dhe jo vetëm si programues.