Yes, this cross-jurisdictional, bidirectional approach is academically supported and fills a genuine gap in the literature. Here's how to structure it based on existing research:

## Categorization: The Foundation for Cross-Jurisdictional Comparison

**Academic typologies exist to classify "similar" measures.** Research has established classification systems for ballot measures—particularly in education policy where scholars identified categories like finance equalization, governance changes, and voucher programs spanning 1906-2009 [^6][^12]. This provides a template for your categorization schema.

**The challenge:** Measures with similar titles can differ substantially in mechanism. A "renewable energy mandate" in Washington may use regulatory standards while California's uses market mechanisms. Academic literature on **policy implementation science** emphasizes that comparing outcomes requires categorizing by **implementation mechanism**, not just policy goal [^1][^11].

**Your solution:** Code measures by:
- **Policy domain** (environment, tax, criminal justice, etc.)
- **Implementation mechanism** (regulatory, fiscal, procedural, constitutional)
- **Target actor** (state agencies, local governments, private entities)

This allows users to see not just "other minimum wage measures," but specifically "minimum wage measures implemented through state labor department enforcement" versus those "implemented through private right of action."

## Cross-Jurisdictional Feasibility: Lessons from Implementation Science

**Cross-state comparison is methodologically valid.** Health policy researchers routinely track implementation of similar policies (Medicaid expansions, COVID protocols) across states, treating them as **natural experiments** [^7][^10]. These studies demonstrate that you can meaningfully compare how the "same" policy functions in different institutional contexts.

**Key technical requirements** identified in the literature:
- **Standardized implementation phases**: Track consistent milestones (court challenges, rulemaking, budget appropriation, first enforcement action) [^16][^18]
- **Contextual variables**: Document state-specific factors that modify implementation (political control of legislature, agency capacity, pre-emptive laws) [^2][^15]
- **Information capacity**: Note that states vary in their ability to report implementation data—some have dedicated units, others rely on ad hoc reporting [^2]

**The "both ways" flow you envisioned:**
- **Forward**: Historical measures inform current voters ("Measure X resembles Colorado's Amendment Y, which took 18 months to implement and faced 3 court challenges")
- **Backward**: Current measures become future baselines (your database grows organically)

## Data Collection: Crowdsourcing Across Jurisdictions

**Crowdsourcing is validated for local political data.** Sumner and McCrain demonstrated that crowdsourced data on local politics achieves high accuracy compared to professional datasets when using consensus measures across multiple coders [^3][^9]. This is crucial because tracking implementation across 50 states requires distributed data collection.

**Best practices from the literature:**
- **Redundancy**: Have multiple users code the same measure's status and use consensus algorithms [^9]
- **Validation against elite sources**: Cross-check crowdsourced implementation status against court dockets and legislative records [^14]
- **Active vs. passive crowdsourcing**: "Active" requires users to seek out specific data; "passive" captures organic reporting (e.g., users noting "my employer just started complying with Measure Z") [^4]

**Cross-jurisdictional challenges** to anticipate:
- **Terminology variation**: The same legal concept may be labeled differently across states (e.g., "administrative rulemaking" vs. "regulatory implementation") [^5][^17]
- **Data sovereignty issues**: Some states treat implementation data as proprietary or charge fees for access [^5]
- **Temporal misalignment**: Measures pass in different election cycles, creating staggered comparison points [^13]

## Practical Architecture for Your App

**For an upcoming measure**, your interface could display:

1. **Historical analogues**: "This California housing measure resembles Washington's Initiative A (2021) and Massachusetts' Question B (2022)"

2. **Implementation trajectory predictions**: Based on similar measures:
   - Average time to first court challenge: 4.2 months
   - Probability of legislative amendment within 2 years: 67%
   - Likelihood of full implementation vs. partial dismantling [^8]

3. **Jurisdiction-specific alerts**: "Unlike Colorado's version, this measure includes automatic appropriations, reducing the risk of legislative defunding"

**The bidirectional value loop:**
- **Pre-election**: Users see predictions based on historical similar measures
- **Post-election**: Users report implementation observations (compliance notices at workplace, agency rulemaking announcements), which update the database
- **Continuous refinement**: The system learns which features predict implementation success (e.g., "measures with dedicated funding sources are 3x more likely to survive court challenges")

## Academic Contribution Potential

This approach addresses the literature gap I identified earlier: while scholars compare initiative vs. non-initiative states [^8], your database would enable **within-initiative comparisons**—analyzing why similar measures succeed or fail in different contexts. Implementation science specifically calls for this type of "comparative case study" methodology to understand how context shapes policy outcomes [^1][^7].

**One critical caveat:** Academic literature warns that **information capacity varies dramatically by state** [^2]. Your app will need to weight predictions based on data availability—comparisons between data-rich states (California, Washington) will be more reliable than comparisons involving data-poor jurisdictions.

Would you like me to explore specific predictive models for implementation likelihood, or dive into the technical standards for crowdsourced data validation across disparate state legal systems?

[^1]: [Frontiers | Policy Implementation Science to Advance Population...](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2021.681602/full) (13%)
[^2]: [How information capacity shapes policy implementation: A comparison of ...](https://www.sciencedirect.com/science/article/pii/S0740624X23000710) (11%)
[^3]: [Crowdsourcing Reliable Local Data - Cambridge Core](https://www.cambridge.org/core/journals/political-analysis/article/abs/crowdsourcing-reliable-local-data/E85E68746A4655FBD54F8F2A5A5525FC) (7%)
[^4]: [(PDF) Active and Passive Crowdsourcing in Government](https://www.researchgate.net/publication/283818463_Active_and_Passive_Crowdsourcing_in_Government) (7%)
[^5]: [Challenges Associated with Cross-Jurisdictional Analyses ...](https://pmc.ncbi.nlm.nih.gov/articles/PMC8142948/) (6%)
[^6]: [A typology of education ballot issues: 1906 to 2009 - Springer](https://link.springer.com/content/pdf/10.7821/naer.2.2.54-62.pdf) (6%)
[^7]: [Implementation Variation in Natural Experiments of State Health Policy ...](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6866654/) (6%)
[^8]: [List of Washington (state) ballot measures - Wikipedia](https://en.wikipedia.org/wiki/List_of_Washington_(state)_ballot_measures) (6%)
[^9]: [Crowdsourcing Reliable Local Data | Political Analysis](https://www.cambridge.org/core/journals/political-analysis/article/crowdsourcing-reliable-local-data/E85E68746A4655FBD54F8F2A5A5525FC) (5%)
[^10]: [COVID-19 Policy Differences across US States: Shutdowns...](https://pmc.ncbi.nlm.nih.gov/articles/PMC7766317/) (5%)
[^11]: [Four very basic ways to think about policy in implementation ...](https://pmc.ncbi.nlm.nih.gov/articles/PMC10496363/) (5%)
[^12]: [A typology of education ballot issues: 1906 to 2009](https://link.springer.com/article/10.7821/naer.2.2.54-62) (4%)
[^13]: [Overcoming challenges in cross-border data collection: what we learned ...](https://futurium.ec.europa.eu/en/border-focal-point-network/news/overcoming-challenges-cross-border-data-collection-what-we-learned-22-countries) (4%)
[^14]: [How Crowdsourcing Makes Local Government Data Accurate ...](https://www.poliscidata.com/insights/4440) (4%)
[^15]: [Development and implementation of Australian State, territory, and ...](https://www.sciencedirect.com/science/article/pii/S1326020023052895) (3%)
[^16]: [Translating Medicaid policy into practice: policy implementation...](https://pmc.ncbi.nlm.nih.gov/articles/PMC8734202/) (3%)
[^17]: [Addressing the challenges of cross‐jurisdictional data ...](https://www.sciencedirect.com/science/article/pii/S1326020023011457) (3%)
[^18]: [Who’s “in the room where it happens”? A taxonomy and five-step...](https://pmc.ncbi.nlm.nih.gov/articles/PMC10506261/) (2%)

