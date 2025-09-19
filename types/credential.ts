export interface Credential {
  _id: string
  title: string
  issuer_name: string
  issue_date: string
  is_verified: boolean
  credential_data: {
    type: string
    description: string
    organization?: string
    issuer?: {
      name: string
      organization: string
    }
    recipient?: {
      name: string
      email: string
    }
    metadata?: {
      description?: string
      skills?: string[]
      category?: string
    }
  }
  verification_code?: string
  transaction_hash?: string
}
