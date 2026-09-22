/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface OnboardingConfirmationProps {
  firstName: string
  lastName: string
  email: string
  userRole: string
  companyName: string
  companyStructure: string
  plan: string
  walletAddress: string
  dashboardUrl: string
}

export const OnboardingConfirmationEmail = ({
  firstName = 'John',
  lastName = 'Doe',
  email = 'john@example.com',
  userRole = 'Founder',
  companyName = 'My Company',
  companyStructure = 'My Company, a Series of Tokenizio LLC',
  plan = 'Explorer',
  walletAddress = '0x7a3F...E4c2D',
  dashboardUrl = 'https://tokeniz.ai/dashboard',
}: OnboardingConfirmationProps) => {
  const shortWallet = walletAddress.length > 12
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : walletAddress

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your first crypto account is live — {companyName} is ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Congratulations, {firstName}! 🎉</Heading>
          <Text style={text}>
            <strong>Your first crypto account is live — that was quick!</strong>
          </Text>
          <Text style={text}>
            <strong>{companyName}</strong> has been successfully formed as a Wyoming Protected Series LLC under{' '}
            <Link href="https://tokeniz.ai" style={link}><strong>Tokeniz</strong></Link>.
            Your company's membership is now minted on-chain as an NFT on the Base network.
          </Text>

          {/* Company Summary */}
          <Section style={sectionBox}>
            <Text style={sectionTitle}>🏢 Your Company</Text>
            <Text style={detailRow}>
              <strong>Company Name:</strong> {companyName}
            </Text>
            <Text style={detailRow}>
              <strong>Legal Structure:</strong> {companyStructure}
            </Text>
            <Text style={detailRow}>
              <strong>Jurisdiction:</strong> Wyoming, USA
            </Text>
            <Text style={detailRow}>
              <strong>Plan:</strong> {plan}
            </Text>
          </Section>

          {/* Crypto Account */}
          <Section style={sectionBox}>
            <Text style={sectionTitle}>🔗 Your Crypto Account</Text>
            <Text style={detailRow}>
              <strong>Wallet Address:</strong>{' '}
              <span style={{ fontFamily: 'monospace' }}>{shortWallet}</span>
            </Text>
            <Text style={detailRow}>
              <strong>NFT Membership:</strong> Minted on Base Network ✓
            </Text>
            <Text style={detailRow}>
              <strong>USDC Support:</strong> Ready for transactions
            </Text>
          </Section>

          {/* Formation Documents */}
          <Section style={sectionBox}>
            <Text style={sectionTitle}>📋 Formation & Compliance</Text>
            <Text style={detailRow}>
              <strong>Operating Agreement:</strong> Generated & pinned to IPFS
            </Text>
            <Text style={detailRow}>
              <strong>EIN Filing:</strong> Submitted
            </Text>
            <Text style={detailRow}>
              <strong>Ownership:</strong> {firstName} {lastName} — 100% Owner
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA: Fiat Banking */}
          <Section style={ctaBox}>
            <Text style={ctaTitle}>💳 Next Step: Activate Your Fiat Bank Account</Text>
            <Text style={ctaText}>
              While we finalize your company's incorporation, get ahead by activating your US business bank account.
              <strong> Deposit $10,000 within 90 days</strong> to unlock exclusive advantages including
              reduced fees, priority support, and premium compliance services.
            </Text>
          </Section>

          <Button style={button} href={dashboardUrl}>
            Go to Dashboard
          </Button>

          <Text style={footer}>
            © {new Date().getFullYear()} Tokeniz. All rights reserved.
          </Text>
          <Text style={footer}>
            Questions? Reply to this email and we'll help you out.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OnboardingConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#141a23', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#6b7080', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#1a56db', textDecoration: 'underline' }
const sectionBox = {
  backgroundColor: '#f8f9fb',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '16px',
}
const sectionTitle = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#141a23',
  margin: '0 0 12px',
}
const detailRow = {
  fontSize: '14px',
  color: '#6b7080',
  lineHeight: '1.5',
  margin: '0 0 6px',
}
const ctaBox = {
  backgroundColor: '#eef3ff',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '24px',
  borderLeft: '4px solid #1a56db',
}
const ctaTitle = {
  fontSize: '15px',
  fontWeight: '600' as const,
  color: '#141a23',
  margin: '0 0 8px',
}
const ctaText = {
  fontSize: '14px',
  color: '#6b7080',
  lineHeight: '1.6',
  margin: '0',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const button = {
  backgroundColor: '#1a56db',
  color: '#ffffff',
  fontSize: '15px',
  borderRadius: '10px',
  padding: '14px 24px',
  textDecoration: 'none',
  fontWeight: '600' as const,
  display: 'block' as const,
  textAlign: 'center' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
