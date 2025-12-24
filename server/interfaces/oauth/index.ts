export interface AuthorizationRequest {
  client_id: string;
  redirect_uri: string;
  response_type: "code";
  scope?: string;
  state?: string;
  code_challenge: string;
  code_challenge_method: "S256" | "plain";
}

export interface AuthorizationResponse {
  code: string;
  state?: string;
}

export interface AuthorizationPostResponse {
  redirect_uri: string;
}

export interface TokenRequest {
  grant_type: "authorization_code" | "refresh_token";
  code?: string;
  redirect_uri?: string;
  client_id: string;
  client_secret: string;
  code_verifier?: string;
  refresh_token?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number; 
  refresh_token: string;
  scope: string;
  user_id?: string; 
}

export interface OAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

