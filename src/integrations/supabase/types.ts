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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      aoo_amendment_queue: {
        Row: {
          batch_sent_at: string | null
          company_id: string
          company_name: string
          created_at: string
          id: string
          series_number: number
          status: string
        }
        Insert: {
          batch_sent_at?: string | null
          company_id: string
          company_name: string
          created_at?: string
          id?: string
          series_number: number
          status?: string
        }
        Update: {
          batch_sent_at?: string | null
          company_id?: string
          company_name?: string
          created_at?: string
          id?: string
          series_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "aoo_amendment_queue_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      banking_applications: {
        Row: {
          annual_revenue: string | null
          business_description: string | null
          company_country: string | null
          company_email: string | null
          company_name: string | null
          created_at: string | null
          handles_third_party_funds: boolean | null
          id: string
          industry: string | null
          license_details: string | null
          needs_fiat_deposits: boolean | null
          needs_fiat_payouts: boolean | null
          needs_payroll: boolean | null
          payment_status: string | null
          people: Json | null
          registered_address: Json | null
          registration_number: string | null
          requires_license: boolean | null
          same_operating_address: boolean | null
          source_of_funds: string | null
          status: string | null
          stripe_session_id: string | null
          tax_number: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          annual_revenue?: string | null
          business_description?: string | null
          company_country?: string | null
          company_email?: string | null
          company_name?: string | null
          created_at?: string | null
          handles_third_party_funds?: boolean | null
          id?: string
          industry?: string | null
          license_details?: string | null
          needs_fiat_deposits?: boolean | null
          needs_fiat_payouts?: boolean | null
          needs_payroll?: boolean | null
          payment_status?: string | null
          people?: Json | null
          registered_address?: Json | null
          registration_number?: string | null
          requires_license?: boolean | null
          same_operating_address?: boolean | null
          source_of_funds?: string | null
          status?: string | null
          stripe_session_id?: string | null
          tax_number?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          annual_revenue?: string | null
          business_description?: string | null
          company_country?: string | null
          company_email?: string | null
          company_name?: string | null
          created_at?: string | null
          handles_third_party_funds?: boolean | null
          id?: string
          industry?: string | null
          license_details?: string | null
          needs_fiat_deposits?: boolean | null
          needs_fiat_payouts?: boolean | null
          needs_payroll?: boolean | null
          payment_status?: string | null
          people?: Json | null
          registered_address?: Json | null
          registration_number?: string | null
          requires_license?: boolean | null
          same_operating_address?: boolean | null
          source_of_funds?: string | null
          status?: string | null
          stripe_session_id?: string | null
          tax_number?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          archived_at: string | null
          banking_account_id: string | null
          banking_provider: string | null
          banking_status: string | null
          company_name: string
          company_type: string | null
          created_at: string
          deposit_amount: number | null
          ein_status: string | null
          enabled_services: Json | null
          external_provider_id: string | null
          formation_status: string | null
          formation_type: string | null
          id: string
          ipfs_hash: string | null
          ipfs_hash_aoo: string | null
          ipfs_hash_oa: string | null
          is_api_integrated: boolean | null
          jurisdiction: string | null
          kyc_status: string | null
          master_llc_name: string | null
          nft_explorer_url: string | null
          nft_id: string | null
          operating_agreement_status: string | null
          payment_method: string | null
          plan: string | null
          potential_revenue: number | null
          revenue_generated: number | null
          revocation_status: string | null
          series_name: string | null
          series_number: number | null
          smart_contract_address: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
          wyoming_filing_id: string | null
        }
        Insert: {
          archived_at?: string | null
          banking_account_id?: string | null
          banking_provider?: string | null
          banking_status?: string | null
          company_name: string
          company_type?: string | null
          created_at?: string
          deposit_amount?: number | null
          ein_status?: string | null
          enabled_services?: Json | null
          external_provider_id?: string | null
          formation_status?: string | null
          formation_type?: string | null
          id?: string
          ipfs_hash?: string | null
          ipfs_hash_aoo?: string | null
          ipfs_hash_oa?: string | null
          is_api_integrated?: boolean | null
          jurisdiction?: string | null
          kyc_status?: string | null
          master_llc_name?: string | null
          nft_explorer_url?: string | null
          nft_id?: string | null
          operating_agreement_status?: string | null
          payment_method?: string | null
          plan?: string | null
          potential_revenue?: number | null
          revenue_generated?: number | null
          revocation_status?: string | null
          series_name?: string | null
          series_number?: number | null
          smart_contract_address?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wyoming_filing_id?: string | null
        }
        Update: {
          archived_at?: string | null
          banking_account_id?: string | null
          banking_provider?: string | null
          banking_status?: string | null
          company_name?: string
          company_type?: string | null
          created_at?: string
          deposit_amount?: number | null
          ein_status?: string | null
          enabled_services?: Json | null
          external_provider_id?: string | null
          formation_status?: string | null
          formation_type?: string | null
          id?: string
          ipfs_hash?: string | null
          ipfs_hash_aoo?: string | null
          ipfs_hash_oa?: string | null
          is_api_integrated?: boolean | null
          jurisdiction?: string | null
          kyc_status?: string | null
          master_llc_name?: string | null
          nft_explorer_url?: string | null
          nft_id?: string | null
          operating_agreement_status?: string | null
          payment_method?: string | null
          plan?: string | null
          potential_revenue?: number | null
          revenue_generated?: number | null
          revocation_status?: string | null
          series_name?: string | null
          series_number?: number | null
          smart_contract_address?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wyoming_filing_id?: string | null
        }
        Relationships: []
      }
      compliance_filings: {
        Row: {
          agent_name: string | null
          category: string
          company_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          filing_name: string
          filing_type: string
          id: string
          method: string
          notes: string | null
          priority: string
          recurrence_interval: string | null
          recurring: boolean
          status: string
          updated_at: string
        }
        Insert: {
          agent_name?: string | null
          category?: string
          company_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          filing_name: string
          filing_type: string
          id?: string
          method?: string
          notes?: string | null
          priority?: string
          recurrence_interval?: string | null
          recurring?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          agent_name?: string | null
          category?: string
          company_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          filing_name?: string
          filing_type?: string
          id?: string
          method?: string
          notes?: string | null
          priority?: string
          recurrence_interval?: string | null
          recurring?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_filings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string
          display_order: number
          enabled: boolean
          id: string
          name: string
          period: string
          price_amount: number
          stripe_price_id: string
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          enabled?: boolean
          id: string
          name: string
          period?: string
          price_amount: number
          stripe_price_id: string
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          enabled?: boolean
          id?: string
          name?: string
          period?: string
          price_amount?: number
          stripe_price_id?: string
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_active_at: string | null
          last_name: string | null
          onboarding_completed: boolean | null
          onboarding_step: string | null
          signup_method: string | null
          updated_at: string
          user_id: string
          user_role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_active_at?: string | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          signup_method?: string | null
          updated_at?: string
          user_id: string
          user_role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_active_at?: string | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          signup_method?: string | null
          updated_at?: string
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      next_series_number: { Args: never; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
