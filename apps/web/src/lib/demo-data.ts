// ============================================
// Demo Data for ACA 13 (Assembly Constitutional Amendment No. 13)
// Based on sample_data/aca-13.pdf
// ============================================

export interface Citation {
  textSpan: string;
  startOffset: number;
  endOffset: number;
  context?: string;
}

export interface Insight {
  _id: string;
  measureId: string;
  type: "summary" | "fiscal" | "legal_changes" | "affected_groups" | "conflicts";
  content: string;
  confidence: "high" | "medium" | "low";
  uncertaintyFlags?: string[];
  citations: Citation[];
  generatedAt: number;
  model: string;
  promptVersion: string;
}

export interface Measure {
  _id: string;
  measureNumber: string;
  title: string;
  jurisdiction: {
    type: "state" | "county" | "city";
    name: string;
    fipsCode?: string;
  };
  status: "upcoming" | "active" | "passed" | "failed";
  measureType: "Bond Measure" | "Statute" | "Constitutional Amendment" | "Referendum";
  estimatedCost?: {
    amount: number;
    unit: string;
    timeframe: string;
  };
  officialTextUrl: string;
  fullText: string;
  pages: string[];
  metadata: {
    title?: string;
    subject?: string;
    keywords?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
    pdfVersion?: string;
  };
  stats: {
    pageCount: number;
    wordCount: number;
    charCount: number;
  };
  textHash: string;
  sourceUrl: string;
  sourceType: "ca-sos" | "santa-clara-county";
  firstSeenAt: number;
  lastUpdatedAt: number;
  scrapedAt: number;
}

export interface Election {
  _id: string;
  date: number;
  type: "primary" | "general" | "special";
  year: number;
  jurisdictions: string[];
}

// ACA 13 extracted full text from PDF
const aca13FullText = `Assembly Constitutional Amendment No. 13

Adopted in Assembly September 14, 2023

ACA13 - 2 -

RESOLUTION CHAPTER __ _

Assembly Constitutional Amendment No. 13—A resolution to propose to the people of the State of California an amendment to the Constitution of the State, by amending Section 10 of, and adding Section 10.5 to, Article II thereof, and adding Section 7.8 to Article XI thereof, relating to voting.

LEGISLATIVE COUNSEL'S DIGEST

ACA 13, Ward. Voting thresholds.

The California Constitution provides that a proposed constitutional amendment and a statewide initiative measure each take effect only if approved by a majority of the votes cast on the amendment or measure.

This measure would further provide that an initiative measure that includes one or more provisions that would amend the Constitution to increase the voter approval requirement to adopt any state or local measure would be approved by the voters only if the proportion of votes cast in favor of the initiative measure is equal to or greater than the highest voter approval requirement that the initiative measure would impose. The measure would specify that this voter approval requirement would apply to statewide initiative measures that appear on the ballot on or after January 1, 2024.

The California Constitution also permits initiative and referendum powers to be exercised by the voters of each city or county under procedures provided by the Legislature.

This measure would expressly authorize a local governing body to hold an advisory vote concerning any issue of governance for the purpose of allowing voters within the jurisdiction to voice their opinions on the issue. The measure would specify that an advisory question is approved only if a majority of the votes cast on the question are in favor.

This measure would further declare that its provisions are severable and that if any provision is held invalid, the other provisions of the act remain valid, as specified.

- 3 - ACA13

WHEREAS, In an era of special interests and others attempting to manipulate the electoral process, it is important to preserve the fundamental right of California citizens to approve statewide initiative statutes and referenda by a majority vote; and

WHEREAS, Initiative measures proposing to amend the Constitution to increase the vote requirement above a majority vote to pass other state and local measures violate the principle of majority rule; and

WHEREAS, Citizens have a substantial interest in voicing their opinions on issues of local governance and must be allowed to approve local advisory measures by majority vote; and

WHEREAS, The provisions of this measure are not intended to reverse or invalidate provisions of the Constitution in effect before January 1, 2024, including the provisions of Proposition 13 of 1978; and

WHEREAS, The purpose of this measure is to do all of the following:

(a) Retain the majority vote requirement to pass statewide initiative statutes and referenda;

(b) Provide that any proposed initiative measure that would amend the Constitution to increase the voter approval requirement to pass other state or local measures is effective only if the initiative is approved by the highest vote requirement it imposes on other measures;

(c) Constitutionally authorize local governments to submit questions to voters asking for their opinion on issues of governance;

now, therefore, be it

Resolved, That this measure shall be known, and may be cited, as the Protect and Retain the Majority Vote Act; and be it further

Resolved by the Assembly, the Senate concurring, That the Legislature of the State of California at its 2023-24 Regular Session, commencing on the fifth day of December 2022, two-thirds of the membership of each house concurring, hereby proposes to the people of the State of California that the Constitution of the State be amended as follows:

First—That Section 10 of Article II thereof is amended to read:

Sec. 10. (a) An initiative statute or referendum approved by the electors pursuant to Section 10.5 takes effect on the fifth day after the Secretary of State files the statement of the vote for the election at which the measure is voted on, but the measure may provide that it becomes operative after its effective date. If a referendum petition is filed against a part of a statute, the remainder of the statute shall not be delayed from going into effect.

(b) If provisions of two or more measures approved at the same election conflict, the provisions of the measure receiving the highest number of affirmative votes shall prevail.

(c) The Legislature may amend or repeal a referendum statute. The Legislature may amend or repeal an initiative statute by another statute that becomes effective only when approved by the electors unless the initiative statute permits amendment or repeal without the electors' approval.

(d) Before circulation of an initiative or referendum petition for signatures, a copy shall be submitted to the Attorney General who shall prepare a title and summary of the measure as provided by law.

(e) The Legislature shall provide for the manner in which a petition shall be circulated, presented, and certified, and the manner in which a measure shall be submitted to the electors.

Second—That Section 10.5 is added to Article II thereof, to read:

Sec. 10.5. (a) Except as provided in subdivision (b), a statewide initiative statute or referendum is approved if a majority of the votes cast on the measure are in favor.

(b) Notwithstanding Section 4 of Article XVIII or any other provision of the Constitution, an initiative measure that includes one or more provisions that amend the Constitution to increase the voter approval requirement to adopt any state or local measure is approved by the voters only if the proportion of votes cast in favor of the initiative measure is equal to or greater than the highest voter approval requirement that the initiative measure would impose for the adoption of any state or local measure.

(c) This section applies to all statewide initiative measures submitted to the electors on or after January 1, 2024, including measures that appear on the ballot at the same election at which the measure adding this section is approved by the electors.

Third—That Section 7.8 is added to Article XI thereof, to read:

Sec. 7.8. At any election, pursuant to procedures that the Legislature shall provide, a local governing body may hold an advisory vote concerning any issue of governance for the purpose of allowing voters within the jurisdiction to voice their opinions on the issue. An advisory question is approved only if a majority of the votes cast on the question are in favor. The results of the advisory vote shall in no manner be controlling on the sponsoring local governing body.

Fourth—The provisions of this measure are severable. If any portion, section, subdivision, paragraph, clause, sentence, phrase, word, or application of this measure is for any reason held to be invalid by a decision of any court of competent jurisdiction, that decision shall not affect the validity of the remaining portions of this measure. The people of the State of California hereby declare that they would have adopted this measure and each and every portion, section, subdivision, paragraph, clause, sentence, phrase, word, and application not declared invalid or unconstitutional without regard to whether any portion of this measure or application thereof would be subsequently declared invalid.

FILED in the office of the Secretary of State of the State of California NOV 02 2023`;

// Page-by-page breakdown for citations
const aca13Pages = [
  // Page 1 - Cover page
  `Assembly Constitutional Amendment No. 13

Adopted in Assembly September 14, 2023

Chief Clerk of the Assembly

Adopted in Senate

This resolution was received by the Secretary of State this 2nd day of November, 2023, at 10 o'clock A.M.

Deputy Secretary of State`,

  // Page 2 - Resolution and Legislative Counsel's Digest
  `ACA13 - 2 -

RESOLUTION CHAPTER __ _

Assembly Constitutional Amendment No. 13—A resolution to propose to the people of the State of California an amendment to the Constitution of the State, by amending Section 10 of, and adding Section 10.5 to, Article II thereof, and adding Section 7.8 to Article XI thereof, relating to voting.

LEGISLATIVE COUNSEL'S DIGEST

ACA 13, Ward. Voting thresholds.

The California Constitution provides that a proposed constitutional amendment and a statewide initiative measure each take effect only if approved by a majority of the votes cast on the amendment or measure.

This measure would further provide that an initiative measure that includes one or more provisions that would amend the Constitution to increase the voter approval requirement to adopt any state or local measure would be approved by the voters only if the proportion of votes cast in favor of the initiative measure is equal to or greater than the highest voter approval requirement that the initiative measure would impose. The measure would specify that this voter approval requirement would apply to statewide initiative measures that appear on the ballot on or after January 1, 2024.

The California Constitution also permits initiative and referendum powers to be exercised by the voters of each city or county under procedures provided by the Legislature.

This measure would expressly authorize a local governing body to hold an advisory vote concerning any issue of governance for the purpose of allowing voters within the jurisdiction to voice their opinions on the issue. The measure would specify that an advisory question is approved only if a majority of the votes cast on the question are in favor.

This measure would further declare that its provisions are severable and that if any provision is held invalid, the other provisions of the act remain valid, as specified.`,

  // Page 3 - WHEREAS clauses and Resolution start
  `- 3 - ACA13

WHEREAS, In an era of special interests and others attempting to manipulate the electoral process, it is important to preserve the fundamental right of California citizens to approve statewide initiative statutes and referenda by a majority vote; and

WHEREAS, Initiative measures proposing to amend the Constitution to increase the vote requirement above a majority vote to pass other state and local measures violate the principle of majority rule; and

WHEREAS, Citizens have a substantial interest in voicing their opinions on issues of local governance and must be allowed to approve local advisory measures by majority vote; and

WHEREAS, The provisions of this measure are not intended to reverse or invalidate provisions of the Constitution in effect before January 1, 2024, including the provisions of Proposition 13 of 1978; and

WHEREAS, The purpose of this measure is to do all of the following:

(a) Retain the majority vote requirement to pass statewide initiative statutes and referenda;

(b) Provide that any proposed initiative measure that would amend the Constitution to increase the voter approval requirement to pass other state or local measures is effective only if the initiative is approved by the highest vote requirement it imposes on other measures;

(c) Constitutionally authorize local governments to submit questions to voters asking for their opinion on issues of governance;

now, therefore, be it

Resolved, That this measure shall be known, and may be cited, as the Protect and Retain the Majority Vote Act; and be it further

Resolved by the Assembly, the Senate concurring, That the Legislature of the State of California at its 2023-24 Regular Session, commencing on the fifth day of December 2022, two-thirds of the membership of each house concurring, hereby proposes to the people of the State of California that the Constitution of the State be amended as follows:`,

  // Page 4 - Section 10 amendments
  `ACA13 - 4 -

First—That Section 10 of Article II thereof is amended to read:

Sec. 10. (a) An initiative statute or referendum approved by the electors pursuant to Section 10.5 takes effect on the fifth day after the Secretary of State files the statement of the vote for the election at which the measure is voted on, but the measure may provide that it becomes operative after its effective date. If a referendum petition is filed against a part of a statute, the remainder of the statute shall not be delayed from going into effect.

(b) If provisions of two or more measures approved at the same election conflict, the provisions of the measure receiving the highest number of affirmative votes shall prevail.

(c) The Legislature may amend or repeal a referendum statute. The Legislature may amend or repeal an initiative statute by another statute that becomes effective only when approved by the electors unless the initiative statute permits amendment or repeal without the electors' approval.

(d) Before circulation of an initiative or referendum petition for signatures, a copy shall be submitted to the Attorney General who shall prepare a title and summary of the measure as provided by law.

(e) The Legislature shall provide for the manner in which a petition shall be circulated, presented, and certified, and the manner in which a measure shall be submitted to the electors.`,

  // Page 5 - Sections 10.5 and 7.8
  `- 5 - ACA13

Second—That Section 10.5 is added to Article II thereof, to read:

Sec. 10.5. (a) Except as provided in subdivision (b), a statewide initiative statute or referendum is approved if a majority of the votes cast on the measure are in favor.

(b) Notwithstanding Section 4 of Article XVIII or any other provision of the Constitution, an initiative measure that includes one or more provisions that amend the Constitution to increase the voter approval requirement to adopt any state or local measure is approved by the voters only if the proportion of votes cast in favor of the initiative measure is equal to or greater than the highest voter approval requirement that the initiative measure would impose for the adoption of any state or local measure.

(c) This section applies to all statewide initiative measures submitted to the electors on or after January 1, 2024, including measures that appear on the ballot at the same election at which the measure adding this section is approved by the electors.

Third—That Section 7.8 is added to Article XI thereof, to read:

Sec. 7.8. At any election, pursuant to procedures that the Legislature shall provide, a local governing body may hold an advisory vote concerning any issue of governance for the purpose of allowing voters within the jurisdiction to voice their opinions on the issue. An advisory question is approved only if a majority of the votes cast on the question are in favor. The results of the advisory vote shall in no manner be controlling on the sponsoring local governing body.`,

  // Page 6 - Severability and Filing
  `Fourth—The provisions of this measure are severable. If any portion, section, subdivision, paragraph, clause, sentence, phrase, word, or application of this measure is for any reason held to be invalid by a decision of any court of competent jurisdiction, that decision shall not affect the validity of the remaining portions of this measure. The people of the State of California hereby declare that they would have adopted this measure and each and every portion, section, subdivision, paragraph, clause, sentence, phrase, word, and application not declared invalid or unconstitutional without regard to whether any portion of this measure or application thereof would be subsequently declared invalid.

FILED in the office of the Secretary of State of the State of California NOV 02 2023

Attest:

Secretary of State`
];

// Demo measure based on ACA 13
export const demoMeasure: Measure = {
  _id: "demo-aca-13",
  measureNumber: "ACA 13",
  title: "Protect and Retain the Majority Vote Act",
  jurisdiction: {
    type: "state",
    name: "California",
    fipsCode: "06"
  },
  status: "upcoming",
  measureType: "Constitutional Amendment",
  officialTextUrl: "/sample_data/aca-13.pdf",
  fullText: aca13FullText,
  pages: aca13Pages,
  metadata: {
    title: "Assembly Constitutional Amendment No. 13",
    subject: "Assembly Constitutional Amendment No. 13",
    keywords: "\"Assembly Constitutional Amendment No. 13\"",
    producer: "Adobe Acrobat Pro (32-bit) 23 Paper Capture Plug-in",
    creationDate: "D:20231102122409-07'00'",
    modificationDate: "D:20231102160750-07'00'",
    pdfVersion: "1.6"
  },
  stats: {
    pageCount: 6,
    wordCount: aca13FullText.split(/\s+/).filter(w => w.length > 0).length,
    charCount: aca13FullText.length
  },
  textHash: "aca13_demo_hash_2023",
  sourceUrl: "https://www.sos.ca.gov/elections/ballot-measures/qualified-ballot-measures",
  sourceType: "ca-sos",
  firstSeenAt: Date.now(),
  lastUpdatedAt: Date.now(),
  scrapedAt: Date.now()
};

// Demo insights with citations referencing specific locations in the text
export const demoInsights: Insight[] = [
  {
    _id: "demo-insight-summary",
    measureId: "demo-aca-13",
    type: "summary",
    content: "ACA 13 would amend the California Constitution to require that any future ballot initiative seeking to increase voting thresholds (such as requiring a two-thirds majority instead of simple majority) must itself be approved by that same higher threshold. For example, an initiative requiring a two-thirds vote to pass future tax measures would need two-thirds voter approval to pass. The measure also authorizes local governments to hold advisory votes on governance issues, with results that are non-binding.",
    confidence: "high",
    citations: [
      {
        textSpan: "an initiative measure that includes one or more provisions that amend the Constitution to increase the voter approval requirement to adopt any state or local measure is approved by the voters only if the proportion of votes cast in favor of the initiative measure is equal to or greater than the highest voter approval requirement",
        startOffset: aca13FullText.indexOf("an initiative measure that includes"),
        endOffset: aca13FullText.indexOf("an initiative measure that includes") + 280,
        context: "Section 10.5(b) - The core mechanism requiring higher thresholds for threshold-increasing initiatives"
      },
      {
        textSpan: "a local governing body may hold an advisory vote concerning any issue of governance",
        startOffset: aca13FullText.indexOf("a local governing body may hold an advisory vote"),
        endOffset: aca13FullText.indexOf("a local governing body may hold an advisory vote") + 80,
        context: "Section 7.8 - Authorization for advisory votes"
      }
    ],
    generatedAt: Date.now(),
    model: "gpt-4",
    promptVersion: "1.0"
  },
  {
    _id: "demo-insight-fiscal",
    measureId: "demo-aca-13",
    type: "fiscal",
    content: "ACA 13 has no direct fiscal impact on state or local government. It does not allocate any funds, create new taxes, or require additional spending. The measure is procedural in nature, changing only how certain ballot initiatives are approved. Local governments may incur minimal administrative costs if they choose to conduct advisory votes, but these are optional and entirely at the discretion of local governing bodies.",
    confidence: "high",
    uncertaintyFlags: ["Actual costs for advisory votes would depend on frequency chosen by local governments"],
    citations: [
      {
        textSpan: "The results of the advisory vote shall in no manner be controlling on the sponsoring local governing body",
        startOffset: aca13FullText.indexOf("The results of the advisory vote shall in no manner be controlling"),
        endOffset: aca13FullText.indexOf("The results of the advisory vote shall in no manner be controlling") + 75,
        context: "Section 7.8 - Advisory votes are non-binding, implying they could be skipped without legal consequence"
      }
    ],
    generatedAt: Date.now(),
    model: "gpt-4",
    promptVersion: "1.0"
  },
  {
    _id: "demo-insight-legal-changes",
    measureId: "demo-aca-13",
    type: "legal_changes",
    content: "ACA 13 makes three key changes to the California Constitution: (1) Amends Article II, Section 10 to reference the new voting threshold rules; (2) Adds Article II, Section 10.5 establishing the majority-vote baseline and the higher-threshold requirement for initiatives that would increase voting thresholds; (3) Adds Article XI, Section 7.8 authorizing local advisory votes on governance issues. The measure applies to all statewide initiatives submitted on or after January 1, 2024, and includes an explicit severability clause.",
    confidence: "high",
    citations: [
      {
        textSpan: "Section 10 of Article II thereof is amended",
        startOffset: aca13FullText.indexOf("Section 10 of Article II thereof is amended"),
        endOffset: aca13FullText.indexOf("Section 10 of Article II thereof is amended") + 45,
        context: "First Amendment - Modifies existing Section 10"
      },
      {
        textSpan: "Section 10.5 is added to Article II",
        startOffset: aca13FullText.indexOf("Section 10.5 is added to Article II"),
        endOffset: aca13FullText.indexOf("Section 10.5 is added to Article II") + 40,
        context: "Second Amendment - Creates new Section 10.5 with threshold rules"
      },
      {
        textSpan: "Section 7.8 is added to Article XI",
        startOffset: aca13FullText.indexOf("Section 7.8 is added to Article XI"),
        endOffset: aca13FullText.indexOf("Section 7.8 is added to Article XI") + 38,
        context: "Third Amendment - Creates new Section 7.8 for advisory votes"
      },
      {
        textSpan: "This section applies to all statewide initiative measures submitted to the electors on or after January 1, 2024",
        startOffset: aca13FullText.indexOf("This section applies to all statewide initiative measures"),
        endOffset: aca13FullText.indexOf("This section applies to all statewide initiative measures") + 85,
        context: "Section 10.5(c) - Effective date provision"
      },
      {
        textSpan: "The provisions of this measure are severable",
        startOffset: aca13FullText.indexOf("The provisions of this measure are severable"),
        endOffset: aca13FullText.indexOf("The provisions of this measure are severable") + 50,
        context: "Fourth - Severability clause"
      }
    ],
    generatedAt: Date.now(),
    model: "gpt-4",
    promptVersion: "1.0"
  },
  {
    _id: "demo-insight-affected-groups",
    measureId: "demo-aca-13",
    type: "affected_groups",
    content: "Directly affected groups include: (1) Voters and advocacy organizations seeking to pass initiatives that would raise voting thresholds for future measures—they would face a higher bar to pass their own measure; (2) Local governments and their residents, as cities and counties gain explicit constitutional authority to conduct advisory votes on governance issues; (3) Businesses and interest groups that may benefit from or oppose higher voting thresholds in future initiatives. The measure explicitly protects existing constitutional provisions from before January 1, 2024, including Proposition 13 (1978).",
    confidence: "medium",
    uncertaintyFlags: ["Indirect effects on future initiative campaigns cannot be fully predicted"],
    citations: [
      {
        textSpan: "The provisions of this measure are not intended to reverse or invalidate provisions of the Constitution in effect before January 1, 2024, including the provisions of Proposition 13 of 1978",
        startOffset: aca13FullText.indexOf("The provisions of this measure are not intended to reverse"),
        endOffset: aca13FullText.indexOf("The provisions of this measure are not intended to reverse") + 140,
        context: "WHEREAS clause - Grandfathering of existing provisions"
      },
      {
        textSpan: "local governing body may hold an advisory vote concerning any issue of governance for the purpose of allowing voters within the jurisdiction to voice their opinions",
        startOffset: aca13FullText.indexOf("local governing body may hold an advisory vote concerning any issue of governance"),
        endOffset: aca13FullText.indexOf("local governing body may hold an advisory vote concerning any issue of governance") + 120,
        context: "Section 7.8 - Local governments gain new authority"
      }
    ],
    generatedAt: Date.now(),
    model: "gpt-4",
    promptVersion: "1.0"
  },
  {
    _id: "demo-insight-conflicts",
    measureId: "demo-aca-13",
    type: "conflicts",
    content: "Potential conflicts or tensions: (1) Article XVIII, Section 4 of the California Constitution currently governs the initiative process—ACA 13 adds language 'Notwithstanding Section 4 of Article XVIII' to ensure its provisions take precedence; (2) The advisory vote provision (Section 7.8) is permissive, not mandatory, so no conflict with existing local government authority, but could create political pressure on local officials if advisory votes show strong public sentiment contrary to official actions; (3) Courts may need to interpret what constitutes 'increasing the voter approval requirement' in borderline cases.",
    confidence: "medium",
    citations: [
      {
        textSpan: "Notwithstanding Section 4 of Article XVIII or any other provision of the Constitution",
        startOffset: aca13FullText.indexOf("Notwithstanding Section 4 of Article XVIII"),
        endOffset: aca13FullText.indexOf("Notwithstanding Section 4 of Article XVIII") + 70,
        context: "Section 10.5(b) - Override of conflicting constitutional provisions"
      },
      {
        textSpan: "The results of the advisory vote shall in no manner be controlling on the sponsoring local governing body",
        startOffset: aca13FullText.indexOf("The results of the advisory vote shall in no manner be controlling"),
        endOffset: aca13FullText.indexOf("The results of the advisory vote shall in no manner be controlling") + 75,
        context: "Section 7.8 - Non-binding nature prevents direct legal conflicts"
      }
    ],
    generatedAt: Date.now(),
    model: "gpt-4",
    promptVersion: "1.0"
  }
];

// Demo election data
export const demoElection: Election = {
  _id: "demo-election-2024-march",
  date: new Date("2024-03-05").getTime(),
  type: "primary",
  year: 2024,
  jurisdictions: ["California"]
};

// Helper function to get insight by type
export function getInsightByType(type: Insight['type']): Insight | undefined {
  return demoInsights.find(insight => insight.type === type);
}

// Helper function to get all insights for a measure
export function getInsightsForMeasure(measureId: string): Insight[] {
  return demoInsights.filter(insight => insight.measureId === measureId);
}

// Helper function to find citation page
export function findCitationPage(citation: Citation): number {
  let charCount = 0;
  for (let i = 0; i < aca13Pages.length; i++) {
    const pageLength = aca13Pages[i].length + 2; // +2 for page break separator
    if (citation.startOffset >= charCount && citation.startOffset < charCount + pageLength) {
      return i + 1; // 1-indexed page numbers
    }
    charCount += pageLength;
  }
  return 1; // Default to page 1 if not found
}
