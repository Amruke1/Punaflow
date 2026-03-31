Javën e kaluar ndërtuat skeletin — folders, diagrame, dokumentim. Sot i jepni jetë. Implementoni operacione reale CRUD duke përdorur arkitekturën tuaj.

Ushtrim 1: Model + Repository (30 pikë) Zgjidh modelin kryesor. Krijo FileRepository me: GetAll() lexon CSV, GetById(id), Add(item), Save(). CSV me së paku 5 rekorde fillestare.

Ushtrim 2: Service me Logjikë (25 pikë) Krijo Service që përdor Repository-n. 3 metoda: Listo (me filtrim), Shto (me validim — emri jo bosh, çmimi > 0), Gjej sipas id. Service merr Repository si parameter.

Ushtrim 3: UI — Menu ose Form (25 pikë) Lidh gjithçka me ndërfaqe. Console: menu me opsione. Web: faqe me listë + formë. Rrjedha UI → Service → Repository → File duhet të funksionojë komplet.

Ushtrim 4: Dokumento (10 pikë) Shto docs/implementation.md me screenshot/output dhe shpjegim çfarë funksionon.

** Update + Delete (10 pikë)** Implemento Update dhe Delete në Repository, Service, dhe UI.

Dorëzimi: Push në GitHub, dorëzoni linkun.

Grading Criteria
Model + Repository CRUD
Model me 4+ atribute, FileRepository me GetAll/GetById/Add/Save, CSV me 5+ rekorde

30 pts
Service me Logjikë
3 metoda (Listo/Shto/Gjej), dependency injection, validim i input

25 pts
UI Funksionale
Menu/Form që lidhet me Service, Read + Create funksionojnë end-to-end

25 pts
Dokumentim
docs/implementation.md me screenshot dhe shpjegim

10 pts
Update + Delete
Update dhe Delete implementuar në Repository + Service + UI