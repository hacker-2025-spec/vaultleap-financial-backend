export interface Auth0Payload {
  iss: string
  sub: string
  aud: string[]
  iat: number
  exp: number
  azp: string
  scope: string
  email: string
  roles_list: string[]
}
