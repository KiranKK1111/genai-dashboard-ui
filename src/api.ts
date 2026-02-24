import axios from "axios";

/**
 * API helper module.
 *
 * This module centralises HTTP interactions with the backend. It
 * exposes functions for all API endpoints as defined in routes.py.
 * All authenticated endpoints include the JWT token in the Authorization header.
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_URL,
});

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  created_at: string;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface NewSessionRequest {
  // No parameters needed - uses current_user from auth
}

export interface NewSessionResponse {
  success: boolean;
  session_id: string;
}

export interface SessionSummary {
  session_id: string;
  created_at: string;
}

export interface SessionsResponse {
  user_id: string;
  sessions: SessionSummary[];
}

// ============================================================================
// MESSAGE & HISTORY TYPES
// ============================================================================

export interface MessageSchema {
  response_type?: string;
  query?: string;
  queried_at?: string;
  responded_at?: string;
  response?: {
    type?: string;
    intent?: string;
    message?: string;
    confidence?: number;
    [key: string]: any;
  };
  created_at: string;
  // Legacy format support
  role?: "user" | "assistant";
  content?: string;
  response_metadata?: any;
}

export interface SessionHistoryResponse {
  session_id: string;
  messages: MessageSchema[];
}

// ============================================================================
// DECISION ENGINE TYPES (New Architecture)
// ============================================================================

export type DecisionType = "RUN_SQL" | "ANALYZE_FILES" | "CHAT";

export interface DecisionRouting {
  decision: DecisionType;
  confidence: number;
  reasoning?: string;
}

export interface SchemaMetadata {
  tables_discovered?: number;
  table_names?: string[];
  primary_table?: string;
  relevant_columns?: string[];
}

export interface ParsingMetadata {
  entities_found?: Array<{
    name: string;
    type: string;
    confidence: number;
  }>;
  intent?: string;
  filters?: Record<string, any>;
  ambiguities?: string[];
}

export interface QueryExecutionMetadata {
  execution_time_ms?: number;
  rows_returned?: number;
  sql_generated?: string;
  parameterized?: boolean;
  safety_validated?: boolean;
  warnings?: string[];
}

// ============================================================================
// QUERY & RESPONSE TYPES
// ============================================================================

export interface FileInfo {
  filename: string;
  size: number;
}

export interface FileQueryResponse {
  intent: string;
  confidence: string;
  message: string;
  files?: FileInfo[];
  related_queries?: string[];
  metadata?: Record<string, any>;
}

export interface DataQueryResponse {
  intent: string;
  confidence: string;
  data?: any[];
  visualization_type?: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface StandardResponse {
  intent: string;
  confidence: string;
  message: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// INTELLIGENT MODAL RESPONSE TYPES (Deep Learning)
// ============================================================================

export type ConfidenceLevel = 'VERY_CONFIDENT' | 'CONFIDENT' | 'MODERATE' | 'LOW' | 'VERY_LOW';

export interface QueryResult {
  rows?: any[];
  row_count?: number;
  columns?: string[];
  summary?: string;
}

export interface IntelligentModalMetadata {
  intent?: string;
  query_type?: string;
  analysis?: {
    semantic_score?: number;
    pattern_match?: number;
    thinking_steps?: number;
  };
  clarifying_question?: string;
  warnings?: string[];
  improvements?: string[];
  anomalies_detected?: number;
  execution_time_ms?: number;
}

export interface ClarifyingQuestion {
  type?: 'binary' | 'multiple_choice' | 'missing_parameter' | 'value_input' | 'entity_disambiguation' | string;
  question: string;
  options?: string[];
  required_field?: string;
  input_type?: 'number' | 'string' | 'date';
}

export interface ClarifyingQuestionConfirmRequest {
  original_query: string;
  user_confirmation: string;
  session_id?: string;
}

// The confirm endpoint returns the full query response with results
export interface ClarifyingQuestionConfirmResponse extends IntelligentModalResponse {
  // Inherits: success, sql, data, visualizations, message, metadata, etc.
}

export interface IntelligentModalResponse {
  success: boolean;
  query_type?: 'DATABASE_QUERY' | 'FILE_ANALYSIS';
  results?: QueryResult;
  confidence_score: number;  // 0-1 float
  confidence_level: ConfidenceLevel;
  risk_score: number;  // 0-1 float
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message?: string;
  metadata?: IntelligentModalMetadata;
  warnings?: string[];
  improvements?: string[];
  related_queries?: string[];
  clarifying_question?: string | ClarifyingQuestion | null;
}

// ============================================================================
// VISUALIZATION TYPES
// ============================================================================

export interface VisualizationConfig {
  primary_view?: 'pie' | 'bar' | 'line' | 'table' | 'scatter';
  available_views?: ('pie' | 'bar' | 'line' | 'table' | 'scatter')[];
}

export interface Visualization {
  chart_id: string;
  type: 'pie' | 'bar' | 'line' | 'table' | 'scatter' | 'multi_viz' | string;
  title?: string;
  subtitle?: string;
  description?: string;
  emoji?: string;
  config?: VisualizationConfig;
  show_raw_data?: boolean;
  exportable?: boolean;
  full_screen_enabled?: boolean;
  data?: any[];
}

// ============================================================================
// DYNAMIC RESPONSE TYPES (ChatGPT-like)
// ============================================================================

export interface DynamicResponse {
  type: "data_query" | "file_query" | "file_lookup" | "config_update" | "standard" | "refinement" | "error";
  success?: boolean;
  sql?: string;
  intent: string;
  confidence: number;
  message: string;
  data?: any[];
  visualizations?: Visualization[];
  related_queries?: string[];
  clarifying_question?: string | null;
  error?: string | null;
  recovered?: boolean;
  decision_routing?: DecisionRouting;
  // New fields from backend response structure
  assistant?: {
    role?: string;
    title?: string | null;
    content?: Array<{
      type: 'paragraph' | 'table' | 'bullets' | 'numbered' | 'callout' | 'code';
      text?: string;
      items?: string[];
      emoji?: string;
      variant?: string;
      headers?: string[];
      rows?: (string | number)[][];
      language?: string;
    }>;
  };
  followups?: Array<{ id: string; text: string }>;
  routing?: {
    type: string;
    intent: string;
    confidence: number;
  };
  artifacts?: {
    sql?: string | null;
    citations?: any[];
    files_used?: any[];
  };
  metadata?: {
    // Legacy fields
    row_count?: number;
    execution_time_ms?: number;
    column_names?: string[];
    data_types?: Record<string, string>;
    confidence_score?: number;
    confidence_level?: string;
    complexity_score?: number;
    
    // New architecture fields
    decision_type?: DecisionType;
    decision_confidence?: number;
    schema_metadata?: SchemaMetadata;
    parsing_metadata?: ParsingMetadata;
    query_execution?: QueryExecutionMetadata;
    analysis?: {
      intent?: string;
      operations?: string[];
      entities?: Array<{ name: string; type: string; confidence: number }>;
      reasoning?: string;
      complexity?: number;
    };
    query_type?: string;
    reasoning?: string;
    is_refinement?: boolean;
    [key: string]: any;
  };
}

export interface DynamicResponseWrapper {
  success: boolean;
  response: DynamicResponse;
  timestamp?: number | string;
  original_query?: string;
}

// Union type for all possible response types
export type ApiResponse =
  | FileQueryResponse
  | DataQueryResponse
  | StandardResponse;

export interface ResponseWrapper {
  success: boolean;
  response: ApiResponse;
  timestamp: string;
  original_query: string;
}

// ============================================================================
// CAPABILITIES & EXAMPLES TYPES
// ============================================================================

export interface VisualizationType {
  name: string;
  description: string;
}

export interface ResponseType {
  name: string;
  description: string;
  visualizations: VisualizationType[];
}

export interface CapabilitiesResponse {
  response_types: ResponseType[];
  supported_file_types: string[];
}

export interface ExamplesResponse {
  standard: string;
  data_query: string;
  file_query: string;
  file_lookup: string;
  config_update: string;
}

// ============================================================================
// HEALTH CHECK TYPES
// ============================================================================

export interface HealthResponse {
  status: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create authorization headers for authenticated requests.
 */
function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * We intentionally accept broader input types because UI code often passes:
 * - FileList (from <input type="file" />)
 * - File[]
 * - accidental strings (e.target.value) => we must catch this
 */
type UploadInput =
  | File[]
  | FileList
  | Array<File | Blob | string | null | undefined>
  | null
  | undefined;

function normalizeFiles(input: UploadInput): Array<File | Blob> {
  if (!input) return [];

  // Convert FileList -> File[]
  const arr: any[] =
    input instanceof FileList ? Array.from(input) : Array.isArray(input) ? input : [];

  // Filter out null/undefined
  const cleaned = arr.filter((x) => x != null);

  // Validate: must be File or Blob (browser uploadable)
  const bad = cleaned.filter(
    (x) => !(x instanceof File) && !(x instanceof Blob)
  );

  if (bad.length > 0) {
    const preview = bad
      .slice(0, 5)
      .map((x) => ({
        type: typeof x,
        value: String(x).slice(0, 80),
      }));

    throw new Error(
      `Invalid files input. Expected File/Blob but received: ${JSON.stringify(
        preview
      )}`
    );
  }

  return cleaned as Array<File | Blob>;
}

// ============================================================================
// AUTHENTICATION API FUNCTIONS
// ============================================================================

/**
 * Register a new user.
 */
export async function registerUser(
  username: string,
  password: string
): Promise<UserResponse> {
  const res = await apiClient.post<UserResponse>("/api/dynamic/register", {
    username,
    password,
  });
  return res.data;
}

/**
 * Authenticate a user by sending their credentials to the backend.
 */
export async function loginUser(
  username: string,
  password: string
): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>("/api/dynamic/login", {
    username,
    password,
  });
  return res.data;
}

// ============================================================================
// SESSION MANAGEMENT API FUNCTIONS
// ============================================================================

/**
 * Create a new chat session for the current user.
 */
export async function createNewSession(
  token: string
): Promise<NewSessionResponse> {
  const res = await apiClient.post<NewSessionResponse>(
    "/api/dynamic/new_session",
    {},
    { headers: getAuthHeaders(token) }
  );
  return res.data;
}

/**
 * List all chat sessions for the current user.
 */
export async function listSessions(token: string): Promise<SessionsResponse> {
  const res = await apiClient.get<SessionsResponse>("/api/dynamic/sessions", {
    headers: getAuthHeaders(token),
  });
  return res.data;
}

/**
 * Retrieve chat history for a particular session.
 */
export async function getSessionHistory(
  token: string,
  sessionId: string
): Promise<SessionHistoryResponse> {
  const res = await apiClient.get<SessionHistoryResponse>(
    `/api/dynamic/history/${sessionId}`,
    { headers: getAuthHeaders(token) }
  );
  return res.data;
}

// ============================================================================
// QUERY API FUNCTIONS
// ============================================================================

/**
 * Send a user query with optional file uploads (Unified Endpoint).
 *
 * This endpoint uses the new modular backend architecture:
 * - DecisionEngine routes to SQL/FILES/CHAT intelligently
 * - EntityParser extracts intent and entities
 * - SchemaCatalog discovers database schema
 * - HybridMatcher finds relevant tables/columns
 * - SQLSafetyValidator ensures query safety
 *
 * This endpoint:
 * - Accepts multipart/form-data with query, optional session_id, and files
 * - Routes to appropriate handler based on query intent (database-agnostic)
 * - Returns structured response with metadata about the decision
 */
export async function sendQuery(
  token: string,
  sessionId: string,
  query: string,
  files?: UploadInput
): Promise<DynamicResponseWrapper> {
  const normalizedFiles = normalizeFiles(files);
  const formData = new FormData();
  
  formData.append("session_id", sessionId);
  formData.append("query", query);

  // Add files if present
  if (normalizedFiles.length > 0) {
    normalizedFiles.forEach((fileLike) => {
      formData.append("files", fileLike);
    });
  }

  const res = await apiClient.post<DynamicResponseWrapper>(
    "/api/dynamic/query",
    formData,
    {
      headers: {
        ...getAuthHeaders(token),
        // Do NOT set Content-Type manually; axios will set the correct boundary
      },
    }
  );

  return res.data;
}

// ============================================================================
// CAPABILITIES & EXAMPLES API FUNCTIONS
// ============================================================================

/**
 * Get supported visualization types and response types.
 */
export async function getCapabilities(
  token: string
): Promise<CapabilitiesResponse> {
  const res = await apiClient.get<CapabilitiesResponse>(
    "/api/dynamic/capabilities",
    { headers: getAuthHeaders(token) }
  );
  return res.data;
}

/**
 * Get example queries for each supported response type.
 */
export async function getExamples(token: string): Promise<ExamplesResponse> {
  const res = await apiClient.get<ExamplesResponse>(
    "/api/dynamic/examples",
    { headers: getAuthHeaders(token) }
  );
  return res.data;
}

// ============================================================================
// HEALTH CHECK API FUNCTION
// ============================================================================

/**
 * Simple health check endpoint.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const res = await apiClient.get<HealthResponse>("/api/dynamic/health");
  return res.data;
}

// ============================================================================
// BACKWARDS COMPATIBILITY WRAPPERS
// ============================================================================

/**
 * Send a chat message to the backend using the unified /query endpoint.
 * This is a wrapper around sendQuery for backward compatibility.
 */
export async function sendChatMessage(
  token: string,
  message: string,
  sessionId?: string | null,
  files?: UploadInput
): Promise<DynamicResponseWrapper> {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }
  return sendQuery(token, sessionId, message, files);
}

/**
 * Send a query with full context awareness.
 * This is an alias for sendQuery() for backward compatibility.
 *
 * The unified /query endpoint now handles:
 * - Decision routing (SQL vs FILES vs CHAT)
 * - Schema discovery and semantic matching
 * - Entity extraction and intent understanding
 * - Safety validation and parameterized queries
 */
export async function sendDynamicQuery(
  token: string,
  sessionId: string,
  query: string,
  files?: UploadInput
): Promise<DynamicResponseWrapper> {
  return sendQuery(token, sessionId, query, files);
}

