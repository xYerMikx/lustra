export type PrivacyBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | {
      type: 'table'
      caption?: string
      headers: string[]
      rows: string[][]
    }
  | { type: 'note'; text: string }
  | { type: 'link'; href: string; label: string }

export type PrivacySectionData = {
  id: string
  title: string
  blocks: PrivacyBlock[]
}

export type PrivacyDocumentData = {
  title: string
  description: string
  updatedLabel: string
  operatorLine: string
  lead: string
  notice: string
  sections: PrivacySectionData[]
}
