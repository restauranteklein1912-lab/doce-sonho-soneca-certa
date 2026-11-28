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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      babies: {
        Row: {
          birth_date: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      bedtime_checklist_days: {
        Row: {
          baby_id: string
          day: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          baby_id: string
          day: string
          id?: string
          item_id: string
          user_id?: string
        }
        Update: {
          baby_id?: string
          day?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bedtime_checklist_days_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bedtime_checklist_days_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "bedtime_checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      bedtime_checklist_items: {
        Row: {
          baby_id: string
          created_at: string
          id: string
          label: string
          position: number
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          id?: string
          label: string
          position?: number
          user_id?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          id?: string
          label?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bedtime_checklist_items_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_checkins: {
        Row: {
          created_at: string
          energy: number
          id: string
          note: string | null
          rest: number
          user_id: string
        }
        Insert: {
          created_at?: string
          energy: number
          id?: string
          note?: string | null
          rest: number
          user_id?: string
        }
        Update: {
          created_at?: string
          energy?: number
          id?: string
          note?: string | null
          rest?: number
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          article_slug: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_slug: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          article_slug?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      hotmart_events: {
        Row: {
          action: string
          email: string
          event: string
          event_id: string | null
          occurred_at: string
          outcome: string
          premium_until: string | null
          received_at: string
          transaction: string
        }
        Insert: {
          action: string
          email: string
          event: string
          event_id?: string | null
          occurred_at: string
          outcome: string
          premium_until?: string | null
          received_at?: string
          transaction: string
        }
        Update: {
          action?: string
          email?: string
          event?: string
          event_id?: string | null
          occurred_at?: string
          outcome?: string
          premium_until?: string | null
          received_at?: string
          transaction?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          baby_age_months: number | null
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          baby_age_months?: number | null
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          baby_age_months?: number | null
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      pending_premium: {
        Row: {
          email: string
          event: string | null
          is_premium: boolean
          premium_until: string | null
          updated_at: string
        }
        Insert: {
          email: string
          event?: string | null
          is_premium?: boolean
          premium_until?: string | null
          updated_at?: string
        }
        Update: {
          email?: string
          event?: string | null
          is_premium?: boolean
          premium_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_premium: boolean
          premium_until: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_premium?: boolean
          premium_until?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_premium?: boolean
          premium_until?: string | null
        }
        Relationships: []
      }
      routines: {
        Row: {
          baby_id: string
          id: string
          items: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          baby_id: string
          id?: string
          items?: Json
          updated_at?: string
          user_id?: string
        }
        Update: {
          baby_id?: string
          id?: string
          items?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: true
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_logs: {
        Row: {
          baby_id: string
          created_at: string
          end_at: string | null
          fell_asleep_how: string | null
          id: string
          kind: string
          mood: string | null
          notes: string | null
          start_at: string
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          end_at?: string | null
          fell_asleep_how?: string | null
          id?: string
          kind: string
          mood?: string | null
          notes?: string | null
          start_at: string
          user_id?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          end_at?: string | null
          fell_asleep_how?: string | null
          id?: string
          kind?: string
          mood?: string | null
          notes?: string | null
          start_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_logs_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wakeups: {
        Row: {
          at: string
          baby_id: string
          created_at: string
          id: string
          notes: string | null
          sleep_log_id: string | null
          user_id: string
        }
        Insert: {
          at: string
          baby_id: string
          created_at?: string
          id?: string
          notes?: string | null
          sleep_log_id?: string | null
          user_id?: string
        }
        Update: {
          at?: string
          baby_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          sleep_log_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wakeups_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wakeups_sleep_log_id_fkey"
            columns: ["sleep_log_id"]
            isOneToOne: false
            referencedRelation: "sleep_logs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_pending_premium: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium: { Args: { _user_id: string }; Returns: boolean }
      process_hotmart_event: {
        Args: {
          _approved_at: string
          _email: string
          _event: string
          _event_id: string
          _occurred_at: string
          _offer: string
          _status: string
          _transaction: string
        }
        Returns: Json
      }
      reconcile_my_premium: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
