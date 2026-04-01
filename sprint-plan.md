# Sprint 2 Plan — Amra Neziri  
Data: 1 Prill 2026  

## Gjendja Aktuale
- Projekti Punaflow ka strukturë të ndarë në:
  Models/, Services/, Data/, UI/
- Repository lexon dhe shkruan të dhëna në CSV
- Operacionet bazike CRUD janë implementuar pjesërisht
- Programi kompajlohet dhe ekzekutohet pa probleme

- Nuk funksionon ende:
  - Kërkimi dhe filtrimi i të dhënave
  - Error handling i plotë
  - Unit testet

- A kompajlohet dhe ekzekutohet programi? Po  

## Plani i Sprintit

### Feature e Re
Do të implementoj funksionalitetin e kërkimit dhe filtrimit të itemeve.

- Useri do të mund të kërkojë item sipas emrit
- Programi do të kthejë të gjitha rezultatet që përputhen
- Do të shtohet edhe filtër sipas çmimit (p.sh. mbi një vlerë të caktuar)

Implementimi:
- UI: merr input nga useri dhe shfaq rezultatet
- Service: përmban logjikën e kërkimit dhe filtrimit
- Repository: kthen të dhënat nga CSV

### Error Handling
Do të shtoj trajtim të gabimeve për të shmangur crash-in e programit:

- Nëse file mungon → krijohet automatikisht dhe shfaqet mesazh
- Nëse inputi është i pavlefshëm → shfaqet mesazh për userin
- Nëse ID nuk ekziston → shfaqet “Itemi nuk u gjet”

Try-catch do të përdoret në:
- Repository (file read/write)
- Service (logjikë dhe parsime)
- UI (input nga useri)

### Teste
Do të krijoj një projekt test dhe do të shtoj të paktën 3 teste:

- Test për shtim të itemit valid
- Test për shtim me emër bosh (duhet të dështojë)
- Test për kërkim:
  - item ekziston → gjendet
  - item nuk ekziston → nuk gjendet

