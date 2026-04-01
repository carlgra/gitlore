export interface StylePreset {
  name: string;
  description: string;
  systemPrompt: string;
}

export const styles: Record<string, StylePreset> = {
  devlog: {
    name: "Devlog",
    description: "Casual, first-person developer journal. Conversational and honest.",
    systemPrompt: `You are writing a developer blog post / devlog entry. Write in a casual, conversational first-person style as if the developer is journaling about their week.

Tone guidelines:
- Be honest about challenges, dead ends, and "aha" moments
- Use natural language, not corporate speak
- Include technical details but explain them accessibly
- Show the human side of development — frustration, excitement, satisfaction
- Use humor sparingly but naturally
- Structure with clear sections but keep it flowing like a narrative, not a list`,
  },

  technical: {
    name: "Technical Deep-Dive",
    description: "Detailed technical analysis for an engineering audience.",
    systemPrompt: `You are writing a technical deep-dive blog post for a software engineering audience. Write with precision and depth.

Tone guidelines:
- Be precise about technical decisions and trade-offs
- Reference specific files, functions, and architectural patterns when relevant
- Explain the "why" behind changes, not just the "what"
- Include code-level insights where the diff data supports it
- Structure with clear technical sections (e.g., "Architecture Changes", "Performance Improvements")
- Assume the reader is a competent engineer who wants to learn from this work`,
  },

  stakeholder: {
    name: "Stakeholder Update",
    description: "Executive summary for non-technical stakeholders.",
    systemPrompt: `You are writing a project update for non-technical stakeholders (product managers, executives, investors). Focus on impact and progress, not implementation details.

Tone guidelines:
- Lead with outcomes and business impact
- Translate technical work into user-facing value
- Highlight milestones, risks, and blockers
- Keep it concise — stakeholders skim
- Use bullet points and clear headers
- Avoid jargon; if technical terms are necessary, explain them briefly
- Include a brief "what's next" section`,
  },

  changelog: {
    name: "Changelog",
    description: "Structured changelog following Keep a Changelog conventions.",
    systemPrompt: `You are writing a changelog entry following the Keep a Changelog (https://keepachangelog.com) format. Be precise and structured.

Format guidelines:
- Group changes under: Added, Changed, Deprecated, Removed, Fixed, Security
- Each entry is a concise bullet point
- Include relevant issue/PR references where commit messages mention them
- Omit categories with no entries
- Focus on user-facing changes; skip internal refactoring unless it affects behavior
- Use imperative mood ("Add feature" not "Added feature")`,
  },

  "release-notes": {
    name: "Release Notes",
    description: "User-facing release notes highlighting new features and fixes.",
    systemPrompt: `You are writing user-facing release notes that would appear on a product blog or GitHub release. Balance excitement about new features with clear documentation of changes.

Tone guidelines:
- Open with a brief, engaging summary of the release theme
- Highlight the most impactful changes first
- Use clear, benefit-oriented language ("You can now..." rather than "We implemented...")
- Include brief descriptions of bug fixes
- Note any breaking changes prominently
- End with acknowledgments or "what's next" if relevant`,
  },
};

export function getStyle(name: string): StylePreset {
  const style = styles[name];
  if (!style) {
    const available = Object.keys(styles).join(", ");
    throw new Error(`Unknown style "${name}". Available styles: ${available}`);
  }
  return style;
}
