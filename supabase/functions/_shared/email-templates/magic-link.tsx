/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
  token,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Tokeniz login code{token ? `: ${token}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your login code</Heading>
        {token ? (
          <>
            <Text style={text}>
              Enter this code in the app to sign in to Tokeniz:
            </Text>
            <Section style={codeContainer}>
              <Text style={codeText}>{token}</Text>
            </Section>
            <Text style={smallText}>
              This code expires in 10 minutes. If you didn't request this, ignore this email.
            </Text>
          </>
        ) : (
          <>
            <Text style={text}>
              Click the button below to sign in to Tokeniz. This link will expire shortly.
            </Text>
            <Link style={button} href={confirmationUrl}>
              Sign In
            </Link>
          </>
        )}
        <Text style={footer}>
          If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#141a23', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#6b7080', lineHeight: '1.6', margin: '0 0 25px' }
const button = { backgroundColor: '#1a56db', color: '#ffffff', fontSize: '15px', borderRadius: '10px', padding: '14px 24px', textDecoration: 'none', fontWeight: '600' as const, display: 'inline-block' as const }
const codeContainer = { background: '#f4f4f5', borderRadius: '10px', padding: '20px', textAlign: 'center' as const, margin: '0 0 25px' }
const codeText = { fontSize: '36px', fontWeight: 'bold' as const, letterSpacing: '8px', color: '#141a23', margin: '0', fontFamily: "'SF Mono', 'Roboto Mono', monospace" }
const smallText = { fontSize: '13px', color: '#999999', margin: '0 0 25px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
