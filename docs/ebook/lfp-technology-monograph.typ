#set page(
  paper: "a4",
  header: context {
    if counter(page).get().first() > 1 [
      #grid(
        columns: (1fr, 1fr),
        align: (left, right),
        text(size: 8pt, fill: rgb("#71717a"), font: "IBM Plex Sans")[*LFP Battery Technology: Principles & Diagnostics*],
        text(size: 8pt, fill: rgb("#71717a"), font: "IBM Plex Sans")[Technical Engineering Monograph]
      )
      #line(length: 100%, stroke: 0.4pt + rgb("#e4e4e7"))
    ]
  },
  footer: context {
    if counter(page).get().first() > 1 [
      #line(length: 100%, stroke: 0.4pt + rgb("#e4e4e7"))
      #v(2pt)
      #grid(
        columns: (1fr, 1fr),
        align: (left, right),
        text(size: 8pt, fill: rgb("#a1a1aa"), font: "IBM Plex Sans")[Automotive Battery Systems & Electrochemical Kinetics],
        text(size: 8pt, fill: rgb("#71717a"), font: "IBM Plex Sans")[Page #counter(page).display()]
      )
    ]
  }
)

#set text(
  font: ("IBM Plex Sans", "DejaVu Sans"),
  size: 10pt,
  fill: rgb("#18181b"),
  spacing: 120%,
  lang: "en"
)

#set par(
  justify: true,
  leading: 0.75em,
  first-line-indent: 0pt,
)

#show heading: it => [
  #v(1.2em)
  #text(
    font: ("IBM Plex Sans", "DejaVu Sans"),
    weight: "bold",
    fill: rgb("#09090b"),
    it.body
  )
  #v(0.6em)
]

#show heading.where(level: 1): it => [
  #v(1.8em)
  #text(size: 17pt, fill: rgb("#c2410c"))[#it.body]
  #v(0.4em)
  #line(length: 100%, stroke: 1.2pt + rgb("#fdba74"))
  #v(0.8em)
]

#show heading.where(level: 2): it => [
  #v(1.4em)
  #text(size: 13pt, fill: rgb("#27272a"))[#it.body]
  #v(0.4em)
]

#show heading.where(level: 3): it => [
  #v(1.1em)
  #text(size: 10.5pt, fill: rgb("#52525b"))[#it.body]
  #v(0.3em)
]

#show raw: set text(font: ("Fira Code", "DejaVu Sans Mono"), size: 8.5pt)

// Callout Box Component
#let callout(title: "Note", body, color: rgb("#ea580c")) = [
  #v(0.6em)
  #rect(
    width: 100%,
    fill: color.lighten(94%),
    stroke: (left: 3.5pt + color, rest: 0.5pt + color.lighten(70%)),
    radius: (right: 4pt),
    inset: (x: 14pt, y: 10pt),
    [
      #text(weight: "bold", size: 9.5pt, fill: color)[#title] \
      #v(4pt)
      #text(size: 9pt, fill: rgb("#27272a"))[#body]
    ]
  )
  #v(0.6em)
]

// ==========================================
// TITLE PAGE / COVER
// ==========================================

#align(center + top)[
  #v(2.5cm)
  #rect(fill: rgb("#ea580c"), radius: 4pt, inset: (x: 10pt, y: 5pt))[
    #text(fill: white, weight: "bold", size: 8.5pt, font: "Fira Code")[ENGINEERING REFERENCE MONOGRAPH]
  ]
  #v(1.2cm)
  #text(size: 24pt, weight: "bold", fill: rgb("#09090b"), font: "IBM Plex Sans")[
    Understanding Lithium Iron     Phosphate (LFP) Technology
  ]
  #v(0.4cm)
  #text(size: 13pt, fill: rgb("#71717a"), font: "IBM Plex Sans")[
    From Solid-State Crystal Kinetics to Non-Destructive Laboratory Diagnostics
  ]
  #v(0.8cm)
  #line(length: 60%, stroke: 1.5pt + rgb("#ea580c"))
  #v(1.5cm)
  
  #grid(
    columns: (130pt, 1fr),
    align: (right, left),
    gutter: 18pt,
    text(size: 9pt, fill: rgb("#71717a"))[
      *Topic Domain:*\
      *Electrode Chemistry:*\
      *Diagnostic Modalities:*\
      *Standards Alignment:*
    ],
    text(size: 9pt, fill: rgb("#27272a"))[
      Battery Energy Storage & EV Powertrains\
      Olivine $"LiFePO"_4$ Cathode / Mesocarbon Graphite Anode\
      UHPC, $d Q \/ d V$, DCIR Pulse Matrices, Hysteresis\
      IATF 16949 • USABC • ISO 12405
    ]
  )
  
  #v(3.5cm)
  #text(size: 8.5pt, fill: rgb("#a1a1aa"))[
    Comprehensive Synthesis & Reference Documentation \
    Generated for Electrochemical Quality & Diagnostic Engineering
  ]
]

#pagebreak()

// ==========================================
// TABLE OF CONTENTS
// ==========================================

#outline(
  title: [Table of Contents],
  depth: 2,
  indent: 1.5em,
)

#v(1.5cm)

#callout(title: "Executive Summary: The Triad of Battery Diagnostics", color: rgb("#0284c7"))[
  Evaluating a battery without destroying it requires translating external terminal measurements (voltage, current, time, temperature) into internal microscopic states. In Lithium Iron Phosphate (LFP) systems, this is achieved through three complementary pillars:
  + *Ultra-High Precision Coulometry (UHPC):* Measures sub-microvolt parasitic side reactions to predict ten-year operational lifespan in weeks.
  + *Differential Capacity ($d Q \/ d V$):* Exploits the flat, motionless thermodynamic potential of the $"LiFePO"_4$ cathode to expose the graphite anode's staging transitions as an internal "electrochemical MRI."
  + *Direct-Current Internal Resistance (DCIR):* Deconvolutes instantaneous ohmic tab resistance from interfacial charge-transfer and solid-state diffusion, dictating real-world EV acceleration and thermal cooling limits.
]

#pagebreak()

// ==========================================
// SECTION 1: INTRODUCTION & LANDSCAPE
// ==========================================

= 1. Introduction: The LFP Renaissance

For decades, the electric vehicle (EV) and energy storage systems (ESS) industries prioritized Nickel-Manganese-Cobalt (NMC) and Nickel-Cobalt-Aluminum (NCA) layered oxides due to their high gravimetric energy densities ($220 - 280 space "Wh/kg"$). However, the global market has experienced a massive strategic pivot back to Lithium Iron Phosphate ($"LiFePO"_4$):

- *Thermal Runaway Immunity:* The covalent $P-O$ bonds within the polyanionic phosphate framework do not release oxygen until temperatures exceed $500 - 600 space degree C$, completely eliminating self-sustaining thermal runaway fires at standard operating temperatures.
- *Cycle Longevity:* Where high-nickel layered oxides degrade after $1,000 - 2,000$ full equivalent cycles due to anisotropic lattice contraction, LFP routinely achieves $3,000 - 10,000+$ cycles.
- *Geopolitical & Ethical Abundance:* LFP requires neither Cobalt (associated with severe supply-chain vulnerabilities and ethical concerns) nor Nickel (subject to extreme price volatility).

#table(
  columns: (1.4fr, 1.3fr, 1.3fr),
  stroke: 0.5pt + rgb("#e4e4e7"),
  fill: (_, row) => if row == 0 { rgb("#f4f4f5") } else { none },
  align: (left, center, center),
  [*Electrochemical Parameter*], [*Lithium Iron Phosphate (LFP)*], [*High-Voltage NMC / LCO*],
  [Nominal Voltage ($V_"cell"$)], [3.20 V], [3.70 V – 3.85 V],
  [Voltage Window], [2.50 V – 3.65 V], [3.00 V – 4.35 V],
  [Gravimetric Energy Density], [140 – 180 Wh/kg], [220 – 280 Wh/kg],
  [Thermal Runaway Onset], [$approx 550 degree C$], [$approx 210 degree C$],
  [Crystal Structure], [Orthorhombic Olivine ($P n m a$)], [Layered Rhombohedral ($R accent(3, -) m$)],
  [BMS State-of-Charge Difficulty], [Extremely High (Flat Plateau)], [Low (Monotonically Sloping)],
  [Cycle Life (80% SOH)], [3,000 – 10,000 Cycles], [1,000 – 2,000 Cycles],
)

---

// ==========================================
// SECTION 2: CRYSTAL CHEMISTRY & ARCHITECTURE
// ==========================================

= 2. Solid-State Chemistry & The Olivine Framework

Lithium Iron Phosphate crystallizes in the *olivine structure* belonging to the orthorhombic space group $P n m a$. 

== 2.1 The Polyanion Framework

The lattice framework is built from edge-sharing $F e O_6$ octahedra cross-linked by corner-sharing $P O_4$ tetrahedral units:

- Oxygen atoms form a slightly distorted, hexagonal close-packed arrangement.
- Phosphorus sits in tetrahedral interstitials, while Iron ($F e^(2+)$ in $"LiFePO"_4$, oxidising to $F e^(3+)$ in $"FePO"_4$) occupies octahedral sites.
- The strong $s p^3$ covalent hybridization of the $(P O_4)^(3-)$ polyanionic group dramatically lowers the energy of the $F e^(3+) / F e^(2+)$ redox couple via the inductive effect, stabilizing the redox potential at approximately $3.43 space V$ vs. $"Li" / "Li"^+$.

== 2.2 The 1D Diffusion Bottleneck

Unlike layered oxides where $L i^+$ ions diffuse in two-dimensional planes, the olivine lattice permits lithium transport strictly through *one-dimensional channels running along the $[010]$ crystallographic direction*:

$ D_(L i, [010]) >> D_(L i, [100]) approx D_(L i, [001]) approx 0 $

#callout(title: "The Iron Antisite Defect Mechanism", color: rgb("#dc2626"))[
  Because diffusion is strictly one-dimensional, any structural impurity sitting within the $[010]$ channel acts as a total roadblock. During high-temperature synthesis, iron atoms occasionally occupy lithium sites—known as *Fe-antisite defects* ($F e_(L i)^dot$). A mere 1% concentration of iron antisite defects can reduce solid-state ionic conductivity by orders of magnitude by permanently blocking the channel.
]

== 2.3 The Nano-Carbon Solution

Pristine, bulk $"LiFePO"_4$ is an electronic insulator with an electrical conductivity of $sigma_e approx 10^(-9) space "S/cm"$ and a low solid-state chemical diffusion coefficient ($D_(L i) approx 10^(-14) - 10^(-16) space "cm"^2"/s"$). Two engineering breakthroughs enabled commercial viability:
+ *Particle Nano-Sizing (100–300 nm):* Decreasing grain radius ($r$) reduces the diffusion timescale exponentially, governed by the Einstein relation:
  $ tau = r^2 / (2 D) $
  Reducing particle size from $10 space mu"m"$ to $100 space "nm"$ accelerates de-intercalation by four orders of magnitude ($10^4$).
+ *Pyrolytic Carbon Nano-Coating:* Applying an organic precursor (e.g., sucrose, glucose) pyrolyzed under inert atmosphere coats each nano-grain in a 2–5 nm graphitic carbon shell, raising effective conductivity to $sigma_e > 10^(-2) space "S/cm"$.

---

// ==========================================
// SECTION 3: THERMODYNAMICS & GIBBS PHASE RULE
// ==========================================

= 3. Thermodynamics: The Two-Phase Plateau & Gibbs Phase Rule

The electrochemical intercalation reaction of an LFP cathode is formulated as:

$ "LiFePO"_4 limits(harpoons.rtlb)^("charge")_("discharge") "FePO"_4 + L i^+ + e^- quad (E^0 approx 3.42 - 3.43 space V space "vs." space "Li" / "Li"^+) $

== 3.1 The Miscibility Gap & The Gibbs Phase Rule

When lithium de-intercalates from $"LiFePO"_4$, the system does not form a continuous solid solution. Instead, it splits into two distinct, coexisting thermodynamic phases across a wide miscibility gap:
- $alpha$-phase: Lithium-rich Triphylite ($L i_(1-alpha) F e P O_4$)
- $beta$-phase: Lithium-poor Heterosite ($L i_beta F e P O_4$, where $beta approx 0$)

According to Gibbs' Phase Rule:

$ F = C - P + 2 $

Where:
- $F$ is the number of intensive thermodynamic degrees of freedom.
- $C$ is the number of chemical components ($C = 2$: $"FePO"_4$ and $L i$).
- $P$ is the number of coexisting phases in equilibrium ($P = 2$: Triphylite and Heterosite).

Under typical electrochemical laboratory testing at constant temperature ($T$) and pressure ($P$), the phase rule reduces to:

$ F = C - P = 2 - 2 = 0 $

#callout(title: "Thermodynamic Consequence: Zero Degrees of Freedom", color: rgb("#16a34a"))[
  Because $F = 0$, the chemical potential of lithium ($mu_(L i)$) is strictly pinned and cannot vary with overall lithium concentration:
  $ V_("OCV") = - (mu_(L i)^("cathode") - mu_(L i)^("anode")) / F_("Faraday") = "constant" $
  This mathematical constraint is why the open-circuit voltage curve of $"LiFePO"_4$ remains completely horizontal ($approx 3.42 space V$ vs. $"Li" / "Li"^+$) across roughly 15% to 85% of its entire capacity.
]

== 3.2 The Latent Heat / Melting Ice Analogy

Engineers often struggle with the intuition that a battery is filling with capacity while its voltage does not budge. The thermodynamic equivalent is *melting ice at constant pressure*:
- When heat is poured into ice at $0 degree C$, the temperature stays at exactly $0 degree C$ until the last gram of ice melts. The energy is consumed entirely as latent heat of phase transformation.
- Similarly, while current ($I$) flows into an LFP cell on the flat plateau, Amp-hours are accumulating continuously:
  $ Q(t) = integral_0^t I(t) space d t $
  The electrical energy is consumed converting Triphylite crystal grains into Heterosite crystal grains without shifting the thermodynamic chemical potential.

#figure(
  image("figures/fig1_thermodynamic_plateau.png", width: 95%),
  caption: [Electrochemical half-cell potential balance and the Gibbs phase rule equilibrium pinning the flat $"LiFePO"_4$ cathode plateau.],
)


== 3.3 The BMS Challenge: Why Voltmeters Fail

In an NMC or lead-acid battery, voltage correlates linearly with State-of-Charge (SOC). In LFP, the slope $d V / d Q approx 0$:
- Between 20% and 80% SOC, terminal voltage varies by less than $10 - 20 space "mV"$.
- Normal sensor noise, temperature swings, and dynamic IR drops dwarf the open-circuit voltage variation.
- Consequently, Battery Management Systems (BMS) cannot rely on voltage lookups during operation. They must perform high-precision *Coulomb Counting* (integrating current over time) and calibrate only when the battery hits the upper saturation knee ($> 3.50 space V$) or lower depletion knee ($< 3.00 space V$).

---

// ==========================================
// SECTION 4: DIFFERENTIAL CAPACITY ANALYSIS (dQ/dV)
// ==========================================

= 4. Differential Capacity Analysis ($d Q \/ d V$): The Non-Destructive MRI

Differential Capacity Analysis ($d Q \/ d V$) is the most powerful non-destructive analytical modality in battery physics. It converts flat, unreadable voltage plateaus into sharp, diagnostic mathematical peaks.

== 4.1 The Mathematical Proof: The Cathode as a Motionless Reference

The full-cell terminal voltage ($V_("cell")$) is the difference between cathode and anode potentials:

$ V_("cell") = V_("cathode") - V_("anode") $

Differentiating with respect to charge capacity ($Q$):

$ (d V_("cell")) / (d Q) = (d V_("cathode")) / (d Q) - (d V_("anode")) / (d Q) $

Because the $"LiFePO"_4$ cathode operates within a two-phase equilibrium ($F = 0$), its derivative is essentially zero:

$ (d V_("cathode")) / (d Q) approx 0 $

Substituting zero into the derivative:

$ (d V_("cell")) / (d Q) approx - (d V_("anode")) / (d Q) $

Inverting both sides:

$ bold(((d Q) / (d V_("cell"))) approx - ((d Q) / (d V_("anode")))) $

#callout(title: "The Built-In Reference Electrode", color: rgb("#7c3aed"))[
  This mathematical identity proves that in an LFP/Graphite full cell, the cathode acts as a motionless, flat mirror. *Every single peak and valley observed on a full-cell LFP $d Q \/ d V$ plot is a direct reflection of the graphite anode's internal staging reactions.*
]

== 4.2 Graphite Staging Deconvolution

Graphite ($C_6$) intercalates lithium through discrete, ordered stages rather than continuous absorption. Each stage produces a distinct plateau on the anode, mapped directly to full-cell voltage:

#table(
  columns: (1fr, 1.3fr, 1.2fr, 1.2fr),
  stroke: 0.5pt + rgb("#e4e4e7"),
  fill: (_, row) => if row == 0 { rgb("#f4f4f5") } else { none },
  align: (center, left, center, center),
  [*Graphite Stage*], [*Intercalation Reaction*], [*$E_("anode")$ vs. $"Li" / "Li"^+$*], [*Full Cell Peak ($3.43 V - V_("anode")$)*],
  [Stage 4 $arrow$ 3L], [Dilute phase $arrow$ $L i C_(30)$], [$approx 0.20 - 0.22 space V$], [Peak 1: $approx 3.22 - 3.25 space V$],
  [Stage 3L $arrow$ 2], [$L i C_(18) arrow L i C_(12)$], [$approx 0.12 - 0.14 space V$], [Peak 2: $approx 3.30 - 3.32 space V$],
  [Stage 2 $arrow$ 1], [$L i C_(12) arrow L i C_6$ (Full)], [$approx 0.08 - 0.09 space V$], [Peak 3: $approx 3.34 - 3.36 space V$],
)

#figure(
  image("figures/fig2_dqdv_electrochemical_mri.png", width: 95%),
  caption: [Differential capacity ($d Q \/ d V$) profile of an LFP full cell, exposing the graphite anode staging transitions through the motionless cathode mirror.],
)


== 4.3 Deconvoluting the Three Fundamental Degradation Modes

Battery scientists use automated peak-fitting algorithms on $d Q \/ d V$ curves to identify which degradation mode is destroying the battery:

+ *Loss of Lithium Inventory (LLI):* Active cyclable lithium ions get trapped permanently inside the growing Solid Electrolyte Interphase (SEI) layer on the graphite anode.
  - *Symptom:* The graphite peaks shift horizontally relative to the cathode capacity envelope, causing uniform peak shrinkage across all three peaks.
+ *Loss of Active Material on Anode ($"LAM"_("anode") = "LAM"_"NE"$):* Graphite flakes exfoliate, crack, or become electrically isolated.
  - *Symptom:* The distance between Peak 1 and Peak 3 contracts; Stage 1 saturation ($L i C_6$) is truncated prematurely.
+ *Loss of Active Material on Cathode ($"LAM"_("cathode") = "LAM"_"PE"$):* $"LiFePO"_4$ particles crack or dissolve iron into the electrolyte.
  - *Symptom:* Total usable voltage window contracts; end-of-charge knee arrives early.

== 4.4 Electrochemical Hysteresis: Quantifying Round-Trip Energy Losses

When charge and discharge $d Q \/ d V$ curves are plotted together, they do not overlap. The charge peak sits at a higher voltage than the discharge peak:

$ Delta V_("hysteresis") = V_("peak, charge") - V_("peak, discharge") $

- In pristine cells, $Delta V_("hysteresis") approx 20 - 30 space "mV"$.
- This gap represents thermodynamic path-dependence (phase nucleation barrier) plus kinetic overpotential:
  $ V_("terminal") = V_("OCV") plus.minus I R_0 plus.minus eta_("charge-transfer") plus.minus eta_("diffusion") $
- *Thermal Waste Calculation:* Every cycle dissipates energy directly proportional to this voltage gap:
  $ E_("waste") = Delta V_("hysteresis") times Q_("cycle") $
  Tracking hysteresis growth over cycling allows engineers to monitor cell impedance and size automotive cooling systems accurately.

#figure(
  image("figures/fig4_electrochemical_hysteresis.png", width: 95%),
  caption: [Electrochemical hysteresis gap ($Delta V_("hysteresis") approx 28 space "mV"$) between charge and discharge $d Q \/ d V$ profiles, quantifying cycle thermal waste.],
)


== 4.5 Catching Cold-Weather Metallic Lithium Plating

When an EV is fast-charged below $15 degree C$, slow solid-state diffusion causes the graphite surface overpotential to drop below the thermodynamic lithium plating threshold:

$ E_("surface") < 0.0 space V space "vs." space "Li" / "Li"^+ $

Under this condition, lithium ions cannot intercalate into the carbon sheets; they precipitate directly as *metallic zero-valent lithium dendrites ($L i^0$)*.
- *The $d Q \/ d V$ Detection Mechanism:* During subsequent discharge, metallic lithium strips off the graphite surface before intercalated lithium de-intercalates, creating a *distinct rogue mini-peak or shoulder* immediately at the onset of discharge ($approx 3.40 V$).
- This allows laboratory testing to establish exact safe charging envelopes without destructive cell teardowns.

#figure(
  image("figures/fig3_degradation_modes_dqdv.png", width: 95%),
  caption: [Deconvolution of battery degradation modes using differential capacity: (a) Pristine baseline, (b) Loss of Lithium Inventory (LLI), (c) Loss of Active Anode Material ($"LAM"_"NE"$), and (d) Cold-weather metallic lithium plating.],
)


---

// ==========================================
// SECTION 5: DC INTERNAL RESISTANCE (DCIR) & PULSE DYNAMICS
// ==========================================

= 5. Direct-Current Internal Resistance (DCIR) & Pulse Polarization

While $d Q \/ d V$ reveals chemical phase distribution, Direct-Current Internal Resistance (DCIR) measures high-rate power delivery and thermal safety.

== 5.1 Mathematical Extraction of Resistance

During a standard Hybrid Pulse Power Characterization (HPPC) step, a constant current pulse ($I_("pulse")$, e.g., $plus.minus 20 space A$) is injected for a fixed duration ($t = 10 - 20 space s$):

$ R_("DCIR") = frac(abs(V_("pre-pulse") - V_("end-pulse")), abs(I_("pulse"))) $

```
Terminal
Voltage
 V_pre ─────┐
            │ <── R_0 (Ohmic Drop: Current collectors, tabs, electrolyte liquid)
            └───┐
                │ <── R_ct (Charge-Transfer Activation across SEI)
                │
                └───► <── R_diff (Solid-State Mass Transport Diffusion)
                      V_end (measured at t = 20s)
```

The voltage relaxation separates into three physical mechanisms:
+ *Instantaneous Ohmic Resistance ($R_0$, timescale: $< 1 space "ms"$):* Bulk resistance of metal current collector foils, ultrasonic tab welds, and ionic conductivity of the liquid solvent.
+ *Charge-Transfer Resistance ($R_("ct")$, timescale: $1 space "ms" - 1 space "s"$):* Activation energy for $L i^+$ to shed its solvation sheath and traverse the SEI membrane.
+ *Concentration Polarization / Diffusion ($R_("diff")$, timescale: $1 - 30+ space "s"$):* Concentration gradients forming across the porous electrode thickness and within solid spherical particles governed by Fick's Second Law:
  $ (partial C) / (partial t) = D_("solid") ( (partial^2 C) / (partial r^2) + 2 / r (partial C) / (partial r) ) $

== 5.2 The SOC Bathtub Curve

When DCIR is plotted across State-of-Charge (SOC), it exhibits an asymmetric "bathtub" profile:
- *Middle Region (20% – 85% SOC):* Resistance remains uniformly low and flat ($approx 6 - 8 space m Omega$). Lithium ion vacancies and solid-state transport are well-balanced.
- *Low-SOC Region (< 10% SOC / $< 3.00 space V$):* Resistance spikes sharply ($> 14 - 20 space m Omega$). At this point, the cathode is nearly saturated with lithium ions, leaving few empty sites for incoming flux, and liquid electrolyte pores suffer salt depletion.
- *BMS Inverter Power Derating:* Because $Delta V = I times R_("DCIR")$, drawing high current when resistance has doubled causes terminal voltage to crater beneath the hardware cutoff ($2.50 space V$). The car's BMS uses this exact curve to derate motor torque at low battery percentage.

#figure(
  image("figures/fig5_dcir_pulse_and_bathtub.png", width: 95%),
  caption: [Direct-Current Internal Resistance (DCIR) dynamics: (Left) HPPC current pulse and voltage relaxation deconvolution; (Right) The DCIR "bathtub" curve across State-of-Charge highlighting low-SOC inverter power derating.],
)


---

// ==========================================
// SECTION 6: CASE STUDY: THE CHEMISTRY MISMATCH LESSON
// ==========================================

= 6. Case Study: Resolving the Chemistry Mismatch

A critical real-world engineering lesson occurred during the analysis of cell `SLPBA842124HV-06`:

== 6.1 The Anomaly

The test dataset from SINTEF was labeled within an "LFP Platform" framework, but displayed characteristics that were physically impossible for Lithium Iron Phosphate:
- The cell operated between *3.00 V and 4.35 V* (resting open-circuit at 3.815 V).
- Charging true LFP to 4.35 V causes catastrophic electrolyte oxidation, severe outgassing, and thermal runaway.
- The $d Q \/ d V$ curve exhibited *three prominent high-voltage peaks at 3.855 V, 3.99 V, and 4.10 V*, instead of the single flat LFP plateau.

== 6.2 The De-Identification

De-coding the cell model string resolved the paradox:
- *`SLPB`*: Kokam's trademark *Superior Lithium Polymer Battery* pouch architecture.
- *`A842124`*: Physical cell dimensions ($8.4 space "mm" space times 42 space "mm" space times 124 space "mm"$).
- *`HV`*: Explicitly designates *High Voltage* ($4.35 space V$ cutoff).
- *`Revolve_2024`*: Tested for Revolve NTNU (Formula Student electric racing team).

#callout(title: "Engineering Takeaway: Trust the Thermodynamics", color: rgb("#ea580c"))[
  Software labels can be misapplied, but crystal thermodynamics cannot lie. The presence of three multi-phase de-intercalation peaks above 3.8 V definitively identified the cell as a High-Voltage Layered Oxide (NMC/LCO blend) rather than Lithium Iron Phosphate.
]

#figure(
  image("figures/fig6_chemistry_forensic_comparison.png", width: 95%),
  caption: [Forensic chemistry comparison: Flat LFP olivine plateau ($3.25 space V$ nom, $3.34 space V$ peak) versus sloping Kokam SLPB High-Voltage pouch cell ($4.35 space V$ max, 3 peaks at $3.855 space V$, $3.990 space V$, $4.100 space V$).],
)


---

// ==========================================
// SECTION 7: INDUSTRIAL FORMATION & QUALITY CONTROL
// ==========================================

= 7. Industrial Quality Engineering: Formation & SPC

Before an LFP cell enters an automotive battery pack, it must pass rigorous automated quality screening.

== 7.1 The Formation Paradox & Controlled SEI Synthesis

Freshly assembled pristine graphite has an operating potential ($< 0.1 space V$ vs. $"Li" / "Li"^+$) far below the thermodynamic reduction limit of organic alkyl carbonates ($0.8 - 1.0 space V$). Without a passivating layer, the electrolyte would reduce continuously until the battery died.

- *Uncontrolled Operation (Charging fresh cells at 1C):* Rapid reduction creates a brittle, porous, disorganized crust accompanied by violent gas generation ($C_2 H_4, C O, C O_2$) that delaminates active layers.
- *Controlled Factory Formation (C/20 rates):* Slow, steady injection allows dense, compact inorganic inner films ($L i F, L i_2 C O_3$) to form directly against the graphite face. This film blocks bulk solvent molecules while conducting $L i^+$ ions freely.

== 7.2 Micro-Short Screening via the $K$-Value

Microscopic burrs from current-collector slitting or separator pinholes create low-current leakage paths. After formation, cells sit in rest storage for 7 to 14 days, during which the cycler tracks the self-discharge rate ($K$-value):

$ K = (Delta V_("OCV")) / (Delta t) quad [ "mV / day" ] $

- Normal self-discharge for healthy LFP: $K < 0.20 space "mV/day"$.
- Quarantine threshold: $K >= 0.50 space "mV/day"$.
- Any quarantined cell is removed from pack assembly immediately to eliminate spontaneous vehicle fires.

== 7.3 Statistical Process Control (SPC / IATF 16949)

In electric vehicles where hundreds of cells are wired in series, the pack is constrained by its weakest cell. Automakers apply Shewhart Statistical Process Control:

$ C_p = ("USL" - "LSL") / (6 sigma), quad C_(p k) = "min" lr(( frac("USL" - mu, 3 sigma), frac(mu - "LSL", 3 sigma) )) $

High-quality cell lines maintain $C_(p k) >= 1.67$, ensuring that batch-wide capacity and DCIR variations are negligible.

---

// ==========================================
// SECTION 8: APPENDIX & REFERENCE TABLES
// ==========================================

= 8. Appendix: Quick Reference & Mathematical Index

== 8.1 Key Electrochemical Formulas

#grid(
  columns: (1fr, 1fr),
  gutter: 14pt,
  rect(width: 100%, stroke: 0.5pt + rgb("#d4d4d8"), inset: 10pt, radius: 4pt)[
    *Coulombic Efficiency (CE):*
    $ "CE" = Q_("discharge") / Q_("charge") times 100% $
    
    *Differential Capacity:*
    $ (d Q) / (d V) = (I space d t) / (d V) $
  ],
  rect(width: 100%, stroke: 0.5pt + rgb("#d4d4d8"), inset: 10pt, radius: 4pt)[
    *DC Internal Resistance (DCIR):*
    $ R_("DCIR") = frac(abs(Delta V), abs(Delta I)) $
    
    *Joule Heat Dissipation:*
    $ P_("thermal") = I^2 R_("DCIR") $
  ]
)

== 8.2 Degradation Fingerprint Reference Matrix

#table(
  columns: (1.2fr, 1.3fr, 1.5fr),
  stroke: 0.5pt + rgb("#e4e4e7"),
  fill: (_, row) => if row == 0 { rgb("#f4f4f5") } else { none },
  align: (left, left, left),
  [*Observed Phenomenon*], [*Physical Root Cause*], [*Engineering Remedy*],
  [Uniform $d Q \/ d V$ peak shrinkage], [Loss of Lithium Inventory (LLI) via SEI growth], [Optimize electrolyte additives (VC/FEC)],
  [Widening $Delta V_("hysteresis")$ gap], [Ohmic & charge-transfer impedance growth], [Derate pulse C-rates; improve thermal cooling],
  [Rogue shoulder on discharge $d Q \/ d V$], [Metallic lithium plating on graphite surface], [Increase low-temperature charge cutoffs],
  [DCIR doubling ($> 100%$ increase)], [Mass-transport starvation or active particle loss], [Trigger automotive End-of-Life (EOL) retirement],
  [$K$-value $> 0.50 space "mV/day"$], [Internal micro-short circuit or separator defect], [Scrap/quarantine cell before pack integration],
)

#v(1.5cm)
#align(center)[
  #text(size: 8pt, fill: rgb("#a1a1aa"), font: "Fira Code")[
    --- END OF TECHNICAL MONOGRAPH --- \
    LFP Platform Research & Diagnostic Engineering Monograph
  ]
]
