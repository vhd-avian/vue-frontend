export interface UserDto {
  id: string
  email: string
  full_name?: string
  fullName?: string
  avatar_url?: string
  avatarUrl?: string
  bio?: string | null
  phone_number?: string | null
  phoneNumber?: string | null
  global_role?: 'admin' | 'user' | string
  globalRole?: 'admin' | 'user' | string
  created_at?: string
  createdAt?: string
}

export interface AuthResponse {
  access_token?: string
  accessToken?: string
  token_type?: string
  tokenType?: string
  user: UserDto
}

export interface ProjectDto {
  id: string
  name: string
  key: string
  description?: string
  lead_user_id?: string
  leadUserId?: string
  is_archived?: boolean
  isArchived?: boolean
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
}

export interface ProjectCreateRequest {
  name: string
  key: string
  description?: string
  lead_user_id?: string
  leadUserId?: string
}

export interface ProjectUpdateRequest {
  name?: string
  description?: string
  is_archived?: boolean
  isArchived?: boolean
  lead_user_id?: string
  leadUserId?: string
}

export interface ProjectMemberDto {
  project_id?: string
  projectId?: string
  user_id?: string
  userId?: string
  role: 'admin' | 'lead' | 'member' | string
  user: UserDto
}

export interface ProjectMemberAddRequest {
  user_id?: string
  userId?: string
  role: string
}

export interface SprintDto {
  id: string
  project_id?: string
  projectId?: string
  name: string
  goal?: string | null
  start_date?: string | null
  startDate?: string | null
  end_date?: string | null
  endDate?: string | null
  is_active?: boolean
  isActive?: boolean
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
}

export interface SprintCreateRequest {
  name: string
  goal?: string | null
  start_date?: string | null
  startDate?: string | null
  end_date?: string | null
  endDate?: string | null
}

export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done'

export interface IssueDto {
  id: string
  title: string
  description?: string
  type: 'task' | 'bug' | 'story'
  status: IssueStatus
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest'
  story_points?: number | null
  storyPoints?: number | null
  assignee_id?: string | null
  assigneeId?: string | null
  reporter_id?: string
  reporterId?: string
  project_id?: string
  projectId?: string
  sprint_id?: string | null
  sprintId?: string | null
  parent_issue_id?: string | null
  parentIssueId?: string | null
  due_date?: string | null
  dueDate?: string | null
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  comments?: CommentDto[]
  attachments?: AttachmentDto[]
  assignee?: UserDto
  reporter?: UserDto
}

export interface IssueCreateRequest {
  title: string
  description?: string
  type: 'task' | 'bug' | 'story'
  status?: IssueStatus
  priority?: 'lowest' | 'low' | 'medium' | 'high' | 'highest'
  story_points?: number
  storyPoints?: number
  assignee_id?: string | null
  assigneeId?: string | null
  project_id?: string
  projectId?: string
  sprint_id?: string | null
  sprintId?: string | null
  parent_issue_id?: string
  due_date?: string
}

export interface CommentDto {
  id: string
  issue_id?: string
  issueId?: string
  author_id?: string
  authorId?: string
  content: string
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  author?: UserDto
}

export interface AttachmentDto {
  id: string
  issue_id?: string
  issueId?: string
  filename: string
  file_url?: string
  fileUrl?: string
  uploaded_by_id?: string
  uploadedById?: string
  uploaded_at?: string
  uploadedAt?: string
}
