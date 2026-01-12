
import { Patient, Visit, AppSettings, DEFAULT_SETTINGS, FullDatabaseExport, Appointment, PREDEFINED_DIAGNOSES, Drug, INITIAL_DRUGS, Exam } from '../types';

const STORAGE_KEYS = {
  PATIENTS: 'it_patients',
  VISITS: 'it_visits',
  SETTINGS: 'it_settings',
  APPOINTMENTS: 'it_appointments',
  DIAGNOSES: 'it_diagnoses',
  DRUGS: 'it_drugs',
  EXAMS: 'it_exams',
  LAST_MODIFIED: 'it_last_modified'
};

const listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const updateTimestamp = () => {
  const now = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, now.toString());
  return now;
};

// Dati iniziali forniti dall'utente per gli esami
const INITIAL_EXAMS: Omit<Exam, 'id'>[] = [
    {"name": "EMOCROMO CON FORMULA", "group": "Ematologia", "subgroup": null, "test_type": "Emocromo", "target": "Sangue", "method": "Emocromo completo"},
    {"name": "ELETTROFORESI PROTEICA SIERO", "group": "Proteinogramma", "subgroup": "Siero", "test_type": "Elettroforesi", "target": "Proteine sieriche", "method": "Elettroforesi"},
    {"name": "ELETTROFORESI PROTEICA URINE", "group": "Proteinogramma", "subgroup": "Urine", "test_type": "Elettroforesi", "target": "Proteine urinarie", "method": "Elettroforesi"},
    {"name": "IMMUNOFISSAZIONE CATENE LEGGERE", "group": "Proteinogramma", "subgroup": "Immunofissazione", "test_type": "Immunofissazione", "target": "Catene leggere", "method": "Immunofissazione"},
    {"name": "INDICE DI BENCE-JONES", "group": "Proteinogramma", "subgroup": "Bence-Jones", "test_type": "Rapporto", "target": "Catene leggere libere", "method": "Calcolo quantitativo"},
    {"name": "IL-1 BETA", "group": "Citochine", "subgroup": "Pro-infiammatorie", "test_type": "Citochina", "target": "IL-1β", "method": "ELISA"},
    {"name": "IL-8", "group": "Citochine", "subgroup": "Chemiochine", "test_type": "Citochina", "target": "IL-8", "method": "ELISA"},
    {"name": "IL-6", "group": "Citochine", "subgroup": "Pro-infiammatorie", "test_type": "Citochina", "target": "IL-6", "method": "ELISA"},
    {"name": "IL-12", "group": "Citochine", "subgroup": "Pro-infiammatorie", "test_type": "Citochina", "target": "IL-12", "method": "ELISA"},
    {"name": "IL-2", "group": "Citochine", "subgroup": "T helper", "test_type": "Citochina", "target": "IL-2", "method": "ELISA"},
    {"name": "IL-22", "group": "Citochine", "subgroup": "IL famiglia", "test_type": "Citochina", "target": "IL-22", "method": "ELISA"},
    {"name": "IL-17A", "group": "Citochine", "subgroup": "Th17", "test_type": "Citochina", "target": "IL-17A", "method": "ELISA"},
    {"name": "TNF-ALFA", "group": "Citochine", "subgroup": "Pro-infiammatorie", "test_type": "Citochina", "target": "TNF-α", "method": "ELISA"},
    {"name": "CD8A", "group": "Linfociti", "subgroup": "CD8", "test_type": "Citometria", "target": "CD8+ T", "method": "Flow cytometry"},
    {"name": "CD8 CTL", "group": "Linfociti", "subgroup": "CD8 citotossici", "test_type": "Citometria", "target": "CD8 CTL", "method": "Flow cytometry"},
    {"name": "CD4N", "group": "Linfociti", "subgroup": "CD4 naïve", "test_type": "Citometria", "target": "CD4 naïve", "method": "Flow cytometry"},
    {"name": "CD4A", "group": "Linfociti", "subgroup": "CD4 attivati", "test_type": "Citometria", "target": "CD4 attivati", "method": "Flow cytometry"},
    {"name": "CD4V", "group": "Linfociti", "subgroup": "CD4 memoria", "test_type": "Citometria", "target": "CD4 memoria", "method": "Flow cytometry"},
    {"name": "TREG", "group": "Linfociti", "subgroup": "Regolatori", "test_type": "Citometria", "target": "Treg", "method": "Flow cytometry"},
    {"name": "NK", "group": "Linfociti", "subgroup": "Natural Killer", "test_type": "Citometria", "target": "NK cells", "method": "Flow cytometry"},
    {"name": "NKT", "group": "Linfociti", "subgroup": "NKT", "test_type": "Citometria", "target": "NKT cells", "method": "Flow cytometry"},
    {"name": "TSH", "group": "Tiroide", "subgroup": "Ormoni", "test_type": "Dosaggio", "target": "TSH", "method": "Chemiluminescenza"},
    {"name": "FT3", "group": "Tiroide", "subgroup": "Ormoni", "test_type": "Dosaggio", "target": "FT3 libero", "method": "Chemiluminescenza"},
    {"name": "FT4", "group": "Tiroide", "subgroup": "Ormoni", "test_type": "Dosaggio", "target": "FT4 libero", "method": "Chemiluminescenza"},
    {"name": "ANTI-TPO", "group": "Tiroide", "subgroup": "Autoanticorpi", "test_type": "Autoanticorpi", "target": "Anti-TPO", "method": "ELISA"},
    {"name": "ANTI-TG", "group": "Tiroide", "subgroup": "Autoanticorpi", "test_type": "Autoanticorpi", "target": "Anti-TG", "method": "ELISA"},
    {"name": "ANTI-TSH-R", "group": "Tiroide", "subgroup": "Autoanticorpi", "test_type": "Autoanticorpi", "target": "Anti-TSH recettore", "method": "ELISA"},
    {"name": "RT-3", "group": "Tiroide", "subgroup": "Metaboliti", "test_type": "Dosaggio", "target": "Reverse T3", "method": "Chemiluminescenza"},
    {"name": "ALT", "group": "Fegato", "subgroup": "Transaminasi", "test_type": "Enzimi", "target": "ALT", "method": "Fotometrico"},
    {"name": "ALP", "group": "Fegato", "subgroup": "Fosfatasi", "test_type": "Enzimi", "target": "ALP", "method": "Fotometrico"},
    {"name": "AST", "group": "Fegato", "subgroup": "Transaminasi", "test_type": "Enzimi", "target": "AST", "method": "Fotometrico"},
    {"name": "GGT", "group": "Fegato", "subgroup": "Gammaglutamil", "test_type": "Enzimi", "target": "GGT", "method": "Fotometrico"},
    {"name": "BILIRUBINA DIR", "group": "Fegato", "subgroup": "Bilirubina", "test_type": "Pigmenti", "target": "Bilirubina diretta", "method": "Fotometrico"},
    {"name": "BILIRUBINA INDIR", "group": "Fegato", "subgroup": "Bilirubina", "test_type": "Pigmenti", "target": "Bilirubina indiretta", "method": "Calcolata"},
    {"name": "BILIRUBINA TOT", "group": "Fegato", "subgroup": "Bilirubina", "test_type": "Pigmenti", "target": "Bilirubina totale", "method": "Fotometrico"},
    {"name": "LIPASI", "group": "Digestivi", "subgroup": "Pancreas", "test_type": "Enzimi", "target": "Lipasi", "method": "Fotometrico"},
    {"name": "AMILASI", "group": "Digestivi", "subgroup": "Pancreas", "test_type": "Enzimi", "target": "Amilasi", "method": "Fotometrico"},
    {"name": "ELASTASI", "group": "Digestivi", "subgroup": "Pancreas", "test_type": "Enzimi", "target": "Elastasi fecale", "method": "ELISA"},
    {"name": "PEPSINA", "group": "Digestivi", "subgroup": "Stomaco", "test_type": "Enzimi", "target": "Pepsinogeno", "method": "ELISA"},
    {"name": "PROGESTERONE", "group": "Endocrino", "subgroup": "Steroidi", "test_type": "Ormoni", "target": "Progesterone", "method": "Chemiluminescenza"},
    {"name": "ESTRADIOLO", "group": "Endocrino", "subgroup": "Steroidi", "test_type": "Ormoni", "target": "Estradiolo", "method": "Chemiluminescenza"},
    {"name": "DHEA", "group": "Endocrino", "subgroup": "Surrene", "test_type": "Ormoni", "target": "DHEA-S", "method": "Chemiluminescenza"},
    {"name": "TESTOSTERONE", "group": "Endocrino", "subgroup": "Steroidi", "test_type": "Ormoni", "target": "Testosterone", "method": "Chemiluminescenza"},
    {"name": "CORTISOLO", "group": "Endocrino", "subgroup": "Surrene", "test_type": "Ormoni", "target": "Cortisol", "method": "Chemiluminescenza"},
    {"name": "MELATONINA", "group": "Endocrino", "subgroup": "Epifisi", "test_type": "Ormoni", "target": "Melatonina", "method": "ELISA"},
    {"name": "ACTH", "group": "Endocrino", "subgroup": "Ipofisi", "test_type": "Ormoni", "target": "ACTH", "method": "Chemiluminescenza"},
    {"name": "GH", "group": "Endocrino", "subgroup": "Ipofisi", "test_type": "Ormoni", "target": "Growth Hormone", "method": "Chemiluminescenza"},
    {"name": "EBV IGG", "group": "Infettivologia", "subgroup": "EBV Serologia", "test_type": "Serologia", "target": "EBV IgG", "method": "ELISA"},
    {"name": "EBV IGM", "group": "Infettivologia", "subgroup": "EBV Serologia", "test_type": "Serologia", "target": "EBV IgM", "method": "ELISA"},
    {"name": "EBV RT-PCR", "group": "Infettivologia", "subgroup": "EBV Molecolare", "test_type": "PCR", "target": "EBV DNA", "method": "Real-time PCR"},
    {"name": "EBV ELISPOT LITICO", "group": "Infettivologia", "subgroup": "EBV Cellulo-mediata", "test_type": "ELISPOT", "target": "EBV lisi", "method": "ELISPOT"},
    {"name": "EBV ELISPOT LATENTE", "group": "Infettivologia", "subgroup": "EBV Cellulo-mediata", "test_type": "ELISPOT", "target": "EBV latente", "method": "ELISPOT"},
    {"name": "CMV IGG", "group": "Infettivologia", "subgroup": "CMV Serologia", "test_type": "Serologia", "target": "CMV IgG", "method": "ELISA"},
    {"name": "CMV IGM", "group": "Infettivologia", "subgroup": "CMV Serologia", "test_type": "Serologia", "target": "CMV IgM", "method": "ELISA"},
    {"name": "CMV RT-PCR", "group": "Infettivologia", "subgroup": "CMV Molecolare", "test_type": "PCR", "target": "CMV DNA", "method": "Real-time PCR"},
    {"name": "CMV ELISPOT LITICO", "group": "Infettivologia", "subgroup": "CMV Cellulo-mediata", "test_type": "ELISPOT", "target": "CMV lisi", "method": "ELISPOT"},
    {"name": "CMV ELISPOT LATENTE", "group": "Infettivologia", "subgroup": "CMV Cellulo-mediata", "test_type": "ELISPOT", "target": "CMV latente", "method": "ELISPOT"},
    {"name": "HSV1 IGG", "group": "Infettivologia", "subgroup": "HSV1 Serologia", "test_type": "Serologia", "target": "HSV-1 IgG", "method": "ELISA"},
    {"name": "HSV1 IGM", "group": "Infettivologia", "subgroup": "HSV1 Serologia", "test_type": "Serologia", "target": "HSV-1 IgM", "method": "ELISA"},
    {"name": "HSV1 RT-PCR", "group": "Infettivologia", "subgroup": "HSV1 Molecolare", "test_type": "PCR", "target": "HSV-1 DNA", "method": "Real-time PCR"},
    {"name": "HSV1 ELISPOT LITICO", "group": "Infettivologia", "subgroup": "HSV1 Cellulo-mediata", "test_type": "ELISPOT", "target": "HSV-1 lisi", "method": "ELISPOT"},
    {"name": "HSV1 ELISPOT LATENTE", "group": "Infettivologia", "subgroup": "HSV1 Cellulo-mediata", "test_type": "ELISPOT", "target": "HSV-1 latente", "method": "ELISPOT"},
    {"name": "HSV2 IGG", "group": "Infettivologia", "subgroup": "HSV2 Serologia", "test_type": "Serologia", "target": "HSV-2 IgG", "method": "ELISA"},
    {"name": "HSV2 IGM", "group": "Infettivologia", "subgroup": "HSV2 Serologia", "test_type": "Serologia", "target": "HSV-2 IgM", "method": "ELISA"},
    {"name": "HSV2 RT-PCR", "group": "Infettivologia", "subgroup": "HSV2 Molecolare", "test_type": "PCR", "target": "HSV-2 DNA", "method": "Real-time PCR"},
    {"name": "HSV2 ELISPOT LITICO", "group": "Infettivologia", "subgroup": "HSV2 Cellulo-mediata", "test_type": "ELISPOT", "target": "HSV-2 lisi", "method": "ELISPOT"},
    {"name": "HSV2 ELISPOT LATENTE", "group": "Infettivologia", "subgroup": "HSV2 Cellulo-mediata", "test_type": "ELISPOT", "target": "HSV-2 latente", "method": "ELISPOT"},
    {"name": "VZV IGG", "group": "Infettivologia", "subgroup": "VZV Serologia", "test_type": "Serologia", "target": "VZV IgG", "method": "ELISA"},
    {"name": "VZV IGM", "group": "Infettivologia", "subgroup": "VZV Serologia", "test_type": "Serologia", "target": "VZV IgM", "method": "ELISA"},
    {"name": "VZV RT-PCR", "group": "Infettivologia", "subgroup": "VZV Molecolare", "test_type": "PCR", "target": "VZV DNA", "method": "Real-time PCR"},
    {"name": "VZV ELISPOT LITICO", "group": "Infettivologia", "subgroup": "VZV Cellulo-mediata", "test_type": "ELISPOT", "target": "VZV lisi", "method": "ELISPOT"},
    {"name": "VZV ELISPOT LATENTE", "group": "Infettivologia", "subgroup": "VZV Cellulo-mediata", "test_type": "ELISPOT", "target": "VZV latente", "method": "ELISPOT"},
    {"name": "HHV6/7 IGG", "group": "Infettivologia", "subgroup": "HHV6/7 Serologia", "test_type": "Serologia", "target": "HHV6/7 IgG", "method": "ELISA"},
    {"name": "HHV6/7 IGM", "group": "Infettivologia", "subgroup": "HHV6/7 Serologia", "test_type": "Serologia", "target": "HHV6/7 IgM", "method": "ELISA"},
    {"name": "HHV6/7 RT-PCR", "group": "Infettivologia", "subgroup": "HHV6/7 Molecolare", "test_type": "PCR", "target": "HHV6/7 DNA", "method": "Real-time PCR"},
    {"name": "HHV6/7 ELISPOT LITICO", "group": "Infettivologia", "subgroup": "HHV6/7 Cellulo-mediata", "test_type": "ELISPOT", "target": "HHV6/7 lisi", "method": "ELISPOT"},
    {"name": "HHV6/7 ELISPOT LATENTE", "group": "Infettivologia", "subgroup": "HHV6/7 Cellulo-mediata", "test_type": "ELISPOT", "target": "HHV6/7 latente", "method": "ELISPOT"},
    {"name": "BORRELIA IGG", "group": "Infettivologia", "subgroup": "Borrelia Serologia", "test_type": "Serologia", "target": "Borrelia IgG", "method": "Western Blot"},
    {"name": "BORRELIA IGM", "group": "Infettivologia", "subgroup": "Borrelia Serologia", "test_type": "Serologia", "target": "Borrelia IgM", "method": "Western Blot"},
    {"name": "BORRELIA ELISPOT", "group": "Infettivologia", "subgroup": "Borrelia Cellulo-mediata", "test_type": "ELISPOT", "target": "Borrelia T-cell", "method": "ELISPOT/iSpot"},
    {"name": "RICKETTSIA IGG", "group": "Infettivologia", "subgroup": "Rickettsia Serologia", "test_type": "Serologia", "target": "Rickettsia IgG", "method": "ELISA"},
    {"name": "RICKETTSIA IGM", "group": "Infettivologia", "subgroup": "Rickettsia Serologia", "test_type": "Serologia", "target": "Rickettsia IgM", "method": "ELISA"},
    {"name": "RICKETTSIA ELISPOT", "group": "Infettivologia", "subgroup": "Rickettsia Cellulo-mediata", "test_type": "ELISPOT", "target": "Rickettsia T-cell", "method": "ELISPOT/iSpot"},
    {"name": "CHLAMYDIA PNEUMONIAE", "group": "Infettivologia", "subgroup": "Chlamydia", "test_type": "Serologia", "target": "C. pneumoniae", "method": "ELISA"},
    {"name": "CHLAMYDIA TRACHOMATIS", "group": "Infettivologia", "subgroup": "Chlamydia", "test_type": "Serologia", "target": "C. trachomatis", "method": "ELISA"},
    {"name": "MYCOPLASMA PNEUMONIAE", "group": "Infettivologia", "subgroup": "Mycoplasma", "test_type": "Serologia", "target": "M. pneumoniae", "method": "ELISA"},
    {"name": "LISTERIA MONOCITOGENES", "group": "Infettivologia", "subgroup": "Batteri", "test_type": "Serologia", "target": "Listeria m.", "method": "ELISA"},
    {"name": "YERSINIA ENTEROCOLITICA", "group": "Infettivologia", "subgroup": "Batteri", "test_type": "Serologia", "target": "Yersinia e.", "method": "ELISA"},
    {"name": "UREAPLASMA", "group": "Infettivologia", "subgroup": "Ureaplasma", "test_type": "Serologia", "target": "Ureaplasma", "method": "ELISA"},
    {"name": "MDA", "group": "Stress Ossidativo", "subgroup": "Perossidazione lipidica", "test_type": "Biomarcatore", "target": "Malondialdeide", "method": "Spettrofotometria"},
    {"name": "GLUTATIONE RIDOTTO", "group": "Stress Ossidativo", "subgroup": "Antiossidanti", "test_type": "Biomarcatore", "target": "GSH", "method": "Spettrofotometria"},
    {"name": "GLUTATIONE", "group": "Stress Ossidativo", "subgroup": "Antiossidanti", "test_type": "Biomarcatore", "target": "GSSG", "method": "Spettrofotometria"},
    {"name": "SOD", "group": "Stress Ossidativo", "subgroup": "Enzimi antiossidanti", "test_type": "Enzima", "target": "Superossido dismutasi", "method": "Spettrofotometria"},
    {"name": "NRF-2", "group": "Stress Ossidativo", "subgroup": "Fattori trascrizione", "test_type": "Fattore", "target": "NRF2", "method": "ELISA"},
    {"name": "8OH2DG", "group": "Stress Ossidativo", "subgroup": "Danno DNA", "test_type": "Biomarcatore", "target": "8-OHdG", "method": "ELISA"},
    {"name": "DPPH", "group": "Stress Ossidativo", "subgroup": "Capacità antiossidante", "test_type": "Assay", "target": "Attività antiossidante", "method": "DPPH"},
    {"name": "BAP", "group": "Stress Ossidativo", "subgroup": "Capacità antiossidante", "test_type": "Assay", "target": "Biological Antioxidant Potential", "method": "COLORIMETRIA"},
    {"name": "dROMS", "group": "Stress Ossidativo", "subgroup": "Perossidi", "test_type": "Assay", "target": "Perossidi idrosolubili", "method": "COLORIMETRIA"},
    {"name": "COLESTEROLO TOTALE", "group": "Lipidico", "subgroup": "Profilo lipemico", "test_type": "Lipidi", "target": "Colesterolo totale", "method": "Enzimatico"},
    {"name": "LDL", "group": "Lipidico", "subgroup": "Profilo lipemico", "test_type": "Lipidi", "target": "LDL-C", "method": "Diretto"},
    {"name": "HDL", "group": "Lipidico", "subgroup": "Profilo lipemico", "test_type": "Lipidi", "target": "HDL-C", "method": "Diretto"},
    {"name": "TRIGLICERIDI", "group": "Lipidico", "subgroup": "Profilo lipemico", "test_type": "Lipidi", "target": "Trigliceridi", "method": "Enzimatico"},
    {"name": "ACIDO ARACHIDONICO LDL OX", "group": "Lipidico", "subgroup": "Ossidazione", "test_type": "Biomarcatore", "target": "LDL ossidato", "method": "ELISA"},
    {"name": "COLESTEROLO OSSIDATO", "group": "Lipidico", "subgroup": "Ossidazione", "test_type": "Biomarcatore", "target": "oxLDL", "method": "ELISA"},
    {"name": "SIDEREMIA", "group": "Metabolismo Ferro", "subgroup": null, "test_type": "Ferro", "target": "Sideremia", "method": "Spettrofotometria"},
    {"name": "TRANSFERRINA", "group": "Metabolismo Ferro", "subgroup": null, "test_type": "Ferro", "target": "Transferrina", "method": "Immunoturbidimetria"},
    {"name": "FERRITINA", "group": "Metabolismo Ferro", "subgroup": null, "test_type": "Ferro", "target": "Ferritina", "method": "Chemiluminescenza"},
    {"name": "CALCIO", "group": "Elettroliti", "subgroup": null, "test_type": "Sali", "target": "Calcio", "method": "Fotometrico"},
    {"name": "FOSFORO", "group": "Elettroliti", "subgroup": null, "test_type": "Sali", "target": "Fosforo", "method": "Fotometrico"},
    {"name": "CLORO", "group": "Elettroliti", "subgroup": null, "test_type": "Sali", "target": "Cloro", "method": "Ion selective"},
    {"name": "NICKEL", "group": "Metalli Pesanti", "subgroup": null, "test_type": "Tossicologia", "target": "Nickel", "method": "ICP-MS"},
    {"name": "PIOMBO", "group": "Metalli Pesanti", "subgroup": null, "test_type": "Tossicologia", "target": "Piombo", "method": "ICP-MS"},
    {"name": "CADMIO", "group": "Metalli Pesanti", "subgroup": null, "test_type": "Tossicologia", "target": "Cadmio", "method": "ICP-MS"},
    {"name": "ARSENICO", "group": "Metalli Pesanti", "subgroup": null, "test_type": "Tossicologia", "target": "Arsenico", "method": "ICP-MS"},
    {"name": "ALLUMINIO", "group": "Metalli Pesanti", "subgroup": null, "test_type": "Tossicologia", "target": "Alluminio", "method": "ICP-MS"},
    {"name": "MERCURIO", "group": "Metalli Pesanti", "subgroup": null, "test_type": "Tossicologia", "target": "Mercurio", "method": "ICP-MS"},
    {"name": "VITAMINA B1", "group": "Vitamine", "subgroup": "B complesso", "test_type": "Vitamina", "target": "Tiamina", "method": "HPLC"},
    {"name": "VITAMINA B9", "group": "Vitamine", "subgroup": "B complesso", "test_type": "Vitamina", "target": "Acido folico", "method": "Chemiluminescenza"},
    {"name": "VITAMINA B12", "group": "Vitamine", "subgroup": "B complesso", "test_type": "Vitamina", "target": "Cobalamina", "method": "Chemiluminescenza"},
    {"name": "VITAMINA B6", "group": "Vitamine", "subgroup": "B complesso", "test_type": "Vitamina", "target": "Piridossina", "method": "HPLC"},
    {"name": "VITAMINA B2", "group": "Vitamine", "subgroup": "B complesso", "test_type": "Vitamina", "target": "Riboflavina", "method": "HPLC"},
    {"name": "VITAMINA B8", "group": "Vitamine", "subgroup": "B complesso", "test_type": "Vitamina", "target": "Biotina", "method": "ELISA"},
    {"name": "COQ10", "group": "Cofattori", "subgroup": "Mitocondriale", "test_type": "Cofattore", "target": "Coenzima Q10", "method": "HPLC"},
    {"name": "OSTEOCALCINA", "group": "Metabolismo osseo", "subgroup": null, "test_type": "Marcatore", "target": "Osteocalcina", "method": "ELISA"},
    {"name": "BDNF", "group": "Neurotrofine", "subgroup": null, "test_type": "Fattore crescita", "target": "BDNF", "method": "ELISA"},
    {"name": "FATTORI DELLA COAGULAZIONE", "group": "Coagulazione", "subgroup": "Fattori", "test_type": "Attività", "target": "Fattori coagulazione", "method": "Coagulometrico"},
    {"name": "INR", "group": "Coagulazione", "subgroup": "Controllo terapia", "test_type": "Indice", "target": "INR", "method": "Calcolato"},
    {"name": "PT", "group": "Coagulazione", "subgroup": "Via estrinseca", "test_type": "Tempo", "target": "Prothrombin time", "method": "Coagulometrico"},
    {"name": "PTT", "group": "Coagulazione", "subgroup": "Via intrinseca", "test_type": "Tempo", "target": "Partial Thromboplastin Time", "method": "Coagulometrico"},
    {"name": "ANA", "group": "Autoanticorpi", "subgroup": "Nucleo", "test_type": "Autoanticorpi", "target": "ANA", "method": "IFI"},
    {"name": "ENA REFLEX", "group": "Autoanticorpi", "subgroup": "ENA", "test_type": "Autoanticorpi", "target": "ENA panel", "method": "Line blot"},
    {"name": "ASMA", "group": "Autoanticorpi", "subgroup": "Mitocondrio", "test_type": "Autoanticorpi", "target": "ASMA", "method": "IFI"},
    {"name": "AMA", "group": "Autoanticorpi", "subgroup": "Mitocondrio", "test_type": "Autoanticorpi", "target": "AMA", "method": "ELISA"},
    {"name": "APCA", "group": "Autoanticorpi", "subgroup": "Pancreas", "test_type": "Autoanticorpi", "target": "Anti-PCA", "method": "IFI"},
    {"name": "ANTI-SPERMATOZZO", "group": "Autoanticorpi", "subgroup": "Riproduzione", "test_type": "Autoanticorpi", "target": "Anti-spermatozoi", "method": "MAR test"},
    {"name": "ANTI-OVAIO", "group": "Autoanticorpi", "subgroup": "Riproduzione", "test_type": "Autoanticorpi", "target": "Anti-ovaio", "method": "IFI"},
    {"name": "ANTI-MIELINA", "group": "Autoanticorpi", "subgroup": "Sistema nervoso", "test_type": "Autoanticorpi", "target": "Anti-mielina", "method": "ELISA"},
    {"name": "ANTI-GANGLIOSIDI", "group": "Autoanticorpi", "subgroup": "Sistema nervoso", "test_type": "Autoanticorpi", "target": "Anti-gangliosidi", "method": "Line blot"},
    {"name": "ANTI-GAD 65", "group": "Autoanticorpi", "subgroup": "Pancreas/SN", "test_type": "Autoanticorpi", "target": "Anti-GAD65", "method": "ELISA"},
    {"name": "ANTI MUSCARINICI-COLINERGICI TIPO 1", "group": "Disautonomia", "subgroup": "Muscarinici", "test_type": "Autoanticorpi", "target": "M1", "method": "ELISA"},
    {"name": "ANTI MUSCARINICI-COLINERGICI TIPO 2", "group": "Disautonomia", "subgroup": "Muscarinici", "test_type": "Autoanticorpi", "target": "M2", "method": "ELISA"},
    {"name": "ANTI MUSCARINICI-COLINERGICI TIPO 3", "group": "Disautonomia", "subgroup": "Muscarinici", "test_type": "Autoanticorpi", "target": "M3", "method": "ELISA"},
    {"name": "ANTI MUSCARINICI-COLINERGICI TIPO 4", "group": "Disautonomia", "subgroup": "Muscarinici", "test_type": "Autoanticorpi", "target": "M4", "method": "ELISA"},
    {"name": "ANTI MUSCARINICI-COLINERGICI TIPO 5", "group": "Disautonomia", "subgroup": "Muscarinici", "test_type": "Autoanticorpi", "target": "M5", "method": "ELISA"},
    {"name": "ANTI-ADRENERGICI ALFA 1", "group": "Disautonomia", "subgroup": "Adrenergici", "test_type": "Autoanticorpi", "target": "α1", "method": "ELISA"},
    {"name": "ANTI-ADRENERGICI ALFA 2", "group": "Disautonomia", "subgroup": "Adrenergici", "test_type": "Autoanticorpi", "target": "α2", "method": "ELISA"},
    {"name": "ANTI-ADRENERGICI BETA 1", "group": "Disautonomia", "subgroup": "Adrenergici", "test_type": "Autoanticorpi", "target": "β1", "method": "ELISA"},
    {"name": "ANTI-ADRENERGICI BETA 2", "group": "Disautonomia", "subgroup": "Adrenergici", "test_type": "Autoanticorpi", "target": "β2", "method": "ELISA"},
    {"name": "ANTI-TSHDS", "group": "Disautonomia", "subgroup": "Tiroide", "test_type": "Autoanticorpi", "target": "Anti-TSHds", "method": "ELISA"},
    {"name": "ANTI-FGFR3", "group": "Disautonomia", "subgroup": "Crescita", "test_type": "Autoanticorpi", "target": "Anti-FGFR3", "method": "ELISA"},
    {"name": "ETAR", "group": "Disautonomia", "subgroup": "Vascolari", "test_type": "Autoanticorpi", "target": "ETA receptor", "method": "ELISA"},
    {"name": "AT-1R", "group": "Disautonomia", "subgroup": "Vascolari", "test_type": "Autoanticorpi", "target": "AT1 receptor", "method": "ELISA"},
    {"name": "CXCR3", "group": "Disautonomia", "subgroup": "Chemiochine", "test_type": "Autoanticorpi", "target": "CXCR3", "method": "ELISA"},
    {"name": "PAR-1", "group": "Disautonomia", "subgroup": "Trombociti", "test_type": "Autoanticorpi", "target": "PAR-1", "method": "ELISA"},
    {"name": "STAB-1", "group": "Disautonomia", "subgroup": "Vascolari", "test_type": "Autoanticorpi", "target": "STAB1", "method": "ELISA"},
    {"name": "ACE 2", "group": "Disautonomia", "subgroup": "ACE2", "test_type": "Autoanticorpi", "target": "ACE2", "method": "ELISA"},
    {"name": "MAS-1", "group": "Disautonomia", "subgroup": "Angiotensina", "test_type": "Autoanticorpi", "target": "MAS receptor", "method": "ELISA"}
];

export const db = {
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  getExams: (): Exam[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!data) {
      const withIds = INITIAL_EXAMS.map(e => ({ ...e, id: crypto.randomUUID() }));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(withIds));
      return withIds;
    }
    return JSON.parse(data);
  },

  saveExam: (exam: Exam) => {
    const exams = db.getExams();
    const index = exams.findIndex(e => e.id === exam.id);
    if (index >= 0) exams[index] = exam;
    else exams.push(exam);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    notifyListeners();
  },

  deleteExam: (id: string) => {
    const exams = db.getExams().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    notifyListeners();
  },

  getDrugs: (): Drug[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DRUGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(INITIAL_DRUGS));
      return INITIAL_DRUGS;
    }
    return JSON.parse(data);
  },

  saveDrug: (drug: Drug) => {
    const drugs = db.getDrugs();
    const index = drugs.findIndex(d => d.id === drug.id || d.name.toLowerCase() === drug.name.toLowerCase());
    if (index >= 0) drugs[index] = { ...drugs[index], ...drug };
    else drugs.push(drug);
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));
    notifyListeners();
  },

  deleteDrug: (id: string) => {
    const drugs = db.getDrugs().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));
    notifyListeners();
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    updateTimestamp();
    notifyListeners();
  },

  getDiagnoses: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    return data ? JSON.parse(data) : PREDEFINED_DIAGNOSES;
  },

  addDiagnosis: (name: string) => {
    const current = db.getDiagnoses();
    if (!current.includes(name)) {
      const updated = [...current.filter(d => d !== "Altro..."), name, "Altro..."].sort();
      localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(updated));
      notifyListeners();
    }
  },

  getPatients: (): Patient[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return data ? JSON.parse(data) : [];
  },

  savePatient: (patient: Patient) => {
    const patients = db.getPatients();
    const index = patients.findIndex(p => p.id === patient.id);
    if (index >= 0) patients[index] = patient;
    else patients.push(patient);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    updateTimestamp();
    notifyListeners();
  },

  getVisits: (patientId?: string): Visit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VISITS);
    let visits: Visit[] = data ? JSON.parse(data) : [];
    if (patientId) visits = visits.filter(v => v.patientId === patientId);
    return visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getAllVisits: (): Visit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VISITS);
    return data ? JSON.parse(data) : [];
  },

  saveVisit: (visit: Visit) => {
    const visits = db.getAllVisits();
    const index = visits.findIndex(v => v.id === visit.id);
    if (index >= 0) visits[index] = visit;
    else visits.push(visit);
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    updateTimestamp();
    notifyListeners();
  },

  getAppointments: (date?: string): Appointment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    let appts: Appointment[] = data ? JSON.parse(data) : [];
    if (date) appts = appts.filter(a => a.date === date);
    return appts.sort((a, b) => (new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
  },

  saveAppointment: (appt: Appointment) => {
    const appts = db.getAppointments();
    const index = appts.findIndex(a => a.id === appt.id);
    if (index >= 0) appts[index] = appt;
    else appts.push(appt);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appts));
    updateTimestamp();
    notifyListeners();
  },

  deleteAppointment: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(db.getAppointments().filter(a => a.id !== id)));
    updateTimestamp();
    notifyListeners();
  },

  checkPassword: (input: string): boolean => {
    const settings = db.getSettings();
    return input === settings.adminPasswordHash;
  },

  exportDatabase: (): FullDatabaseExport => {
    return {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      lastModified: Date.now(),
      patients: db.getPatients(),
      visits: db.getAllVisits(),
      appointments: db.getAppointments(),
      settings: db.getSettings(),
      drugs: db.getDrugs(),
      exams: db.getExams()
    };
  },

  importDatabase: (data: FullDatabaseExport): { success: boolean; message: string } => {
    try {
      if (data.patients) localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data.patients));
      if (data.visits) localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(data.visits));
      if (data.appointments) localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.drugs) localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(data.drugs));
      if (data.exams) localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data.exams));
      
      updateTimestamp();
      notifyListeners();
      return { success: true, message: 'Database ripristinato con successo.' };
    } catch (e) {
      console.error('Import error:', e);
      return { success: false, message: 'Errore durante l\'importazione dei dati.' };
    }
  }
};
