# Punaflow

Punaflow është një aplikacion console i ndërtuar në C# që menaxhon përdorues përmes një arkitekture me shtresa. Të dhënat ruhen në një file CSV.

---

## Funksionalitetet aktuale

- Listimi i përdoruesve
- Kërkimi i përdoruesit sipas ID-së
- Shtimi i përdoruesit të ri
- Përditësimi i përdoruesit ekzistues
- Fshirja e përdoruesit

---

## Përdoruesit kryesorë

Përdoruesi kryesor është administratori ose personi që menaxhon të dhënat përmes console.

---

## Arkitektura

Projekti është ndërtuar duke përdorur një strukturë me shtresa:

- **Models** → përfaqësojnë strukturën e të dhënave
- **Services** → përmbajnë logjikën e biznesit dhe validimin
- **Data** → implementojnë repository pattern dhe ruajtjen në CSV
- **UI** → ndërfaqja console për ndërveprim me përdoruesin

---

## Patterns dhe praktikat e përdorura

- Repository Pattern
- Layered Architecture
- Separation of Concerns

---

## Teknologjitë

- C#
- .NET
- CSV file storage
- Git & GitHub

---

## Kufizimet aktuale

- Projekti përdor vetëm file-based storage (CSV)
- Nuk ka teste automatike
- Domain-i është i thjeshtuar dhe fokusohet vetëm te menaxhimi i përdoruesve
- UI është vetëm console-based

---

## Përmirësime të mundshme në të ardhmen

- Kalimi në database (p.sh. PostgreSQL)
- Shtimi i një UI grafike ose web interface
- Shtimi i testeve automatike
- Zgjerimi i domain-it (profile, projekte, etj.)

---

## Si të ekzekutohet projekti

1. Hap projektin në Visual Studio
2. Build projektin
3. Run aplikacionin
4. Përdor menunë për të menaxhuar përdoruesit