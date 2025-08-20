export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      fixtures: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          created_at: string | null
          home_score: number | null
          home_team_id: string | null
          id: string
          kickoff: string | null
          match_data: Json | null
          match_day: number | null
          referee_id: string | null
          status: string | null
          tournament_id: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          kickoff?: string | null
          match_data?: Json | null
          match_day?: number | null
          referee_id?: string | null
          status?: string | null
          tournament_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          kickoff?: string | null
          match_data?: Json | null
          match_day?: number | null
          referee_id?: string | null
          status?: string | null
          tournament_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      home_fields: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_fields_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          notification_data: Json | null
          notification_type: string | null
          read: boolean | null
          tournament_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          notification_data?: Json | null
          notification_type?: string | null
          read?: boolean | null
          tournament_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          notification_data?: Json | null
          notification_type?: string | null
          read?: boolean | null
          tournament_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          jersey_number: number | null
          member_data: Json | null
          member_type: string | null
          name: string
          position: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jersey_number?: number | null
          member_data?: Json | null
          member_type?: string | null
          name: string
          position?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jersey_number?: number | null
          member_data?: Json | null
          member_type?: string | null
          name?: string
          position?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_registrations: {
        Row: {
          approved_at: string | null
          created_at: string | null
          id: string
          requested_at: string | null
          status: Database["public"]["Enums"]["registration_status"] | null
          team_id: string
          tournament_id: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          id?: string
          requested_at?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          team_id: string
          tournament_id: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          id?: string
          requested_at?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          team_id?: string
          tournament_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          admin_user_id: string | null
          city: string | null
          colors: Json | null
          country: string | null
          created_at: string | null
          enrollment_status: string | null
          id: string
          invite_code: string | null
          logo_url: string | null
          name: string
          team_code: string | null
          team_data: Json | null
          tournament_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_user_id?: string | null
          city?: string | null
          colors?: Json | null
          country?: string | null
          created_at?: string | null
          enrollment_status?: string | null
          id?: string
          invite_code?: string | null
          logo_url?: string | null
          name: string
          team_code?: string | null
          team_data?: Json | null
          tournament_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string | null
          city?: string | null
          colors?: Json | null
          country?: string | null
          created_at?: string | null
          enrollment_status?: string | null
          id?: string
          invite_code?: string | null
          logo_url?: string | null
          name?: string
          team_code?: string | null
          team_data?: Json | null
          tournament_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          allowed_countries: string[] | null
          coverage: Database["public"]["Enums"]["coverage_type"] | null
          created_at: string | null
          description: string | null
          end_date: string | null
          enrollment_deadline: string | null
          id: string
          invite_codes: string[] | null
          max_teams: number | null
          name: string
          organizer_id: string | null
          restrict_by_country: boolean | null
          start_date: string | null
          status: string | null
          tournament_data: Json | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          allowed_countries?: string[] | null
          coverage?: Database["public"]["Enums"]["coverage_type"] | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          enrollment_deadline?: string | null
          id?: string
          invite_codes?: string[] | null
          max_teams?: number | null
          name: string
          organizer_id?: string | null
          restrict_by_country?: boolean | null
          start_date?: string | null
          status?: string | null
          tournament_data?: Json | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          allowed_countries?: string[] | null
          coverage?: Database["public"]["Enums"]["coverage_type"] | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          enrollment_deadline?: string | null
          id?: string
          invite_codes?: string[] | null
          max_teams?: number | null
          name?: string
          organizer_id?: string | null
          restrict_by_country?: boolean | null
          start_date?: string | null
          status?: string | null
          tournament_data?: Json | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          profile_data: Json | null
          role: string | null
          roles: Json | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          profile_data?: Json | null
          role?: string | null
          roles?: Json | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          profile_data?: Json | null
          role?: string | null
          roles?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_test_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_tournament_cascade: {
        Args: { tournament_id: string }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      test_admin_full_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          passed: boolean
          test_result: string
        }[]
      }
      test_anonymous_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          should_fail: boolean
          test_result: string
        }[]
      }
      test_team_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          passed: boolean
          test_result: string
        }[]
      }
      user_organizes_tournament: {
        Args: { tournament_id_param: string }
        Returns: boolean
      }
      user_owns_team: {
        Args: { team_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      coverage_type:
        | "international"
        | "regional"
        | "national"
        | "state"
        | "local"
      registration_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      coverage_type: [
        "international",
        "regional",
        "national",
        "state",
        "local",
      ],
      registration_status: ["pending", "approved", "rejected"],
    },
  },
} as const
