/**
 * One-time enrichment: adds quizTrait to every row in src/data/items.json
 * Run: node scripts/enrich-items-quiz-traits.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const ITEMS_PATH = join(ROOT, "src", "data", "items.json");
const LEARN_DIR = join(ROOT, "content", "learnMore");

/** slug -> therapeutic class (150 drugs) */
const DRUG_TRAITS = {
  acetaminophen: "Analgesic/antipyretic — mild pain and fever",
  acyclovir: "Antiviral — herpesvirus infections",
  adalimumab: "TNF inhibitor biologic — autoimmune disease",
  aemcolo: "Rifamycin antibiotic — traveler's diarrhea",
  albuterol: "Short-acting beta-2 agonist — bronchospasm",
  allopurinol: "Xanthine oxidase inhibitor — gout",
  alprazolam: "Benzodiazepine — anxiety and panic disorder",
  amiodarone: "Class III antiarrhythmic — ventricular arrhythmias",
  amlodipine: "Calcium channel blocker — hypertension",
  amoxicillin: "Penicillin antibiotic — bacterial infections",
  apixaban: "Factor Xa inhibitor — anticoagulation",
  aripiprazole: "Atypical antipsychotic — schizophrenia and bipolar disorder",
  atorvastatin: "Statin — hyperlipidemia",
  azithromycin: "Macrolide antibiotic — atypical infections",
  biktarvy: "INSTI/NRTI combination — HIV-1",
  bisacodyl: "Stimulant laxative — constipation",
  brimonidine: "Alpha-2 agonist — glaucoma",
  budesonide: "Inhaled corticosteroid — asthma and COPD",
  buprenorphine: "Partial opioid agonist — opioid use disorder and pain",
  bupropion: "NDRI antidepressant — depression and smoking cessation",
  buspirone: "Anxiolytic — generalized anxiety disorder",
  carvedilol: "Beta-blocker — heart failure and hypertension",
  ceftriaxone: "Third-generation cephalosporin — serious infections",
  cephalexin: "First-generation cephalosporin — skin and soft-tissue infections",
  chlorthalidone: "Thiazide-like diuretic — hypertension",
  ciprofloxacin: "Fluoroquinolone antibiotic — urinary and GI infections",
  citalopram: "SSRI antidepressant — depression",
  clindamycin: "Lincosamide antibiotic — anaerobic infections",
  clonazepam: "Benzodiazepine — seizures and panic disorder",
  clopidogrel: "P2Y12 inhibitor — antiplatelet therapy",
  colchicine: "Antigout agent — acute gout flares",
  cyclobenzaprine: "Muscle relaxant — musculoskeletal spasm",
  diazepam: "Benzodiazepine — anxiety and muscle spasm",
  digoxin: "Cardiac glycoside — heart failure and atrial fibrillation",
  diltiazem: "Calcium channel blocker — angina and rate control",
  diphenhydramine: "First-generation antihistamine — allergies",
  docusate: "Stool softener — constipation",
  dolutegravir: "INSTI — HIV-1 treatment",
  doxycycline: "Tetracycline antibiotic — tick-borne and respiratory infections",
  duloxetine: "SNRI — depression and neuropathic pain",
  dupilumab: "IL-4/IL-13 inhibitor biologic — atopic dermatitis and asthma",
  empagliflozin: "SGLT2 inhibitor — type 2 diabetes and heart failure",
  entyvio: "Integrin antagonist biologic — inflammatory bowel disease",
  eplerenone: "Aldosterone antagonist — heart failure and hypertension",
  erythromycin: "Macrolide antibiotic — infections",
  escitalopram: "SSRI antidepressant — depression and anxiety",
  eszopiclone: "Sedative-hypnotic — insomnia",
  etanercept: "TNF inhibitor biologic — rheumatoid arthritis and psoriasis",
  ethambutol: "Antitubercular — tuberculosis",
  famotidine: "H2 receptor antagonist — GERD and peptic ulcer disease",
  finasteride: "5-alpha reductase inhibitor — benign prostatic hyperplasia",
  fingolimod: "S1P receptor modulator — multiple sclerosis",
  fluconazole: "Azole antifungal — candidiasis",
  fluticasone: "Inhaled corticosteroid — asthma and allergic rhinitis",
  furosemide: "Loop diuretic — edema and heart failure",
  gabapentin: "Anticonvulsant — neuropathic pain and seizures",
  gentamicin: "Aminoglycoside antibiotic — serious gram-negative infections",
  glipizide: "Sulfonylurea — type 2 diabetes",
  haloperidol: "Typical antipsychotic — psychosis and agitation",
  hydralazine: "Direct vasodilator — hypertension",
  hydrochlorothiazide: "Thiazide diuretic — hypertension",
  hydroxychloroquine: "Antimalarial/immunomodulator — lupus and rheumatoid arthritis",
  hydroxyzine: "Antihistamine — anxiety and pruritus",
  ibuprofen: "NSAID — pain and inflammation",
  isoniazid: "Antitubercular — tuberculosis",
  isosorbide: "Nitrate vasodilator — angina",
  kevzara: "IL-6 inhibitor biologic — rheumatoid arthritis",
  lactulose: "Osmotic laxative — constipation and hepatic encephalopathy",
  lamotrigine: "Anticonvulsant/mood stabilizer — epilepsy and bipolar disorder",
  latanoprost: "Prostaglandin analog — glaucoma",
  ledipasvir: "HCV NS5A inhibitor (combination) — hepatitis C",
  lenvima: "Multi-kinase inhibitor — thyroid and renal cell carcinoma",
  levocetirizine: "Second-generation antihistamine — allergic rhinitis",
  levofloxacin: "Fluoroquinolone antibiotic — respiratory and urinary infections",
  levothyroxine: "Thyroid hormone replacement — hypothyroidism",
  linezolid: "Oxazolidinone antibiotic — resistant gram-positive infections",
  lisinopril: "ACE inhibitor — hypertension and heart failure",
  lithium: "Mood stabilizer — bipolar disorder",
  loperamide: "Opioid antidiarrheal — diarrhea",
  losartan: "ARB — hypertension and diabetic nephropathy",
  meloxicam: "NSAID — osteoarthritis pain",
  meropenem: "Carbapenem antibiotic — severe infections",
  mesalamine: "5-aminosalicylate — inflammatory bowel disease",
  metformin: "Biguanide — type 2 diabetes",
  methadone: "Long-acting opioid — opioid use disorder and chronic pain",
  methotrexate: "Antimetabolite/immunosuppressant — rheumatoid arthritis and cancer",
  metoclopramide: "Prokinetic/antiemetic — gastroparesis and nausea",
  metoprolol: "Beta-1 selective blocker — hypertension and heart failure",
  mirtazapine: "Atypical antidepressant — depression",
  montelukast: "Leukotriene receptor antagonist — asthma",
  naloxone: "Opioid antagonist — overdose reversal",
  naltrexone: "Opioid antagonist — alcohol and opioid use disorder",
  nirmatrelvir: "Protease inhibitor (Paxlovid) — COVID-19",
  nitrofurantoin: "Antibiotic — uncomplicated urinary tract infection",
  nitroglycerin: "Nitrate vasodilator — angina",
  olanzapine: "Atypical antipsychotic — schizophrenia and bipolar disorder",
  omalizumab: "Anti-IgE biologic — severe allergic asthma",
  omeprazole: "Proton pump inhibitor — GERD and peptic ulcer disease",
  ondansetron: "5-HT3 antagonist — nausea and vomiting",
  orlistat: "Lipase inhibitor — obesity",
  oseltamivir: "Neuraminidase inhibitor — influenza",
  otezla: "PDE4 inhibitor — psoriasis and psoriatic arthritis",
  pantoprazole: "Proton pump inhibitor — GERD",
  paxlovid: "Antiviral combination — COVID-19",
  phentermine: "Sympathomimetic — short-term weight loss",
  piperacillin: "Extended-spectrum penicillin — serious infections",
  pradaxa: "Direct thrombin inhibitor — anticoagulation",
  pravastatin: "Statin — hyperlipidemia",
  prednisolone: "Corticosteroid — inflammation",
  prednisone: "Corticosteroid — inflammation and immunosuppression",
  promethazine: "Antihistamine/antiemetic — nausea and allergies",
  propranolol: "Nonselective beta-blocker — hypertension, migraine, and tremor",
  pyrazinamide: "Antitubercular — tuberculosis",
  quetiapine: "Atypical antipsychotic — schizophrenia and bipolar disorder",
  ranitidine: "H2 receptor antagonist — acid-related disorders",
  remdesivir: "RNA polymerase inhibitor — COVID-19",
  ribavirin: "Antiviral — hepatitis C (combination therapy)",
  rifampin: "Antitubercular — tuberculosis",
  risperidone: "Atypical antipsychotic — schizophrenia and irritability",
  rivaroxaban: "Factor Xa inhibitor — anticoagulation",
  rosuvastatin: "Statin — hyperlipidemia",
  semaglutide: "GLP-1 receptor agonist — type 2 diabetes and obesity",
  sertraline: "SSRI antidepressant — depression and anxiety",
  sildenafil: "PDE5 inhibitor — erectile dysfunction and pulmonary hypertension",
  simvastatin: "Statin — hyperlipidemia",
  sitagliptin: "DPP-4 inhibitor — type 2 diabetes",
  sofosbuvir: "HCV polymerase inhibitor — hepatitis C",
  spironolactone: "Potassium-sparing diuretic — heart failure and hyperaldosteronism",
  sucralfate: "Mucosal protectant — peptic ulcer disease",
  tadalafil: "PDE5 inhibitor — erectile dysfunction and benign prostatic hyperplasia",
  tamsulosin: "Alpha-1 blocker — benign prostatic hyperplasia",
  tenofovir: "NRTI — HIV and chronic hepatitis B",
  timolol: "Beta-blocker — glaucoma and hypertension",
  tobramycin: "Aminoglycoside antibiotic — Pseudomonas infections",
  torsemide: "Loop diuretic — edema and heart failure",
  tramadol: "Opioid analgesic — moderate pain",
  trazodone: "Serotonergic antidepressant — depression and insomnia",
  trimethoprim: "Antibiotic — urinary tract infection",
  trulicity: "GLP-1 receptor agonist — type 2 diabetes",
  ursodiol: "Bile acid — gallstones and cholestatic liver disease",
  valacyclovir: "Antiviral — herpesvirus infections",
  vancomycin: "Glycopeptide antibiotic — MRSA and serious gram-positive infections",
  varenicline: "Nicotinic partial agonist — smoking cessation",
  venlafaxine: "SNRI — depression and anxiety",
  verapamil: "Calcium channel blocker — angina and supraventricular arrhythmias",
  viberzi: "Mu-opioid receptor modulator — irritable bowel syndrome with diarrhea",
  warfarin: "Vitamin K antagonist — anticoagulation",
  xiidra: "LFA-1 antagonist — dry eye disease",
  zolpidem: "Sedative-hypnotic — insomnia",
  zubsolv: "Buprenorphine/naloxone — opioid use disorder",
};

const POKEMON_SLUG_ALIASES = {
  ilumise: "illumise",
};

function pokemonTraitFromLearnMore(slug) {
  const resolvedSlug = POKEMON_SLUG_ALIASES[slug] ?? slug;
  const filePath = join(LEARN_DIR, `${resolvedSlug}.md`);
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, "utf8");
  if (!raw.includes('category: "pokemon"') && !raw.includes("category: pokemon")) {
    return null;
  }

  const patterns = [
    /\*\*[^*]+\*\* is an? ([A-Za-z]+(?:\/[A-Za-z]+)?)-type/i,
    /is an? ([A-Za-z]+(?:\/[A-Za-z]+)?)-type/i,
    /is a ([A-Za-z]+(?:\/[A-Za-z]+)?)-type/i,
  ];

  for (const re of patterns) {
    const match = raw.match(re);
    if (match?.[1]) {
      const type = match[1].trim();
      return `${type}-type Pokémon`;
    }
  }
  return null;
}

const items = JSON.parse(readFileSync(ITEMS_PATH, "utf8"));
let drugMissing = 0;
let pokemonMissing = 0;

const enriched = items.map((item) => {
  if (item.category === "drug") {
    const quizTrait = DRUG_TRAITS[item.slug];
    if (!quizTrait) {
      drugMissing += 1;
      console.warn(`Missing drug trait: ${item.slug}`);
    }
    return { ...item, quizTrait: quizTrait ?? "MISSING DATA" };
  }

  if (item.category === "pokemon") {
    const quizTrait = pokemonTraitFromLearnMore(item.slug);
    if (!quizTrait) {
      pokemonMissing += 1;
      console.warn(`Missing pokemon trait: ${item.slug}`);
    }
    return { ...item, quizTrait: quizTrait ?? "MISSING DATA" };
  }

  return item;
});

writeFileSync(ITEMS_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
console.log(
  `Enriched ${enriched.length} items. Drug missing: ${drugMissing}, Pokemon missing: ${pokemonMissing}`,
);
