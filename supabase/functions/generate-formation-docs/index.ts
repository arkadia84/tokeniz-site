import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ── Placeholder values for Phase 2 (wallet / NFT) ────── */
const PHASE2_WALLET = "0x0000000000000000000000000000000000000000";
const PHASE2_NFT = "pending-nft-mint";
const PHASE2_CONTRACT = "pending-deployment";

/* ── Registered Agent (hardcoded) ──────────────────────── */
const REGISTERED_AGENT = "Wyoming Registered Agent Services LLC";
const REGISTERED_AGENT_ADDRESS = "30 N Gould St Ste 100, Sheridan, WY 82801";

/* ── Master LLC info ───────────────────────────────────── */
const MASTER_LLC = "Tokenizio RWA LLC";
const MASTER_LLC_ADDRESS = "32 N Gould St, Sheridan, WY 82801";
const ORGANIZER = "MINT BLOCKS LLC";
const ORGANIZER_ADDRESS = "5830 E 2ND ST, STE 7000 #21992 CASPER, WY 82609";

/* ── Build plain-text document content ─────────────────── */

function buildSeriesOA(company: any, effectiveDate: string): string {
  const seriesNum = String(company.series_number).padStart(3, "0");
  const seriesTitle = `${MASTER_LLC} - Series ${seriesNum}`;

  return `
SERIES LIMITED LIABILITY COMPANY
OPERATING AGREEMENT

KEY AGREEMENT DETAILS:

SERIES NUMBER:            ${seriesTitle}, a series of a Wyoming limited liability company (the "Company")
EFFECTIVE DATE:           ${effectiveDate} UTC (the "Effective Date")
NFT ID:                   ${company.nft_id || PHASE2_NFT}
SMART CONTRACT ADDRESS:   ${PHASE2_CONTRACT}
MEMBER / MANAGER:         ${company.wallet_address || PHASE2_WALLET}
REGISTERED AGENT:         ${REGISTERED_AGENT}
                          ${REGISTERED_AGENT_ADDRESS}
MASTER LLC:               See Annexure 1
ARTICLES OF ORGANIZATION: See Annexure 2

This Operating Agreement (the "Agreement") is entered into by and among the Manager, the Members, and any other Persons who may subsequently become parties to this Agreement in accordance with its terms (collectively, the "Parties"). This Agreement governs the affairs and conduct of the Company.

ARTICLE 1: SERIES STRUCTURE AND FORMATION

1.1 Formation and Establishment
Pursuant to Wyo. Stat. § 17-29-211 and the Master LLC Operating Agreement (annexed as Annexure 1), the Company is constituted as a distinct Series under the Master LLC, with its own rights, obligations, and assets. This Series is governed by this Agreement and shall be treated as separate from any other Series formed under the Master LLC.

1.2 Legal Separation
Unless otherwise required by law or agreed by the Parties, the debts, liabilities, and obligations of this Series shall be enforceable only against the assets of this Series and not against any other Series or the Master LLC generally. Members of one Series have no ownership or governance rights over another Series unless independently acquired.

1.3 Smart Contract Authority
This Agreement is embedded in and executed through a smart contract deployed, as shown at the Key Agreement Details. Any amendments must be recorded on the Base mainnet in accordance with this Agreement. Blockchain signatures using associated private keys shall be legally binding.

1.4 Disclaimer of Liability by Master LLC
The Company, its Manager and Members accept the disclaimers in Schedule A and shall indemnify the Master LLC against any losses or claims resulting from activities of this Series.

1.5 Term
The Series shall exist from the Effective Date until dissolved pursuant to Article 11.

1.6 Principal Office and Agent
The Company shall maintain a principal office at such address designated by the Manager. The registered agent, if applicable, is shown at the Key Agreement Details.

1.7 Activities and Purpose
The Company is established to engage in lawful activities, including those contemplated under the Executed Agreements annexed as Annexure 4. The Manager has discretion to determine the scope of activities.

1.8 Tax Classification
The Company shall initially be treated as a disregarded entity for US federal income tax purposes unless the Manager elects otherwise. The Manager may elect partnership or corporate tax classification by filing the appropriate IRS forms.

ARTICLE 2: MEMBERSHIP AND NFT-BASED OWNERSHIP

2.1 Initial Member
The Member, as shown at Key Agreement Details, is the sole initial member of the Company, holding 100% of the membership interest, represented by the NFT identified in the Key Agreement Details.

2.2 NFT as Membership Certificate
The NFT serves as the digital certificate of membership. Ownership of the NFT constitutes proof of membership interest in the Company. Transfer of the NFT transfers the associated membership interest, subject to Article 5.

ARTICLE 3: MANAGEMENT

3.1 Manager-Managed
The Company shall be manager-managed. The initial Manager is the Member identified in the Key Agreement Details.

3.2 Authority of Manager
The Manager shall have full authority to manage the business and affairs of the Company, including the power to enter into contracts, open bank accounts, hire employees, and take all actions necessary for the Company's operations.

---
Generated by Tokenizio Platform on ${effectiveDate}
Series: ${seriesTitle}
Company Name: ${company.company_name}
Document Type: Series Operating Agreement
`.trim();
}

function buildMasterOA(company: any, effectiveDate: string): string {
  return `
MASTER OPERATING AGREEMENT FOR ${MASTER_LLC}
a Wyoming Limited Liability Company

KEY AGREEMENT DETAILS:

COMPANY:                  ${MASTER_LLC}, a Wyoming limited liability company ("Company")
MEMBER / MANAGER:         ${company.wallet_address || PHASE2_WALLET}
EFFECTIVE DATE:           ${effectiveDate} UTC (the "Effective Date")
MINTING WALLET:           ${company.wallet_address || PHASE2_WALLET}
SMART CONTRACT ADDRESS:   ${PHASE2_CONTRACT}
REGISTERED AGENT:         ${REGISTERED_AGENT}
                          ${REGISTERED_AGENT_ADDRESS}

ARTICLE 1 - Formation, Structure, and Governing Principles

1.2 Formation and Legal Standing
This Agreement is entered into by the Member (as shown at Key Agreement Details), as the sole member of the Company. The Company was duly formed by filing its Articles of Organization with the Wyoming Secretary of State pursuant to the Wyoming Limited Liability Company Act, Wyo. Stat. § 17-29-101 et seq. (the "Act").

1.3 Smart Contract Execution
This Agreement is embedded in and executed through a smart contract deployed on the Base blockchain network. The Agreement's terms are encoded and enforced via the smart contract logic, and actions taken through authorized blockchain transactions constitute valid contractual actions under this Agreement.

1.4 Name
The Company shall operate under the name "${MASTER_LLC}" or such other name as may be approved by the Manager and properly registered.

1.5 Purpose
The Company is organized for the purpose of engaging in any lawful business activity, including the formation and administration of protected series under the Wyoming Series LLC Act (Wyo. Stat. § 17-29-211).

1.6 Series Structure
The Company is authorized to establish one or more protected series, each with its own assets, obligations, and members, as provided under Wyo. Stat. § 17-29-211. Each series shall be governed by a separate Series Operating Agreement.

1.7 Principal Office
The principal office of the Company is located at: ${MASTER_LLC_ADDRESS}

1.8 Registered Agent
The registered agent of the Company is: ${REGISTERED_AGENT}, ${REGISTERED_AGENT_ADDRESS}

1.9 Term
The Company shall have a perpetual existence unless dissolved in accordance with Article 9.

---
Generated by Tokenizio Platform on ${effectiveDate}
Company: ${MASTER_LLC}
Series Member: ${company.company_name}
Document Type: Master Operating Agreement
`.trim();
}

function buildArticlesOfOrg(company: any, effectiveDate: string): string {
  const seriesNum = String(company.series_number).padStart(3, "0");

  return `
Wyoming Secretary of State

Series Limited Liability Company
Articles of Organization

I.
The name of the series limited liability company is: ${MASTER_LLC}

II.
The name and physical address of the registered agent of the series limited liability company is:
${REGISTERED_AGENT}
${REGISTERED_AGENT_ADDRESS}

III.
The mailing address of the series limited liability company is:
${MASTER_LLC_ADDRESS}

IV.
The principal office address of the series limited liability company is:
${MASTER_LLC_ADDRESS}

V.
The organizer of the series limited liability company is:
${ORGANIZER}
${ORGANIZER_ADDRESS}

VI.
Limitations on Liabilities:
The debts, obligations or other liabilities of the particular series, whether arising in contract, tort or otherwise, shall be enforceable against the assets of the series only and not against the assets of the limited liability company generally or any other series thereof or any member of the limited liability company.

VII.
Established Series:
Series ${seriesNum} - ${company.company_name}
Established on: ${effectiveDate}

---
Generated by Tokenizio Platform on ${effectiveDate}
Series: ${seriesNum}
Company: ${company.company_name}
Document Type: Articles of Organization (Reference Copy)

Note: This is a platform-generated reference document. The original Articles of Organization are filed with the Wyoming Secretary of State. Amendments for new series are filed within 30 days of creation via the registered agent.
`.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id } = await req.json();
    if (!company_id) {
      return new Response(
        JSON.stringify({ error: "company_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch company details
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", company_id)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const effectiveDate = new Date().toISOString().split("T")[0];
    const userId = company.user_id;
    const basePath = `${userId}/${company_id}`;

    // Generate document content
    const seriesOA = buildSeriesOA(company, effectiveDate);
    const masterOA = buildMasterOA(company, effectiveDate);
    const articlesOfOrg = buildArticlesOfOrg(company, effectiveDate);

    // Upload documents to storage bucket
    const encoder = new TextEncoder();

    const uploads = [
      {
        path: `${basePath}/series-operating-agreement.txt`,
        content: seriesOA,
        field: "ipfs_hash_oa",
      },
      {
        path: `${basePath}/master-operating-agreement.txt`,
        content: masterOA,
        field: "ipfs_hash_aoo",
      },
      {
        path: `${basePath}/articles-of-organization.txt`,
        content: articlesOfOrg,
        field: "ipfs_hash",
      },
    ];

    const urls: Record<string, string> = {};

    for (const doc of uploads) {
      const { error: uploadError } = await supabase.storage
        .from("formation-documents")
        .upload(doc.path, encoder.encode(doc.content), {
          contentType: "text/plain",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload error for ${doc.path}:`, uploadError);
        throw new Error(`Failed to upload ${doc.path}: ${uploadError.message}`);
      }

      // Generate a signed URL (valid 10 years for now — IPFS in Phase 2)
      const { data: signedData } = await supabase.storage
        .from("formation-documents")
        .createSignedUrl(doc.path, 60 * 60 * 24 * 365 * 10);

      urls[doc.field] = signedData?.signedUrl || doc.path;
    }

    // Update company record with document references
    await supabase
      .from("companies")
      .update({
        operating_agreement_status: "complete",
        ipfs_hash_oa: urls.ipfs_hash_oa,
        ipfs_hash_aoo: urls.ipfs_hash_aoo,
        ipfs_hash: urls.ipfs_hash,
      })
      .eq("id", company_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Formation documents generated and stored successfully.",
        company_id,
        documents: {
          series_operating_agreement: urls.ipfs_hash_oa,
          master_operating_agreement: urls.ipfs_hash_aoo,
          articles_of_organization: urls.ipfs_hash,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Document generation error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
